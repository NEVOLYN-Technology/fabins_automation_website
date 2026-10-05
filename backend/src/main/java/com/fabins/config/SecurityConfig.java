package com.fabins.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
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

                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    /**
     * The single admin account, loaded from configuration.
     *
     * <p>In-memory is appropriate while there is one operator. When real user
     * management is needed, replace this bean with one backed by a database —
     * nothing else in the application refers to it.
     */
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
        ApiProperties.Admin admin = properties.admin();

        return new InMemoryUserDetailsManager(
                User.withUsername(admin.username())
                        .password(passwordEncoder.encode(admin.password()))
                        .roles("ADMIN")
                        .build()
        );
    }

    /**
     * BCrypt hashing for the stored credential.
     *
     * <p>Deliberately slow, which is what makes offline brute-forcing of a
     * leaked hash impractical. Never store or compare a password in plain text.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Browser origin rules, driven by {@code fabins.cors.allowed-origins}.
     *
     * <p>This is what allows the Next.js frontend on a different origin to call
     * the API. Without it the browser blocks the response — note that CORS is a
     * browser-enforced policy, so it is not a substitute for authentication;
     * anything outside a browser ignores it entirely.
     *
     * <h2>Patterns, not exact origins</h2>
     * {@code setAllowedOriginPatterns} is used rather than
     * {@code setAllowedOrigins}. The two differ in one decisive way: the
     * CORS specification forbids answering a credentialed request with
     * {@code Access-Control-Allow-Origin: *}, so Spring rejects the combination
     * of {@code setAllowedOrigins("*")} and {@code setAllowCredentials(true)} at
     * startup. Patterns sidestep that by matching the incoming {@code Origin}
     * header and echoing it back verbatim, which is both legal and safer than a
     * wildcard because the response names exactly one origin.
     *
     * <p>The practical payoff is that a configured value may contain a wildcard
     * segment — {@code https://*.vercel.app} keeps every Vercel preview
     * deployment working without redeploying the API for each one, and
     * {@code https://fabins.com} still behaves as an exact match. Matching is on
     * the full origin, so scheme, host and port must all agree:
     * {@code https://fabins.com} does <em>not</em> cover
     * {@code https://www.fabins.com}, and {@code http://} does not cover
     * {@code https://}. List both when both are served.
     *
     * <h2>Custom domain checklist</h2>
     * Set {@code FABINS_ALLOWED_ORIGIN} on the platform to the new site origin
     * and redeploy — this bean is built once at startup, so a change to the
     * variable does nothing until the service restarts. See the annotated block
     * in {@code application-prod.yml} for the full procedure.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // An empty list would otherwise mean "no origin may call the API",
        // which in a fresh deployment looks exactly like a broken frontend.
        // Falling back to "*" keeps the site working; every real environment
        // sets the list explicitly.
        List<String> origins = properties.cors().allowedOrigins();
        configuration.setAllowedOriginPatterns(
                origins != null && !origins.isEmpty() ? origins : List.of("*"));

        // OPTIONS is listed for clarity — it is the preflight method and Spring
        // handles it regardless. PUT and DELETE are absent because no endpoint
        // uses them; a method not listed here is refused by the browser.
        configuration.setAllowedMethods(List.of("GET", "POST", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept"));

        // Response headers are hidden from JavaScript unless exposed. This one
        // carries the URL of the newly created request returned by POST.
        configuration.setExposedHeaders(List.of("Location"));

        // Required for the browser to send the Authorization header on the
        // admin endpoints. See the note above on why this forces patterns.
        configuration.setAllowCredentials(true);

        // Cache the preflight result for an hour, so a visitor filling in the
        // contact form does not pay for an extra round-trip on submit.
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }
}
