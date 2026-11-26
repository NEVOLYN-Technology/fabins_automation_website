package com.fabins.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Describes the API for the generated OpenAPI document.
 *
 * <p>
 * springdoc discovers the endpoints, payloads, and status codes by scanning
 * the controllers, so this class only supplies what cannot be inferred: the
 * title, the description, and the authentication scheme.
 *
 * <p>
 * Once the app is running:
 * <ul>
 * <li>Interactive docs —
 * <a href="http://localhost:8080/swagger-ui.html">/swagger-ui.html</a></li>
 * <li>Raw specification —
 * <a href="http://localhost:8080/v3/api-docs">/v3/api-docs</a></li>
 * </ul>
 *
 * <p>
 * The raw document is worth saving into version control on each release: it
 * makes an accidental breaking change visible as a diff during review.
 */
@Configuration
public class OpenApiConfig {

        /** Referenced by name from {@code @SecurityRequirement} on the controllers. */
        private static final String BASIC_AUTH_SCHEME = "basicAuth";

        @Bean
        public OpenAPI fabinsOpenApi() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("FABINS API")
                                                .version("v1")
                                                .description("""
                                                                Backend for the FABINS product site.

                                                                Submitting a deployment request is public — it backs the \
                                                                contact form. Listing, reading, and updating requests \
                                                                exposes submitters' contact details and requires the admin \
                                                                credentials configured under `fabins.admin`.
                                                                """)
                                                .contact(new Contact()
                                                                .name("FABINS@NEVOLYN")
                                                                .email("fabins@nevolyn.com"))
                                                .license(new License().name("Proprietary")))

                                // Declares the scheme so Swagger UI shows an "Authorize" button.
                                .components(new Components()
                                                .addSecuritySchemes(BASIC_AUTH_SCHEME, new SecurityScheme()
                                                                .type(SecurityScheme.Type.HTTP)
                                                                .scheme("basic")
                                                                .description("Admin credentials for the protected endpoints")));
        }
}
