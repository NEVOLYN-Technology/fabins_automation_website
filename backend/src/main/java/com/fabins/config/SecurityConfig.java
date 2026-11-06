package com.fabins.config;

import jakarta.servlet.http.HttpServletResponse;
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
            @org.springframework.beans.factory.annotation.Value("${SUPER_ADMIN_SHARED_PASSWORD:${SUPER_ADMIN_PASSWORD:}}") String superAdminSharedPassword,
            @org.springframework.beans.factory.annotation.Value("${SUPER_ADMIN_1_USERNAME:${FABINS_ADMIN_USERNAME:}}") String superAdmin1User,
            @org.springframework.beans.factory.annotation.Value("${SUPER_ADMIN_1_EMPLOYEE_ID:}") String superAdmin1EmpId,
            @org.springframework.beans.factory.annotation.Value("${SUPER_ADMIN_2_USERNAME:}") String superAdmin2User,
            @org.springframework.beans.factory.annotation.Value("${SUPER_ADMIN_2_EMPLOYEE_ID:}") String superAdmin2EmpId
    ) {
        InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();

        String rawPass = (superAdminSharedPassword != null && !superAdminSharedPassword.isBlank())
                ? superAdminSharedPassword
                : System.getenv("SUPER_ADMIN_SHARED_PASSWORD");

        if (rawPass == null || rawPass.isBlank()) {
            rawPass = System.getenv("SUPER_ADMIN_PASSWORD");
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
        String envUser1 = System.getenv("SUPER_ADMIN_1_USERNAME");
        if (envUser1 != null && !envUser1.isBlank()) rawUsers.add(envUser1);
        String envEmp1 = System.getenv("SUPER_ADMIN_1_EMPLOYEE_ID");
        if (envEmp1 != null && !envEmp1.isBlank()) rawUsers.add(envEmp1);
        String envUser2 = System.getenv("SUPER_ADMIN_2_USERNAME");
        if (envUser2 != null && !envUser2.isBlank()) rawUsers.add(envUser2);
        String envEmp2 = System.getenv("SUPER_ADMIN_2_EMPLOYEE_ID");
        if (envEmp2 != null && !envEmp2.isBlank()) rawUsers.add(envEmp2);

        for (String raw : rawUsers) {
            String clean = stripQuotes(raw);
            if (clean == null || clean.isBlank()) continue;
            if (!manager.userExists(clean)) {
                manager.createUser(User.withUsername(clean)
                        .password(encoded)
                        .roles("ADMIN", "SUPER_ADMIN")
                        .build());
            }
            String lower = clean.toLowerCase();
            if (!manager.userExists(lower)) {
                manager.createUser(User.withUsername(lower)
                        .password(encoded)
                        .roles("ADMIN", "SUPER_ADMIN")
                        .build());
            }
        }

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
        return new BCryptPasswordEncoder();
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
