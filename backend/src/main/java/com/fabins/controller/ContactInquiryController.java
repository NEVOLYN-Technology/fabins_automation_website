package com.fabins.controller;

import com.fabins.dto.request.CreateContactInquiry;
import com.fabins.dto.response.ContactInquiryResponse;
import com.fabins.entity.enums.ContactInquiryStatus;
import com.fabins.service.ContactInquiryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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

  /**
   * Spring injects the service implementation. Constructor injection is
   * preferred: the dependency is explicit, the field can be {@code final},
   * and unit tests can construct this controller without a Spring context.
   */
  public ContactInquiryController(ContactInquiryService service) {
    this.service = service;
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

    String content;
    if (inquiry.status() == ContactInquiryStatus.REPLIED) {
      content = """
          <div style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 999px; font-weight: 700; font-size: 13px; margin-bottom: 16px;">
            Status: REPLIED
          </div>
          <h2 style="color: #0f172a; margin-top: 0;">Inquiry Already Acknowledged</h2>
          <p style="font-size: 15px; color: #334155;">Contact inquiry <strong>%s</strong> from <strong>%s</strong> has already been acknowledged.</p>
          <p style="color: #64748b; font-size: 13px;">No further automated action is needed.</p>
          """
          .formatted(inquiry.referenceCode(), inquiry.name());
    } else {
      content = """
          <h2 style="color: #0f172a; margin-top: 0;">Confirm Inquiry Acknowledgement</h2>
          <p style="font-size: 15px; color: #334155; margin-bottom: 20px;">
            You are about to acknowledge the general inquiry from:
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; text-align: left; margin-bottom: 24px; font-size: 14px;">
            <div style="margin-bottom: 8px;"><strong>Reference Code:</strong> <span style="color: #0284c7;">%s</span></div>
            <div style="margin-bottom: 8px;"><strong>Visitor Name:</strong> %s</div>
            <div style="margin-bottom: 8px;"><strong>Subject:</strong> %s</div>
            <div><strong>Visitor Email:</strong> %s</div>
          </div>
          <form method="POST" action="/api/v1/contact-inquiries/%s/acknowledge">
            <button type="submit" style="background: #0284c7; color: #ffffff; border: none; padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);">
              &#10003; Confirm &amp; Dispatch Acknowledgement
            </button>
          </form>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">
            Clicking confirm will mark the inquiry as REPLIED and notify the visitor.
          </p>
          """
          .formatted(inquiry.referenceCode(), inquiry.name(), inquiry.subject(), inquiry.email(), id);
    }

    String html = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FABINS@NEVOLYN — Inquiry Acknowledgement</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 40px 15px; line-height: 1.6; background-color: #f1f5f9;">
          <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; padding: 36px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);">
            <div style="font-size: 13px; font-weight: 700; color: #0284c7; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">FABINS@NEVOLYN</div>
            %s
          </div>
        </body>
        </html>
        """
        .formatted(content);

    return ResponseEntity.ok()
        .contentType(new MediaType(MediaType.TEXT_HTML, StandardCharsets.UTF_8))
        .body(html);
  }

  /**
   * Executes the status transition to REPLIED and sends the acknowledgement email
   * to visitor.
   */
  @PostMapping("/{id}/acknowledge")
  @Operation(summary = "Acknowledge a contact inquiry and notify the visitor")
  public ResponseEntity<String> acknowledge(@PathVariable UUID id) {
    ContactInquiryResponse response = service.acknowledge(id);

    String html = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FABINS@NEVOLYN — Inquiry Acknowledged</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px 15px; line-height: 1.6; background-color: #f1f5f9;">
          <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; padding: 36px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);">
            <div style="font-size: 13px; font-weight: 700; color: #0284c7; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">FABINS@NEVOLYN</div>
            <div style="font-size: 36px; margin-bottom: 12px; color: #16a34a;">&#10003;</div>
            <h2 style="color: #0f172a; margin-top: 0;">Inquiry Successfully Acknowledged</h2>
            <p style="font-size: 15px; color: #1e293b;">Contact inquiry <strong>%s</strong> from <strong>%s</strong> is now marked as <strong>REPLIED</strong>.</p>
            <p style="color: #64748b; font-size: 14px;">An acknowledgement email has been dispatched to <strong>%s</strong> confirming our team will reply personally.</p>
          </div>
        </body>
        </html>
        """
        .formatted(response.referenceCode(), response.name(), response.email());

    return ResponseEntity.ok()
        .contentType(new MediaType(MediaType.TEXT_HTML, StandardCharsets.UTF_8))
        .body(html);
  }
}
