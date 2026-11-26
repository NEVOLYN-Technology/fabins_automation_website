package com.fabins;

import com.fabins.config.ApiProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Entry point for the FABINS API.
 *
 * <p>
 * {@code @SpringBootApplication} enables component scanning for this package
 * and everything beneath it, which is why every other class lives under
 * {@code com.fabins}. A class placed outside this package is silently never
 * registered as a bean.
 *
 * <p>
 * {@code @EnableJpaAuditing} is what makes the {@code @CreatedDate} and
 * {@code @LastModifiedDate} fields on entities populate themselves.
 * {@code @EnableAsync} is what makes {@code @Async} on {@code EmailServiceImpl}
 * actually run off the request thread instead of being ignored.
 *
 * <h2>Running locally</h2>
 *
 * <pre>
 *   ./mvnw spring-boot:run
 * </pre>
 *
 * Then open <a href="http://localhost:8080/swagger-ui.html">the API docs</a>.
 *
 * <h2>Why {@code main} does more than call {@code SpringApplication.run}</h2>
 * Two environment problems have to be solved before any bean exists — a
 * developer-convenience {@code .env} loader, and a rewrite of the cloud
 * provider's PostgreSQL URL into a form the JDBC driver accepts. Both are
 * documented on their respective methods below, and in
 * {@code docs/CICD_AND_DEPLOYMENT.md}.
 */
@SpringBootApplication
@EnableAsync
@EnableJpaAuditing
@EnableConfigurationProperties(ApiProperties.class)
public class FabinsApplication {

    /**
     * Name of the injected property source. Chosen to be recognisable in an
     * {@code /actuator/env} dump or a startup log when diagnosing which source
     * a datasource property actually came from.
     */
    private static final String CLOUD_DB_PROPERTY_SOURCE = "fabinsCloudDatabaseProperties";

    /** Default PostgreSQL port, appended when the platform's URL omits one. */
    private static final String DEFAULT_POSTGRES_PORT = "5432";

    public static void main(String[] args) {
        loadDotEnv();

        SpringApplication app = new SpringApplication(FabinsApplication.class);
        app.addListeners(cloudDatabaseUrlNormaliser());
        app.run(args);
    }

    /**
     * Rewrites a PaaS-style PostgreSQL connection string into standard JDBC
     * properties, early enough that nothing ever sees the original.
     *
     * <h2>The problem</h2>
     * Render, Heroku, Railway and friends publish the database as a libpq URI:
     *
     * <pre>
     *   postgres://fabins_user:s3cret@dpg-abc123.oregon-postgres.render.com/fabins
     * </pre>
     *
     * The PostgreSQL JDBC driver accepts none of that. It requires a
     * {@code jdbc:postgresql://} scheme, and it does not read credentials from
     * the URL's userinfo section — they must arrive as separate
     * {@code username} / {@code password} properties. Handing the raw value to
     * {@code spring.datasource.url} fails at startup with
     * "Driver claims to not accept jdbcUrl".
     *
     * <h2>Why this listener, and why this event</h2>
     * {@link ApplicationEnvironmentPreparedEvent} fires after the
     * {@code Environment} is populated from OS environment variables and the
     * YAML files, but <em>before</em> the application context is created — so
     * before HikariCP builds a pool and before Flyway opens its first
     * connection. Doing the rewrite in a {@code @Bean}, an
     * {@code EnvironmentPostProcessor} registered late, or an
     * {@code @PostConstruct} is all too late: the datasource is one of the very
     * first things built.
     *
     * <p>The parsed values are added with
     * {@link org.springframework.core.env.MutablePropertySources#addFirst} so
     * they sit at the <em>highest</em> precedence — above the OS environment
     * variable they were derived from. Without {@code addFirst}, the original
     * unusable {@code DATABASE_URL} from the environment would still win.
     *
     * @return a listener that no-ops unless {@code DATABASE_URL} is present, so
     *         local development and the test profile are unaffected
     */
    private static ApplicationListener<ApplicationEnvironmentPreparedEvent> cloudDatabaseUrlNormaliser() {
        return event -> {
            ConfigurableEnvironment environment = event.getEnvironment();

            // Step 0 — bail out unless the platform actually gave us a URL.
            // Docker Compose and dev/test set spring.datasource.url directly and
            // must be left alone.
            String rawUrl = environment.getProperty("DATABASE_URL");
            if (rawUrl == null || rawUrl.isBlank()) {
                return;
            }

            String url = rawUrl.trim();
            Map<String, Object> properties = new HashMap<>();

            // Step 1 — strip any scheme, whichever of the three forms arrived.
            // Removing "jdbc:" first means an already-correct
            // "jdbc:postgresql://…" is handled by the same code path as a raw
            // "postgres://…", rather than needing a special case.
            if (url.startsWith("jdbc:")) {
                url = url.substring("jdbc:".length());
            }
            if (url.startsWith("postgres://")) {
                url = url.substring("postgres://".length());
            } else if (url.startsWith("postgresql://")) {
                url = url.substring("postgresql://".length());
            }

            // Step 2 — split off the userinfo section (user:pass@) if present.
            // These credentials must become separate properties: the JDBC driver
            // ignores them when they are embedded in the URL, which surfaces as a
            // baffling "password authentication failed" against a URL that
            // visibly contains the password.
            int atIndex = url.indexOf('@');
            if (atIndex >= 0) {
                String userInfo = url.substring(0, atIndex);
                url = url.substring(atIndex + 1);

                int colonIndex = userInfo.indexOf(':');
                if (colonIndex >= 0) {
                    String username = userInfo.substring(0, colonIndex);
                    String password = userInfo.substring(colonIndex + 1);

                    // Both spellings are written: the Spring property that the
                    // datasource binds, and the platform-style name that the
                    // ${DATABASE_USERNAME} placeholders in application-prod.yml
                    // fall back to.
                    properties.put("spring.datasource.username", username);
                    properties.put("DATABASE_USERNAME", username);
                    properties.put("spring.datasource.password", password);
                    properties.put("DATABASE_PASSWORD", password);
                }
            }

            // Step 3 — add the port when the platform omitted it. Render's
            // internal hostnames often carry no port; the driver does default to
            // 5432, but being explicit makes the logged URL diagnosable and
            // avoids surprises behind a connection pooler on a non-standard port.
            int slashIndex = url.indexOf('/');
            String hostAndPort = slashIndex >= 0 ? url.substring(0, slashIndex) : url;
            if (!hostAndPort.contains(":")) {
                String database = slashIndex >= 0 ? url.substring(slashIndex) : "";
                url = hostAndPort + ":" + DEFAULT_POSTGRES_PORT + database;
            }

            // Step 4 — reassemble as a driver-compatible URL.
            String jdbcUrl = "jdbc:postgresql://" + url;
            properties.put("spring.datasource.url", jdbcUrl);
            properties.put("DATABASE_URL", jdbcUrl);

            // Step 5 — install at the highest precedence. Safe to print: the
            // credentials were removed in step 2, so what remains is host and
            // database name only. Logged via System.out because no logging
            // system is initialised this early in the lifecycle.
            environment.getPropertySources()
                    .addFirst(new MapPropertySource(CLOUD_DB_PROPERTY_SOURCE, properties));
            System.out.println("[FABINS] Normalised cloud JDBC URL: " + jdbcUrl);
        };
    }

    /**
     * Loads a gitignored {@code .env} file into system properties so local
     * development needs no shell exports.
     *
     * <p>Looks for {@code ../.env} first (the repository root, which is where
     * the file lives when the API is started from {@code backend/}) and then
     * {@code ./.env}. Missing or unreadable files are ignored — this is a
     * convenience, and production supplies real environment variables.
     *
     * <p>Each key is set twice: verbatim ({@code SPRING_MAIL_PASSWORD}) and in
     * Spring's dotted form ({@code spring.mail.password}). System properties
     * outrank OS environment variables in Spring's precedence order, so a stale
     * variable left over in a terminal session cannot shadow the {@code .env}
     * file the developer is actually editing.
     */
    private static void loadDotEnv() {
        File envFile = new File("../.env");
        if (!envFile.exists()) {
            envFile = new File(".env");
        }
        if (!envFile.exists()) {
            return;
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();

                // Skip blanks, comments, and anything that is not a KEY=VALUE pair.
                int equalsIndex = line.indexOf('=');
                if (line.isEmpty() || line.startsWith("#") || equalsIndex < 0) {
                    continue;
                }

                String key = line.substring(0, equalsIndex).trim();
                String value = unquote(line.substring(equalsIndex + 1).trim());

                System.setProperty(key, value);
                System.setProperty(key.toLowerCase().replace('_', '.'), value);
            }
        } catch (IOException e) {
            System.out.println("[FABINS] Could not read " + envFile.getPath() + ": " + e.getMessage());
        }
    }

    /** Strips one layer of matching single or double quotes, if present. */
    private static String unquote(String value) {
        if (value.length() >= 2
                && ((value.startsWith("\"") && value.endsWith("\""))
                || (value.startsWith("'") && value.endsWith("'")))) {
            return value.substring(1, value.length() - 1);
        }
        return value;
    }
}