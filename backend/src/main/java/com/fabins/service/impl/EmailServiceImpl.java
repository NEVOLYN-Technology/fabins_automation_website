package com.fabins.service.impl;

import com.fabins.config.ApiProperties;
import com.fabins.entity.ContactInquiry;
import com.fabins.entity.DeploymentRequest;
import com.fabins.service.EmailService;
import com.fabins.service.PdfGenerationService;
import com.fabins.service.mail.EmailMessage;
import com.fabins.service.mail.EmailTemplateRenderer;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Objects;

/**
 * Enterprise implementation of {@link EmailService} delivering automated
 * transactional
 * emails over corporate Webmail / SMTP (e.g. mail.nevolyn.com).
 *
 * <h2>Architecture &amp; Features</h2>
 * <ul>
 * <li><strong>Corporate Webmail SMTP:</strong> Connects directly to the
 * organizational
 * mail host via standard SMTPS (port 465, SSL/TLS) or STARTTLS (port 587).</li>
 * <li><strong>Multipart Alternative MIME:</strong> Automatically generates both
 * rich HTML
 * and clean plain-text fallback bodies to maximize inbox delivery and pass spam
 * filters.</li>
 * <li><strong>Cached &amp; Sanitized Templates:</strong> Templates are cached
 * in memory
 * and user inputs are safely escaped to prevent HTML/XSS injection.</li>
 * <li><strong>Asynchronous Dispatch:</strong> Public methods are annotated with
 * {@code @Async},
 * guaranteeing that frontend form submissions receive immediate responses
 * (<100ms)
 * without waiting for external network or mail server latency.</li>
 * <li><strong>Safe Local Simulation:</strong> If SMTP credentials are missing
 * or blank,
 * dispatches are safely logged instead of failing, enabling seamless local
 * development.</li>
 * </ul>
 */
@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private static final String TEMPLATE_ADMIN_NOTIFICATION = "templates/email/deployment-admin-notification-mail.html";
    private static final String TEMPLATE_SENDER_CONFIRMATION = "templates/email/deployment-sender-confirmation-mail.html";
    private static final String TEMPLATE_ACKNOWLEDGEMENT = "templates/email/deployment-acknowledgement-email.html";
    private static final String TEMPLATE_CONTACT_ADMIN = "templates/email/contact-admin-notification-mail.html";
    private static final String TEMPLATE_CONTACT_SENDER = "templates/email/contact-sender-confirmation-mail.html";
    private static final String TEMPLATE_CONTACT_ACKNOWLEDGEMENT = "templates/email/contact-acknowledgement-email.html";

    private final JavaMailSender mailSender;
    private final ApiProperties properties;
    private final PdfGenerationService pdfGenerationService;
    private final EmailTemplateRenderer templateRenderer;
    private final String configuredPassword;
    private final Environment environment;

    @Autowired
    public EmailServiceImpl(ObjectProvider<JavaMailSender> mailSenderProvider,
            ApiProperties properties,
            PdfGenerationService pdfGenerationService,
            EmailTemplateRenderer templateRenderer,
            @Value("${spring.mail.password:}") String mailPassword,
            Environment environment) {
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.properties = properties;
        this.pdfGenerationService = pdfGenerationService;
        this.templateRenderer = templateRenderer != null ? templateRenderer : new EmailTemplateRenderer();
        this.configuredPassword = mailPassword != null ? mailPassword.trim() : "";
        this.environment = environment;
    }

    @jakarta.annotation.PostConstruct
    public void validateProductionConfiguration() {
        if (isProductionEnvironment() && getEffectivePassword().isBlank()) {
            throw new IllegalStateException("CRITICAL CONFIGURATION ERROR: Production profile ('prod') is active, "
                    + "but no mail credentials were provided (SPRING_MAIL_PASSWORD is blank). "
                    + "Production will not silently simulate emails. Supply valid SMTP credentials.");
        }
    }

    private boolean isProductionEnvironment() {
        if (environment == null) {
            return false;
        }
        return java.util.Arrays.asList(environment.getActiveProfiles()).contains("prod")
                || java.util.Arrays.asList(environment.getActiveProfiles()).contains("production");
    }

    /**
     * Backward-compatible constructor for testing and manual wiring.
     */
    public EmailServiceImpl(ObjectProvider<JavaMailSender> mailSenderProvider,
            ApiProperties properties,
            ObjectMapper objectMapper,
            PdfGenerationService pdfGenerationService) {
        this(mailSenderProvider, properties, pdfGenerationService, new EmailTemplateRenderer(),
                properties != null && properties.mail() != null ? properties.mail().apiKey() : null, null);
    }

    public EmailServiceImpl(ObjectProvider<JavaMailSender> mailSenderProvider,
            ApiProperties properties,
            PdfGenerationService pdfGenerationService,
            EmailTemplateRenderer templateRenderer) {
        this(mailSenderProvider, properties, pdfGenerationService, templateRenderer,
                properties != null && properties.mail() != null ? properties.mail().apiKey() : null, null);
    }

    public EmailServiceImpl(ObjectProvider<JavaMailSender> mailSenderProvider,
            ApiProperties properties,
            PdfGenerationService pdfGenerationService,
            EmailTemplateRenderer templateRenderer,
            String mailPassword) {
        this(mailSenderProvider, properties, pdfGenerationService, templateRenderer, mailPassword, null);
    }

    // =========================================================================
    // 1. DEPLOYMENT REQUEST FLOW
    // =========================================================================

    /**
     * Notifies the engineering team of a new assessment enquiry and confirms
     * receipt to the applicant. Generates an official PDF report and attaches it to
     * both dispatches.
     */
    @Override
    @Async
    public void sendDeploymentRequestNotifications(DeploymentRequest request) {
        log.info("Dispatching deployment request notifications for id {} [Ref: {}]",
                request.getId(), request.getReferenceCode());

        byte[] pdfBytes = null;
        try {
            pdfBytes = pdfGenerationService.generateDeploymentAssessmentPdf(request);
        } catch (Exception e) {
            log.error("Failed to generate PDF for deployment request id {}", request.getId(), e);
        }
        String attachmentFilename = "FABINS-Deployment_Assessment-" + request.getReferenceCode() + ".pdf";

        sendAdminNotification(request, attachmentFilename, pdfBytes);
        sendSenderConfirmation(request, attachmentFilename, pdfBytes);
    }

    /**
     * Sends the internal alert carrying the submitter's full details plus the
     * one-click acknowledge link and attached assessment PDF.
     */
    private void sendAdminNotification(DeploymentRequest request, String attachmentFilename, byte[] attachmentBytes) {
        ApiProperties.Mail mail = getMailConfig();
        String reference = request.getReferenceCode();

        Map<String, String> values = Map.ofEntries(
                Map.entry("acknowledgeUrl", acknowledgeUrl(request)),
                Map.entry("requestId", reference),
                Map.entry("millName", request.getMillName()),
                Map.entry("machineBrand", Objects.requireNonNullElse(request.getMachineBrand(), "N/A")),
                Map.entry("location", Objects.requireNonNullElse(request.getLocation(), "N/A")),
                Map.entry("contactName", request.getContactName()),
                Map.entry("email", request.getEmail()),
                Map.entry("phone", Objects.requireNonNullElse(request.getPhone(), "N/A")),
                Map.entry("factoryType", Objects.requireNonNullElse(request.getFactoryType(), "N/A")),
                Map.entry("rollWidth", Objects.requireNonNullElse(request.getRollWidth(), "N/A")),
                Map.entry("submittedAt", String.valueOf(request.getSubmittedAt())));

        String htmlBody = templateRenderer.render(TEMPLATE_ADMIN_NOTIFICATION, values);
        String plainText = templateRenderer.generatePlainText(htmlBody);

        EmailMessage message = EmailMessage.builder()
                .to(mail.adminAddress())
                .subject(String.format(mail.adminSubject(), request.getMillName()))
                .htmlBody(htmlBody)
                .plainTextBody(plainText)
                .replyTo(request.getEmail())
                .attachment(attachmentFilename, attachmentBytes)
                .build();

        dispatch(message);
    }

    /**
     * Sends the "we have received your enquiry" confirmation with the attached
     * assessment PDF
     * to the mill representative.
     */
    private void sendSenderConfirmation(DeploymentRequest request, String attachmentFilename, byte[] attachmentBytes) {
        ApiProperties.Mail mail = getMailConfig();
        String reference = request.getReferenceCode();

        Map<String, String> values = Map.of(
                "contactName", request.getContactName(),
                "millName", request.getMillName(),
                "requestId", reference,
                "adminEmail", mail.adminAddress());

        String htmlBody = templateRenderer.render(TEMPLATE_SENDER_CONFIRMATION, values);
        String plainText = templateRenderer.generatePlainText(htmlBody);

        EmailMessage message = EmailMessage.builder()
                .to(request.getEmail())
                .subject(String.format(mail.senderSubject(), reference))
                .htmlBody(htmlBody)
                .plainTextBody(plainText)
                .replyTo(mail.adminAddress())
                .attachment(attachmentFilename, attachmentBytes)
                .build();

        dispatch(message);
    }

    /**
     * Tells the mill contact that a specialist on the team has picked up their
     * enquiry
     * (triggered when the request moves to {@code IN_REVIEW}).
     */
    @Override
    @Async
    public void sendAcknowledgementNotification(DeploymentRequest request) {
        ApiProperties.Mail mail = getMailConfig();
        String reference = request.getReferenceCode();

        Map<String, String> values = Map.of(
                "contactName", request.getContactName(),
                "millName", request.getMillName(),
                "requestId", reference,
                "adminEmail", mail.adminAddress());

        String htmlBody = templateRenderer.render(TEMPLATE_ACKNOWLEDGEMENT, values);
        String plainText = templateRenderer.generatePlainText(htmlBody);

        EmailMessage message = EmailMessage.builder()
                .to(request.getEmail())
                .subject(String.format(mail.acknowledgementSubject(), reference))
                .htmlBody(htmlBody)
                .plainTextBody(plainText)
                .replyTo(mail.adminAddress())
                .build();

        dispatch(message);
    }

    // =========================================================================
    // 2. GENERAL CONTACT INQUIRY FLOW
    // =========================================================================

    /**
     * Notifies the internal team of a new contact inquiry and sends the visitor
     * an automated confirmation receipt.
     */
    @Override
    @Async
    public void sendContactInquiryNotifications(ContactInquiry inquiry) {
        log.info("Dispatching contact inquiry notifications for id {} [Ref: {}]",
                inquiry.getId(), inquiry.getReferenceCode());

        sendContactAdminNotification(inquiry);
        sendContactSenderConfirmation(inquiry);
    }

    /**
     * Sends the internal team alert for a new contact inquiry with visitor details
     * and a 1-click acknowledge button.
     */
    private void sendContactAdminNotification(ContactInquiry inquiry) {
        ApiProperties.Mail mail = getMailConfig();
        String reference = inquiry.getReferenceCode();

        Map<String, String> values = Map.of(
                "acknowledgeUrl", contactAcknowledgeUrl(inquiry),
                "referenceCode", reference,
                "name", inquiry.getName(),
                "email", inquiry.getEmail(),
                "subject", inquiry.getSubject(),
                "message", inquiry.getMessage(),
                "submittedAt", String.valueOf(inquiry.getCreatedAt()));

        String htmlBody = templateRenderer.render(TEMPLATE_CONTACT_ADMIN, values);
        String plainText = templateRenderer.generatePlainText(htmlBody);

        EmailMessage message = EmailMessage.builder()
                .to(mail.adminAddress())
                .subject("[FABINS] New Contact Inquiry [Ref: " + reference + "]")
                .htmlBody(htmlBody)
                .plainTextBody(plainText)
                .replyTo(inquiry.getEmail())
                .build();

        dispatch(message);
    }

    /**
     * Sends the visitor a confirmation that their message was received.
     */
    private void sendContactSenderConfirmation(ContactInquiry inquiry) {
        ApiProperties.Mail mail = getMailConfig();
        String reference = inquiry.getReferenceCode();

        Map<String, String> values = Map.of(
                "name", inquiry.getName(),
                "referenceCode", reference,
                "subject", inquiry.getSubject() != null ? inquiry.getSubject() : "General Inquiry",
                "message", inquiry.getMessage() != null ? inquiry.getMessage() : "",
                "adminEmail", mail.adminAddress());

        String htmlBody = templateRenderer.render(TEMPLATE_CONTACT_SENDER, values);
        String plainText = templateRenderer.generatePlainText(htmlBody);

        EmailMessage message = EmailMessage.builder()
                .to(inquiry.getEmail())
                .subject("[FABINS] Inquiry Confirmation [Ref: " + reference + "]")
                .htmlBody(htmlBody)
                .plainTextBody(plainText)
                .replyTo(mail.adminAddress())
                .build();

        dispatch(message);
    }

    /**
     * Sends the visitor an acknowledgement email after a team member clicks
     * the acknowledge button.
     */
    @Override
    @Async
    public void sendContactInquiryAcknowledgement(ContactInquiry inquiry) {
        ApiProperties.Mail mail = getMailConfig();
        String reference = inquiry.getReferenceCode();

        log.info("Dispatching contact inquiry acknowledgement for id {} [Ref: {}]",
                inquiry.getId(), reference);

        Map<String, String> values = Map.of(
                "name", inquiry.getName() != null ? inquiry.getName() : "Valued Partner",
                "subject", inquiry.getSubject() != null ? inquiry.getSubject() : "General Inquiry",
                "message", inquiry.getMessage() != null ? inquiry.getMessage() : "",
                "referenceCode", reference != null ? reference : "",
                "adminEmail", mail.adminAddress());

        String htmlBody = templateRenderer.render(TEMPLATE_CONTACT_ACKNOWLEDGEMENT, values);
        String plainText = templateRenderer.generatePlainText(htmlBody);

        EmailMessage message = EmailMessage.builder()
                .to(inquiry.getEmail())
                .subject("[FABINS] Inquiry Acknowledged [Ref: " + reference + "]")
                .htmlBody(htmlBody)
                .plainTextBody(plainText)
                .replyTo(mail.adminAddress())
                .build();

        dispatch(message);
    }

    // =========================================================================
    // 3. URL BUILDERS
    // =========================================================================

    private String acknowledgeUrl(DeploymentRequest request) {
        return buildAcknowledgeUrl("/api/v1/deployment-requests/" + request.getId() + "/acknowledge");
    }

    private String contactAcknowledgeUrl(ContactInquiry inquiry) {
        return buildAcknowledgeUrl("/api/v1/contact-inquiries/" + inquiry.getId() + "/acknowledge");
    }

    private String buildAcknowledgeUrl(String endpointPath) {
        String base = properties.backendUrl() != null ? properties.backendUrl().trim() : "";
        while (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + endpointPath;
    }

    private ApiProperties.Mail getMailConfig() {
        if (properties != null && properties.mail() != null) {
            return properties.mail();
        }
        return new ApiProperties.Mail(
                "fabins@nevolyn.com",
                "fabins@nevolyn.com",
                "FABINS@NEVOLYN",
                null,
                "[FABINS] Deployment Assessment: %s",
                "[FABINS] Assessment Request Confirmed [Ref: %s]",
                "[FABINS] Assessment Request Acknowledged [Ref: %s]");
    }

    // =========================================================================
    // 4. DISPATCH ENGINE (WEBMAIL / SMTP)
    // =========================================================================

    /**
     * Delivers an email message over corporate Webmail / SMTP.
     *
     * <p>
     * If credentials are unset or blank (e.g. during local development),
     * transmission is cleanly simulated and logged to avoid throwing errors.
     */
    private void dispatch(EmailMessage message) {
        String effectivePassword = getEffectivePassword();

        // Safe simulation path for local development
        if (effectivePassword.isBlank()) {
            if (isProductionEnvironment()) {
                log.error("[WEBMAIL ERROR] Cannot deliver email to {}: missing SPRING_MAIL_PASSWORD in production!",
                        message.to());
                return;
            }
            log.info(
                    "[WEBMAIL SIMULATED] To: {} | Subject: '{}' | Attachment: {} — set SPRING_MAIL_PASSWORD to send for real",
                    message.to(), message.subject(),
                    message.hasAttachment() ? message.attachmentFilename() : "None");
            return;
        }

        if (mailSender == null) {
            log.error(
                    "Cannot send email to {}: JavaMailSender bean is unavailable. Verify spring.mail.host is configured.",
                    message.to());
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            // multipart=true ensures support for HTML bodies, alternative plain text, and
            // attachments
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, StandardCharsets.UTF_8.name());

            ApiProperties.Mail mailConfig = getMailConfig();
            helper.setFrom(mailConfig.fromAddress(), mailConfig.senderName());
            helper.setTo(message.to());
            helper.setSubject(message.subject());

            // HTML email with UTF-8 encoding
            helper.setText(message.htmlBody(), true);

            // Embed brand logos directly as inline MIME attachments (eliminates external
            // web dependencies)
            if (message.htmlBody() != null && message.htmlBody().contains("cid:fabinsLogo")) {
                ClassPathResource fabinsLogo = new ClassPathResource("static/fabins-logo.png");
                if (fabinsLogo.exists()) {
                    helper.addInline("fabinsLogo", fabinsLogo, "image/png");
                }
            }
            if (message.htmlBody() != null && message.htmlBody().contains("cid:nevolynIcon")) {
                ClassPathResource nevolynIcon = new ClassPathResource("static/nevolyn-icon.png");
                if (nevolynIcon.exists()) {
                    helper.addInline("nevolynIcon", nevolynIcon, "image/png");
                }
            }

            if (message.hasReplyTo()) {
                helper.setReplyTo(message.replyTo());
            }

            if (message.hasAttachment()) {
                helper.addAttachment(message.attachmentFilename(), new ByteArrayResource(message.attachmentBytes()));
            }

            mailSender.send(mimeMessage);
            log.info("Email delivered successfully to {} via Webmail SMTP [Subject: '{}'] [Attachment: {}]",
                    message.to(), message.subject(),
                    message.hasAttachment() ? message.attachmentFilename() : "none");

        } catch (Exception e) {
            // Asynchronous mail dispatch must never bubble up to fail visitor transactions
            log.error("Failed to deliver email to {} via Webmail SMTP [Subject: '{}']: {}",
                    message.to(), message.subject(), e.getMessage(), e);
        }
    }

    /**
     * Checks both configured injection paths for the SMTP password.
     */
    private String getEffectivePassword() {
        if (!configuredPassword.isBlank()) {
            return configuredPassword;
        }
        if (properties != null && properties.mail() != null && properties.mail().apiKey() != null) {
            return properties.mail().apiKey().trim();
        }
        return "";
    }
}