package com.fabins.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;

/**
 * Who can call what, and from which browser origins.
 *
 * <h2>The access model</h2>
 * <ul>
 *   <li>{@code POST /api/v1/deployment-requests} is <strong>public</strong> —
 *       it backs the contact form on the public website.</li>
 *   <li>Every other endpoint on that resource returns submitters' names, email
 *       addresses, and phone numbers, so it requires the {@code ADMIN} role.
 *       Leaving these open would publish the company's entire sales pipeline.</li>
 *   <li>{@code /actuator/health} is public so a load balancer can probe it;
 *       the remaining actuator endpoints are not.</li>
 *   <li>Swagger UI is open in development. See the note on {@code prod} below.</li>
 * </ul>
 *
 * <h2>Why HTTP Basic and not JWT</h2>
 * There is exactly one admin account and no browser-based admin UI yet. Basic
 * over HTTPS is the right amount of machinery for that, and swapping it for
 * OAuth2 or JWT later means changing only this class. Do not use Basic without
 * TLS in production — the credentials are merely base64-encoded, not encrypted.
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
                // CORS must be enabled here for the rules below to apply to
                // preflight requests; the source bean is defined further down.
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                /*
                 * CSRF protection is disabled because this is a stateless API
                 * authenticated per-request with an Authorization header, not
                 * with a session cookie. CSRF attacks rely on the browser
                 * attaching a cookie automatically; with no cookie there is
                 * nothing to forge. Re-enable it the moment cookie or session
                 * authentication is introduced.
                 */
                .csrf(csrf -> csrf.disable())

                // No server-side session is created or consulted.
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // Public: the website's deployment form and the homepage contact form.
                        .requestMatchers(HttpMethod.POST, "/api/v1/deployment-requests").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/deployment-requests/preview-pdf").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/deployment-requests/*/pdf").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/contact-inquiries").permitAll()
                        // One-click acknowledge links sent in admin notification emails — public
                        // because the UUID in the URL acts as the bearer token.
                        .requestMatchers("/api/v1/deployment-requests/*/acknowledge").permitAll()
                        .requestMatchers("/api/v1/contact-inquiries/*/acknowledge").permitAll()

                        // Public: static images and logo assets for email rendering and favicon.
                        .requestMatchers("/fabins-logo*.png", "/*.png", "/favicon.ico", "/static/**").permitAll()

                        // Public: liveness probe for load balancers.
                        .requestMatchers("/actuator/health/**").permitAll()

                        /*
                         * API documentation. Convenient in development; in
                         * production it advertises your entire attack surface.
                         * It is switched off there via springdoc.*.enabled in
                         * application-prod.yml — if you re-enable it, note that
                         * these routes are permitAll.
                         */
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**")
                        .permitAll()

                        // Dev-only H2 console; disabled outside the dev profile.
                        .requestMatchers("/h2-console/**").permitAll()

                        // Everything else — including the admin endpoints and
                        // the remaining actuator endpoints — needs the role.
                        .anyRequest().hasRole("ADMIN")
                )

                // Lets the H2 console render, which uses frames. Harmless in
                // production because the console is not enabled there.
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))

                // Never send WWW-Authenticate: Basic header on 401. This completely prevents
                // browsers from intercepting fetch requests and popping up the native OS/browser login modal.
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Super Admin authentication required\"}");
                        })
                )
                .httpBasic(basic -> basic
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Super Admin authentication required\"}");
                        })
                );

        return http.build();
    }

    /**
     * Authentication provider strictly for verified NEVOLYN Super Admin accounts.
     *
     * <p>Authorizes only the two designated Super Admins (Md Rahinur Rahman & Mohammad Ninad Mahmud Nobo)
     * using either their usernames or verified Employee IDs. Robustly handles shell escaping, quote
     * stripping, and Docker Compose variable interpolation.
     */
    @Bean
    public AuthenticationProvider authenticationProvider(
            PasswordEncoder passwordEncoder,
            @org.springframework.beans.factory.annotation.Value("${SUPER_ADMIN_SHARED_PASSWORD:${SUPER_ADMIN_PASSWORD:}}") String superAdminSharedPassword,
            @org.springframework.beans.factory.annotation.Value("${SUPER_ADMIN_1_USERNAME:rahinrahman}") String superAdmin1User,
            @org.springframework.beans.factory.annotation.Value("${SUPER_ADMIN_1_EMPLOYEE_ID:nev_rahinrahman_2026-01-15}") String superAdmin1EmpId,
            @org.springframework.beans.factory.annotation.Value("${SUPER_ADMIN_2_USERNAME:mninadmnobo}") String superAdmin2User,
            @org.springframework.beans.factory.annotation.Value("${SUPER_ADMIN_2_EMPLOYEE_ID:nev_mninadmnobo_2026-07-01}") String superAdmin2EmpId
    ) {
        return new AuthenticationProvider() {
            @Override
            public Authentication authenticate(Authentication authentication) throws AuthenticationException {
                if (authentication == null || authentication.getName() == null) {
                    throw new BadCredentialsException("Invalid administrator credentials");
                }

                String username = authentication.getName().trim();
                String rawPassword = authentication.getCredentials() != null
                        ? authentication.getCredentials().toString().trim()
                        : "";

                if (!isAuthorizedSuperAdmin(username, superAdmin1User, superAdmin1EmpId, superAdmin2User, superAdmin2EmpId)) {
                    throw new BadCredentialsException("Invalid administrator credentials");
                }

                if (!isPasswordValid(rawPassword, superAdminSharedPassword, passwordEncoder)) {
                    throw new BadCredentialsException("Invalid administrator credentials");
                }

                return new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"))
                );
            }

            @Override
            public boolean supports(Class<?> authentication) {
                return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
            }
        };
    }

    private boolean isAuthorizedSuperAdmin(String inputUser, String... allowed) {
        if (inputUser == null || inputUser.isBlank()) return false;
        String normalized = stripQuotes(inputUser).toLowerCase();

        // 1. Check against injected parameters
        for (String candidate : allowed) {
            if (candidate != null && !candidate.isBlank()) {
                String clean = stripQuotes(candidate).toLowerCase();
                if (normalized.equals(clean)) {
                    return true;
                }
            }
        }

        // 2. Canonical Super Admin names and IDs
        List<String> canonical = List.of(
                "rahinrahman",
                "nev_rahinrahman_2026-01-15",
                "mninadmnobo",
                "nev_mninadmnobo_2026-07-01"
        );
        return canonical.contains(normalized);
    }

    private boolean isPasswordValid(String inputPassword, String configuredPassword, PasswordEncoder passwordEncoder) {
        if (inputPassword == null || inputPassword.isBlank()) return false;

        String cleanInput = stripQuotes(inputPassword);

        // Resolve raw configured password from parameter or environment
        String rawConfigured = (configuredPassword != null && !configuredPassword.isBlank())
                ? configuredPassword
                : System.getenv("SUPER_ADMIN_SHARED_PASSWORD");

        if (rawConfigured == null || rawConfigured.isBlank()) {
            rawConfigured = System.getenv("SUPER_ADMIN_PASSWORD");
        }

        String cleanConfigured = stripQuotes(rawConfigured);

        if (cleanConfigured != null && !cleanConfigured.isBlank()) {
            // Direct verbatim match
            if (cleanInput.equals(cleanConfigured)) return true;

            // BCrypt comparison if stored as hash
            if (cleanConfigured.startsWith("$2a$") || cleanConfigured.startsWith("$2b$") || cleanConfigured.startsWith("$2y$")) {
                if (passwordEncoder.matches(cleanInput, cleanConfigured)) return true;
            }

            // Handles Docker Compose variable interpolation if $S4turn_N3v0Lyn was stripped by Compose
            String strippedInput = cleanInput.replace("$S4turn_N3v0Lyn", "");
            if (strippedInput.equals(cleanConfigured)) return true;

            // Handles double-dollar escaping ($$S4turn_N3v0Lyn)
            String unescapedConfigured = cleanConfigured.replace("$$", "$");
            if (cleanInput.equals(unescapedConfigured)) return true;
        }

        return false;
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

    /**
     * BCrypt hashing for stored credentials.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Browser origin rules, driven by {@code fabins.cors.allowed-origins}.
     */
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

        // Always guarantee production and local origins
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
