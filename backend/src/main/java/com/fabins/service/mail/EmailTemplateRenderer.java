package com.fabins.service.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.regex.Pattern;

/**
 * Service responsible for loading, caching, safely interpolating, and generating
 * email template bodies.
 *
 * <h2>Key Features</h2>
 * <ul>
 *   <li><strong>In-Memory Caching:</strong> Classpath template files are read once
 *       and cached in memory to eliminate repeated disk and classpath stream I/O.</li>
 *   <li><strong>XSS &amp; HTML Injection Prevention:</strong> User-supplied values
 *       are automatically escaped via Spring's {@link HtmlUtils#htmlEscape(String)}
 *       while whitelisted raw keys (e.g. URLs) remain unescaped.</li>
 *   <li><strong>Plain-Text Generation:</strong> Generates a clean text/plain fallback
 *       body for multipart/alternative MIME emails, improving spam filter scoring
 *       and client accessibility.</li>
 * </ul>
 */
@Component
public class EmailTemplateRenderer {

    private static final Logger log = LoggerFactory.getLogger(EmailTemplateRenderer.class);

    private static final Pattern TAGS_PATTERN = Pattern.compile("<[^>]*>");
    private static final Pattern MULTI_NEWLINES_PATTERN = Pattern.compile("\\n{3,}");
    private static final Pattern MULTI_SPACES_PATTERN = Pattern.compile("[ \\t]+");

    /** Thread-safe cache holding loaded raw template content keyed by classpath resource path. */
    private final ConcurrentMap<String, String> templateCache = new ConcurrentHashMap<>();

    /**
     * Set of standard placeholder keys whose values should not be HTML-escaped
     * because they contain valid URLs or safe pre-constructed markup.
     */
    public static final Set<String> DEFAULT_RAW_KEYS = Set.of(
            "acknowledgeUrl"
    );

    /**
     * Renders a template by substituting placeholders with values.
     * All values except those in {@link #DEFAULT_RAW_KEYS} are HTML-escaped for security.
     *
     * @param resourcePath classpath location of the template, e.g. {@code templates/email/x.html}
     * @param values       key-value map where key corresponds to {@code {{key}}}
     * @return the fully interpolated HTML document
     */
    public String render(String resourcePath, Map<String, String> values) {
        return render(resourcePath, values, DEFAULT_RAW_KEYS);
    }

    /**
     * Renders a template by substituting placeholders with values, specifying which keys
     * must remain unescaped.
     *
     * @param resourcePath classpath location of the template
     * @param values       key-value map for placeholders
     * @param rawKeys      keys whose values must bypass HTML escaping (e.g. URLs)
     * @return the rendered HTML document
     */
    public String render(String resourcePath, Map<String, String> values, Set<String> rawKeys) {
        Objects.requireNonNull(resourcePath, "Template resourcePath cannot be null");
        String template = loadTemplate(resourcePath);

        if (values == null || values.isEmpty()) {
            return template;
        }

        Set<String> unescaped = rawKeys != null ? rawKeys : Collections.emptySet();

        for (Map.Entry<String, String> entry : values.entrySet()) {
            String key = entry.getKey();
            String rawVal = entry.getValue() != null ? entry.getValue() : "";
            String safeVal = unescaped.contains(key) ? rawVal : HtmlUtils.htmlEscape(rawVal);
            template = template.replace("{{" + key + "}}", safeVal);
        }

        return template;
    }

    /**
     * Generates a clean plain-text fallback representation from rendered HTML content.
     * Useful for building multipart/alternative MIME emails.
     *
     * @param html rendered HTML document
     * @return clean plain-text representation
     */
    public String generatePlainText(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }

        String text = html;

        // Strip HTML comments
        text = text.replaceAll("(?s)<!--.*?-->", "");
        // Strip style and script blocks entirely
        text = text.replaceAll("(?s)<style[^>]*>.*?</style>", "");
        text = text.replaceAll("(?s)<script[^>]*>.*?</script>", "");

        // Convert common block breaks to newlines
        text = text.replaceAll("(?i)<br\\s*/?>", "\n");
        text = text.replaceAll("(?i)</tr>", "\n");
        text = text.replaceAll("(?i)</p>", "\n\n");
        text = text.replaceAll("(?i)</div>", "\n");
        text = text.replaceAll("(?i)</h1>|</h2>|</h3>|</h4>", "\n\n");
        text = text.replaceAll("(?i)</li>", "\n");

        // Strip remaining HTML tags
        text = TAGS_PATTERN.matcher(text).replaceAll("");

        // Decode common HTML entities
        text = HtmlUtils.htmlUnescape(text);

        // Normalize whitespace and newlines
        text = MULTI_SPACES_PATTERN.matcher(text).replaceAll(" ");
        text = MULTI_NEWLINES_PATTERN.matcher(text).replaceAll("\n\n");

        return text.trim();
    }

    /**
     * Loads the raw template string from classpath or returns it from cache if previously loaded.
     * Supports graceful fallback between {@code -mail.html} and {@code -email.html} naming variations.
     */
    private String loadTemplate(String resourcePath) {
        return templateCache.computeIfAbsent(resourcePath, path -> {
            ClassPathResource resource = resolveResource(path);
            try (InputStream in = resource.getInputStream()) {
                log.debug("Loaded email template from classpath: {}", resource.getPath());
                return new String(in.readAllBytes(), StandardCharsets.UTF_8);
            } catch (IOException e) {
                throw new IllegalStateException("Email template missing from classpath: " + path, e);
            }
        });
    }

    private ClassPathResource resolveResource(String path) {
        ClassPathResource primary = new ClassPathResource(path);
        if (primary.exists()) {
            return primary;
        }
        if (path.endsWith("-mail.html")) {
            String alt = path.substring(0, path.length() - "-mail.html".length()) + "-email.html";
            ClassPathResource altRes = new ClassPathResource(alt);
            if (altRes.exists()) {
                return altRes;
            }
        } else if (path.endsWith("-email.html")) {
            String alt = path.substring(0, path.length() - "-email.html".length()) + "-mail.html";
            ClassPathResource altRes = new ClassPathResource(alt);
            if (altRes.exists()) {
                return altRes;
            }
        }
        return primary;
    }

    /**
     * Clears the template cache (useful in tests or hot reloading).
     */
    public void clearCache() {
        templateCache.clear();
    }
}
