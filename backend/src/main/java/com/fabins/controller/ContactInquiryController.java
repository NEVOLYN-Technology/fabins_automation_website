package com.fabins.controller;

import com.fabins.dto.request.CreateContactInquiry;
import com.fabins.dto.response.ContactInquiryResponse;
import com.fabins.entity.enums.ContactInquiryStatus;
import com.fabins.service.ContactInquiryService;
import com.fabins.service.mail.EmailTemplateRenderer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * HTTP endpoint for general contact inquiries submitted via the FABINS
 * homepage "Let's Connect" form.
 *
 * <p>
 * This class only translates between HTTP and the service layer:
 * bind and validate the payload, call one service method, choose a status
 * code. Any business logic beyond that belongs in
 * {@link ContactInquiryService}.
 *
 * <h2>API design notes</h2>
 * <ul>
 * <li><strong>Versioned path</strong> — everything sits under
 * {@code /api/v1}. A breaking change ships as {@code /api/v2} while
 * v1 keeps working, so a deployed frontend never breaks because of a
 * backend release.</li>
 * <li><strong>Plural noun, no verbs</strong> — the resource is
 * {@code /contact-inquiries}. The HTTP method is the verb, which is
 * why there is no {@code /submitContactInquiry}.</li>
 * <li><strong>201 with a {@code Location} header</strong> on success, as
 * required for a POST that creates a resource. The Location points to
 * the inquiry's canonical URL even though there is no public GET endpoint
 * for it yet — adding one later does not break existing clients.</li>
 * </ul>
 *
 * <h2>Access control</h2>
 * Submitting an inquiry is completely public — it is the homepage contact form.
 * There are no admin endpoints on this resource yet. If an admin list view is
 * added in a future iteration, it will require the admin role exactly as the
 * deployment-request endpoints do.
 */
@RestController
@RequestMapping("/api/v1/contact-inquiries")
@Tag(name = "Contact inquiries", description = "General visitor inquiries submitted from the homepage 'Let\\'s Connect' form")
public class ContactInquiryController {

  private final ContactInquiryService service;
  private final EmailTemplateRenderer templateRenderer;

  /**
   * Spring injects the service and template renderer implementations.
   */
  @Autowired
  public ContactInquiryController(ContactInquiryService service, EmailTemplateRenderer templateRenderer) {
    this.service = service;
    this.templateRenderer = templateRenderer != null ? templateRenderer : new EmailTemplateRenderer();
  }

  public ContactInquiryController(ContactInquiryService service) {
    this(service, new EmailTemplateRenderer());
  }

  /**
   * Submits a new general contact inquiry. This endpoint is public and backs
   * the homepage "Let's Connect" form.
   *
   * <p>
   * Bean Validation (triggered by {@code @Valid}) runs before this method
   * body executes. Any constraint violation produces a 400 with a JSON body
   * listing every offending field — see {@code GlobalExceptionHandler}.
   *
   * <p>
   * The honeypot field is checked in the service layer: a non-blank value
   * causes a fake-success 201 to be returned without any database activity,
   * preventing bot detection.
   *
   * @param dto the validated incoming request payload
   * @param ucb injected by Spring to build the {@code Location} header using
   *            the current request's scheme and host
   * @return 201 Created with {@code Location} header and the new inquiry in the
   *         body
   */
  @Operation(summary = "Submit a contact inquiry", description = "Public endpoint — backs the homepage 'Let\'s Connect' form. Returns 201 with a tracking reference code.")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Inquiry recorded successfully"),
      @ApiResponse(responseCode = "400", description = "Validation failed — see error body for field details", content = @Content(mediaType = "application/problem+json")),
      @ApiResponse(responseCode = "429", description = "Too many requests"),
      @ApiResponse(responseCode = "500", description = "Unexpected server error")
  })
  @PostMapping
  public ResponseEntity<ContactInquiryResponse> submit(
      @Valid @RequestBody CreateContactInquiry dto,
      UriComponentsBuilder ucb) {

    ContactInquiryResponse response = service.submit(dto);

    URI location = ucb.path("/api/v1/contact-inquiries/{id}")
        .buildAndExpand(response.id())
        .toUri();

    return ResponseEntity.created(location).body(response);
  }

  /**
   * Renders the acknowledgement confirmation page for an administrator.
   *
   * <p>
   * Protected against automated email security scanners (SafeLinks, Proofpoint):
   * automated GET requests only load this confirmation form without changing
   * state.
   * The state transition and acknowledgement email dispatch only occur upon POST.
   */
  @GetMapping("/{id}/acknowledge")
  @Operation(summary = "View acknowledgement confirmation page for contact inquiry")
  public ResponseEntity<String> showAcknowledgeConfirmation(@PathVariable UUID id) {
    ContactInquiryResponse inquiry = service.getById(id);

    if (inquiry.status() == ContactInquiryStatus.REPLIED) {
      String html = templateRenderer.render(
          "templates/web/contact-acknowledge-result.html",
          Map.ofEntries(
              Map.entry("title", "Inquiry Already Acknowledged"),
              Map.entry("statusBadge", inquiry.status().name()),
              Map.entry("referenceCode", inquiry.referenceCode()),
              Map.entry("name", inquiry.name()),
              Map.entry("email", inquiry.email()),
              Map.entry("message", "Contact inquiry " + inquiry.referenceCode() + " from " + inquiry.name() + " has already been acknowledged."),
              Map.entry("detailNote", "An official acknowledgement email was already dispatched to " + inquiry.email() + ". To prevent duplicate emails to the visitor, this inquiry cannot be acknowledged again.")
          ));
      return ResponseEntity.ok()
          .contentType(new MediaType(MediaType.TEXT_HTML, StandardCharsets.UTF_8))
          .body(html);
    }

    String html = templateRenderer.render(
        "templates/web/contact-acknowledge-confirm.html",
        Map.ofEntries(
            Map.entry("actionUrl", "/api/v1/contact-inquiries/" + id + "/acknowledge"),
            Map.entry("referenceCode", inquiry.referenceCode()),
            Map.entry("name", inquiry.name()),
            Map.entry("email", inquiry.email()),
            Map.entry("subject", inquiry.subject())
        ),
        Set.of("actionUrl"));

    return ResponseEntity.ok()
        .contentType(new MediaType(MediaType.TEXT_HTML, StandardCharsets.UTF_8))
        .body(html);
  }

  /**
   * Executes the status transition to REPLIED and sends the acknowledgement email
   * to visitor. Enforces single-acknowledgement: subsequent calls do not re-send.
   */
  @PostMapping("/{id}/acknowledge")
  @Operation(summary = "Acknowledge a contact inquiry and notify the visitor")
  public ResponseEntity<String> acknowledge(@PathVariable UUID id) {
    ContactInquiryResponse current = service.getById(id);

    if (current.status() == ContactInquiryStatus.REPLIED) {
      String html = templateRenderer.render(
          "templates/web/contact-acknowledge-result.html",
          Map.ofEntries(
              Map.entry("title", "Inquiry Already Acknowledged"),
              Map.entry("statusBadge", current.status().name()),
              Map.entry("referenceCode", current.referenceCode()),
              Map.entry("name", current.name()),
              Map.entry("email", current.email()),
              Map.entry("message", "Contact inquiry " + current.referenceCode() + " from " + current.name() + " was already acknowledged previously."),
              Map.entry("detailNote", "To prevent sending duplicate messages, no additional email was sent. An acknowledgement email was already dispatched to " + current.email() + ".")
          ));

      return ResponseEntity.ok()
          .contentType(new MediaType(MediaType.TEXT_HTML, StandardCharsets.UTF_8))
          .body(html);
    }

    ContactInquiryResponse response = service.acknowledge(id);

    String html = templateRenderer.render(
        "templates/web/contact-acknowledge-result.html",
        Map.ofEntries(
            Map.entry("title", "Inquiry Successfully Acknowledged"),
            Map.entry("statusBadge", response.status().name()),
            Map.entry("referenceCode", response.referenceCode()),
            Map.entry("name", response.name()),
            Map.entry("email", response.email()),
            Map.entry("message", "Contact inquiry " + response.referenceCode() + " from " + response.name() + " is now marked as REPLIED."),
            Map.entry("detailNote", "An acknowledgement email has been dispatched to " + response.email() + " confirming our team will reply personally.")
        ));

    return ResponseEntity.ok()
        .contentType(new MediaType(MediaType.TEXT_HTML, StandardCharsets.UTF_8))
        .body(html);
  }
}
