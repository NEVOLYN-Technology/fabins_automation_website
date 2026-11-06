package com.fabins.config;

import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;

/**
 * Access control and security configuration for FABINS API.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final ApiProperties properties;

    public SecurityConfig(ApiProperties properties) {
        this.properties = properties;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(HttpMethod.POST, "/api/v1/deployment-requests").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/deployment-requests/preview-pdf").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/deployment-requests/*/pdf").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/contact-inquiries").permitAll()
                        .requestMatchers("/api/v1/deployment-requests/*/acknowledge").permitAll()
                        .requestMatchers("/api/v1/contact-inquiries/*/acknowledge").permitAll()
                        .requestMatchers("/fabins-logo*.png", "/*.png", "/favicon.ico", "/static/**").permitAll()
                        .requestMatchers("/actuator/health/**").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        // Protected admin operations
                        .anyRequest().hasRole("ADMIN")
                )
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                        })
                )
                .httpBasic(basic -> basic
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                        })
                );

        return http.build();
    }

    /**
     * UserDetailsService managing Super Admin accounts dynamically from environment variables.
     * Strictly zero hardcoded usernames or passwords in code.
     */
    @Bean
    public UserDetailsService userDetailsService(
            PasswordEncoder passwordEncoder,
            @org.springframework.beans.factory.annotation.Value("${SUPER_ADMIN_SHARED_PASSWORD:${SUPER_ADMIN_PASSWORD:${FABINS_ADMIN_PASSWORD:}}}") String superAdminSharedPassword,
            @org.springframework.beans.factory.annotation.Value("${SUPER_ADMIN_1_USERNAME:}") String superAdmin1User,
            @org.springframework.beans.factory.annotation.Value("${SUPER_ADMIN_1_EMPLOYEE_ID:}") String superAdmin1EmpId,
            @org.springframework.beans.factory.annotation.Value("${SUPER_ADMIN_2_USERNAME:}") String superAdmin2User,
            @org.springframework.beans.factory.annotation.Value("${SUPER_ADMIN_2_EMPLOYEE_ID:}") String superAdmin2EmpId
    ) {
        Logger logger = LoggerFactory.getLogger(SecurityConfig.class);
        InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();

        String rawPass = (superAdminSharedPassword != null && !superAdminSharedPassword.isBlank())
                ? superAdminSharedPassword
                : System.getenv("SUPER_ADMIN_SHARED_PASSWORD");

        if (rawPass == null || rawPass.isBlank()) {
            rawPass = System.getenv("SUPER_ADMIN_PASSWORD");
        }
        if (rawPass == null || rawPass.isBlank()) {
            rawPass = System.getenv("FABINS_ADMIN_PASSWORD");
        }
        if (rawPass == null || rawPass.isBlank()) {
            try {
                if (properties != null && properties.admin() != null) {
                    rawPass = properties.admin().password();
                }
            } catch (Exception ignored) {
            }
        }

        String pass = stripQuotes(rawPass);
        if (pass == null || pass.isBlank()) {
            logger.warn("[FABINS Security] No admin password configured in environment!");
            return manager;
        }

        String encoded = passwordEncoder.encode(pass);

        // Strictly collect usernames and Employee IDs dynamically from .env configuration
        List<String> rawUsers = new ArrayList<>();
        if (superAdmin1User != null && !superAdmin1User.isBlank()) rawUsers.add(superAdmin1User);
        if (superAdmin1EmpId != null && !superAdmin1EmpId.isBlank()) rawUsers.add(superAdmin1EmpId);
        if (superAdmin2User != null && !superAdmin2User.isBlank()) rawUsers.add(superAdmin2User);
        if (superAdmin2EmpId != null && !superAdmin2EmpId.isBlank()) rawUsers.add(superAdmin2EmpId);

        // Direct OS environment fallback from .env
        String[] envKeys = {
            "SUPER_ADMIN_1_USERNAME",
            "SUPER_ADMIN_1_EMPLOYEE_ID",
            "SUPER_ADMIN_2_USERNAME",
            "SUPER_ADMIN_2_EMPLOYEE_ID",
            "FABINS_ADMIN_USERNAME"
        };
        for (String k : envKeys) {
            String val = System.getenv(k);
            if (val != null && !val.isBlank()) {
                rawUsers.add(val);
            }
        }

        List<String> registered = new ArrayList<>();
        for (String raw : rawUsers) {
            String clean = stripQuotes(raw);
            if (clean == null || clean.isBlank()) continue;
            if (!manager.userExists(clean)) {
                manager.createUser(User.withUsername(clean)
                        .password(encoded)
                        .roles("ADMIN", "SUPER_ADMIN")
                        .build());
                registered.add(clean);
            }
            String lower = clean.toLowerCase();
            if (!manager.userExists(lower)) {
                manager.createUser(User.withUsername(lower)
                        .password(encoded)
                        .roles("ADMIN", "SUPER_ADMIN")
                        .build());
                registered.add(lower);
            }
        }

        logger.info("[FABINS Security] Registered Super Admin users: {}", registered);
        logger.info("[FABINS Security] Super Admin Password initialized (length: {} chars)", pass.length());

        return manager;
    }

    private static String stripQuotes(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        int len = trimmed.length();
        if (len >= 2) {
            char first = trimmed.charAt(0);
            char last = trimmed.charAt(len - 1);
            if ((first == '\'' && last == '\'') || (first == '"' && last == '"')) {
                return trimmed.substring(1, len - 1).trim();
            }
        }
        return trimmed;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();
        return new PasswordEncoder() {
            @Override
            public String encode(CharSequence rawPassword) {
                return bcrypt.encode(rawPassword);
            }

            @Override
            public boolean matches(CharSequence rawPassword, String encodedPassword) {
                if (rawPassword == null || encodedPassword == null) {
                    return false;
                }
                // 1. Direct standard match
                if (bcrypt.matches(rawPassword, encodedPassword)) {
                    return true;
                }
                String raw = rawPassword.toString();
                // 2. Unquoted match
                String unquoted = stripQuotes(raw);
                if (unquoted != null && !unquoted.equals(raw) && bcrypt.matches(unquoted, encodedPassword)) {
                    return true;
                }
                // 3. Match $ vs $$ mismatch
                if (raw.contains("$")) {
                    String withDouble = raw.replace("$$", "$").replace("$", "$$");
                    if (bcrypt.matches(withDouble, encodedPassword)) {
                        return true;
                    }
                }
                if (raw.contains("$$")) {
                    String withSingle = raw.replace("$$", "$");
                    if (bcrypt.matches(withSingle, encodedPassword)) {
                        return true;
                    }
                }
                return false;
            }
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> origins = properties.cors().allowedOrigins();
        List<String> allowedPatterns = new ArrayList<>();
        if (origins != null) {
            for (String o : origins) {
                if (o != null && !o.isBlank()) {
                    allowedPatterns.add(stripQuotes(o));
                }
            }
        }

        allowedPatterns.add("https://fabins.nevolyn.com");
        allowedPatterns.add("https://www.fabins.nevolyn.com");
        allowedPatterns.add("https://nevolyn.com");
        allowedPatterns.add("https://www.nevolyn.com");
        allowedPatterns.add("http://localhost:*");
        allowedPatterns.add("http://127.0.0.1:*");

        configuration.setAllowedOriginPatterns(allowedPatterns);
        configuration.setAllowedMethods(List.of("GET", "POST", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setExposedHeaders(List.of("Location"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }
}
