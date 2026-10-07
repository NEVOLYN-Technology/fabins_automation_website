package com.fabins.service.pdf;

import com.fabins.entity.DeploymentRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Enterprise HTML-to-PDF rendering builder for official FABINS deployment assessment reports.
 *
 * <p>Loads the dedicated XHTML/CSS template from {@code templates/pdf/deployment-assessment.html},
 * interpolates dynamic customer input data safely, and compiles the document into an executive A4 PDF.
 */
@Component
public class DeploymentAssessmentPdfBuilder {

    private static final Logger log = LoggerFactory.getLogger(DeploymentAssessmentPdfBuilder.class);

    private static final String TEMPLATE_PATH = "templates/pdf/deployment-assessment.html";

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter
            .ofPattern("dd MMMM yyyy, HH:mm 'UTC'")
            .withZone(ZoneId.of("UTC"));

    private final ConcurrentMap<String, String> templateCache = new ConcurrentHashMap<>();

    /**
     * Builds and compiles the assessment report from the HTML template into a PDF byte array.
     */
    public byte[] build(DeploymentRequest request) {
        try {
            String html = renderHtmlTemplate(request);
            return renderPdfFromHtml(html);
        } catch (Exception e) {
            log.error("Failed to render HTML deployment assessment PDF for reference: {}", request.getReferenceCode(), e);
            throw new IllegalStateException("PDF compilation error from HTML template", e);
        }
    }

    private String renderHtmlTemplate(DeploymentRequest request) {
        String template = templateCache.computeIfAbsent(TEMPLATE_PATH, this::loadClasspathTemplate);

        Map<String, String> values = new HashMap<>();
        values.put("referenceCode", safe(request.getReferenceCode()));
        Instant submitted = request.getSubmittedAt() != null ? request.getSubmittedAt() : Instant.now();
        values.put("submittedAt", DATE_FORMATTER.format(submitted));
        values.put("millName", safe(request.getMillName()));
        values.put("contactName", safe(request.getContactName()));
        values.put("machineBrand", safe(request.getMachineBrand()));
        values.put("location", safe(request.getLocation()));
        values.put("factoryType", safe(request.getFactoryType()));
        values.put("rollWidth", safe(request.getRollWidth()));
        values.put("phone", safe(request.getPhone()));
        values.put("email", safe(request.getEmail()));

        for (Map.Entry<String, String> entry : values.entrySet()) {
            template = template.replace("{{" + entry.getKey() + "}}", HtmlUtils.htmlEscape(entry.getValue()));
        }

        return template;
    }

    private byte[] renderPdfFromHtml(String htmlContent) throws Exception {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            String baseUrl = new ClassPathResource("static/").getURL().toExternalForm();
            renderer.setDocumentFromString(htmlContent, baseUrl);
            renderer.layout();
            renderer.createPDF(baos);
            return baos.toByteArray();
        }
    }

    private String loadClasspathTemplate(String path) {
        try {
            ClassPathResource resource = new ClassPathResource(path);
            try (InputStream is = resource.getInputStream()) {
                return new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load PDF HTML template: " + path, e);
        }
    }

    private String safe(String val) {
        return (val == null || val.isBlank()) ? "Not Specified" : val.trim();
    }
}
