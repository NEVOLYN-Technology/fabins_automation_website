package com.fabins.service.impl;

import com.fabins.config.ApiProperties;
import com.fabins.entity.DeploymentRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.BodyPart;
import jakarta.mail.Multipart;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the email layer.
 *
 * <p>
 * Deliberately not a {@code @SpringBootTest}: these exercise template
 * rendering and engine selection, neither of which needs a context. They run in
 * milliseconds and never touch the network.
 *
 * <p>
 * The SMTP engine is the one under test throughout, selected by configuring
 * a credential that is <em>not</em> a Brevo key. Driving the REST engine would
 * mean either reaching {@code api.brevo.com} from CI or making the endpoint
 * injectable purely for a test; the rendered body asserted here is the same
 * body either engine sends, so the valuable half is covered.
 */
class EmailServiceImplTest {

    private static final String BACKEND_URL = "https://api.fabins.test";
    private static final String ADMIN_ADDRESS = "rnd@fabins.test";
    private static final String FROM_ADDRESS = "noreply@fabins.test";

    /** Not a Brevo key, so `dispatch` falls through to the SMTP engine. */
    private static final String PLAIN_SMTP_PASSWORD = "a-plain-smtp-password";

    /** Stands in for the value JPA auditing assigns on insert. */
    private static final Instant SUBMITTED_AT = Instant.parse("2026-07-27T18:30:00Z");

    private JavaMailSender mailSender;

    @BeforeEach
    void setUp() {
        mailSender = mock(JavaMailSender.class);
        // The real MimeMessageHelper writes into whatever this returns, so it
        // has to be a genuine MimeMessage rather than a mock.
        when(mailSender.createMimeMessage()).thenAnswer(invocation -> new MimeMessage((Session) null));
    }

    // ── Rendering ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("The admin alert carries the reference code, the mill, and an absolute acknowledge link")
    void adminNotificationIsFullyRendered() throws Exception {
        DeploymentRequest request = requestWithId();

        service(PLAIN_SMTP_PASSWORD).sendDeploymentRequestNotifications(request);

        String html = bodyOfMessage(0);
        assertThat(html)
                .contains(request.getReferenceCode())
                .contains("Apex Textile Mills")
                .contains("qa@apextextiles.test")
                // Absolute, and built from fabins.backend-url — a relative link
                // is dead once it is inside an email client.
                .contains(BACKEND_URL + "/api/v1/deployment-requests/" + request.getId() + "/acknowledge");
    }

    @Test
    @DisplayName("No template placeholder is left unsubstituted in any of the three emails")
    void everyPlaceholderIsSubstituted() throws Exception {
        DeploymentRequest request = requestWithId();
        EmailServiceImpl service = service(PLAIN_SMTP_PASSWORD);

        service.sendDeploymentRequestNotifications(request);
        service.sendAcknowledgementNotification(request);

        ArgumentCaptor<MimeMessage> sent = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, times(3)).send(sent.capture());

        for (MimeMessage message : sent.getAllValues()) {
            // A missed placeholder renders as a literal "{{millName}}" in the
            // recipient's inbox, which no compiler or type checker would catch.
            assertThat(bodyOf(message)).doesNotContain("{{");
        }
    }

    @Test
    @DisplayName("Optional fields degrade to readable placeholders rather than 'null'")
    void absentOptionalFieldsAreLabelled() throws Exception {
        DeploymentRequest request = requestWithId("Apex Textile Mills", null, null);

        service(PLAIN_SMTP_PASSWORD).sendDeploymentRequestNotifications(request);

        assertThat(bodyOfMessage(0))
                .contains("N/A")
                .contains("None provided")
                .doesNotContain(">null<");
    }

    @Test
    @DisplayName("A trailing slash on the backend URL does not produce a doubled slash")
    void backendUrlTrailingSlashIsTrimmed() throws Exception {
        DeploymentRequest request = requestWithId();

        service(PLAIN_SMTP_PASSWORD, BACKEND_URL + "/").sendDeploymentRequestNotifications(request);

        assertThat(bodyOfMessage(0))
                .contains(BACKEND_URL + "/api/v1/deployment-requests/")
                .doesNotContain(BACKEND_URL + "//");
    }

    // ── Engine selection ────────────────────────────────────────────────────

    @Test
    @DisplayName("With no credential configured, nothing is sent and nothing throws")
    void blankCredentialSkipsDelivery() {
        EmailServiceImpl service = service("");

        service.sendDeploymentRequestNotifications(requestWithId());

        // The point of the simulation path: a developer with no mail account
        // still gets a working contact form.
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("A failing mail server does not propagate — a notification must not fail the enquiry")
    void smtpFailureIsSwallowed() {
        when(mailSender.createMimeMessage()).thenThrow(new IllegalStateException("mail server down"));

        // No assertion beyond "does not throw": this method runs on an @Async
        // thread after the visitor already received a 201.
        service(PLAIN_SMTP_PASSWORD).sendDeploymentRequestNotifications(requestWithId());
    }

    // ── Fixtures ────────────────────────────────────────────────────────────

    private EmailServiceImpl service(String apiKey) {
        return service(apiKey, BACKEND_URL);
    }

    @SuppressWarnings("unchecked")
    private EmailServiceImpl service(String apiKey, String backendUrl) {
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(mailSender);

        ApiProperties properties = new ApiProperties(
                new ApiProperties.Cors(List.of("http://localhost:3000")),
                new ApiProperties.Admin("admin", "password"),
                new ApiProperties.Mail(
                        ADMIN_ADDRESS,
                        FROM_ADDRESS,
                        "Saturn Textiles R&D",
                        apiKey,
                        "[FABINS Alert] New Deployment Enquiry: %s",
                        "FABINS Deployment Assessment Request Received — Ref: %s",
                        "[Acknowledged] FABINS Deployment Request — Ref: %s"),
                backendUrl);

        return new EmailServiceImpl(provider, properties, new ObjectMapper(), new PdfGenerationServiceImpl());
    }

    private static DeploymentRequest requestWithId() {
        return requestWithId("Apex Textile Mills", "+880 1700-000000", "Knits and woven, 60in rolls.");
    }

    /**
     * Builds a request in the state the email layer actually receives one: already
     * persisted, so the id and the auditing timestamp are populated.
     *
     * <p>
     * Reflection is used because the entity deliberately exposes no setters
     * for either — both are assigned by JPA — and this is cheaper than standing
     * up a database for a rendering test.
     */
    private static DeploymentRequest requestWithId(String millName, String phone, String message) {
        DeploymentRequest request = DeploymentRequest.submit(
                millName, "GM, Quality Assurance", "qa@apextextiles.test", phone, message);
        ReflectionTestUtils.setField(request, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(request, "submittedAt", SUBMITTED_AT);
        return request;
    }

    /** Returns the HTML body of the nth message handed to the mail sender. */
    private String bodyOfMessage(int index) throws Exception {
        ArgumentCaptor<MimeMessage> sent = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, atLeastOnce()).send(sent.capture());
        return bodyOf(sent.getAllValues().get(index));
    }

    /**
     * Digs the HTML out of the MIME tree.
     *
     * <p>
     * {@code MimeMessageHelper} in multipart mode nests the body several
     * levels deep (mixed → related → alternative), so the part has to be found
     * rather than read off the message directly.
     */
    private static String bodyOf(MimeMessage message) throws Exception {
        String html = findHtml(message.getContent());
        assertThat(html).as("no text/html part found in the message").isNotNull();
        return html;
    }

    private static String findHtml(Object content) throws Exception {
        if (content instanceof String text) {
            return text;
        }
        if (content instanceof Multipart multipart) {
            for (int i = 0; i < multipart.getCount(); i++) {
                BodyPart part = multipart.getBodyPart(i);
                String found = findHtml(part.getContent());
                if (found != null) {
                    return found;
                }
            }
        }
        return null;
    }
}