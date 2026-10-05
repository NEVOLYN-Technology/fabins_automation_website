package com.fabins.controller;

import com.fabins.dto.request.ChangeStatusRequest;
import com.fabins.dto.request.CreateDeploymentRequest;
import com.fabins.dto.response.DeploymentRequestResponse;
import com.fabins.dto.response.PageResponse;
import com.fabins.entity.enums.DeploymentRequestStatus;
import com.fabins.service.DeploymentRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * HTTP endpoints for deployment requests.
 *
 * <p>
 * This class only translates between HTTP and the service layer: bind and
 * validate the payload, call one service method, choose a status code. Any
 * logic beyond that belongs in {@link DeploymentRequestService}.
 *
 * <h2>API design notes</h2>
 * <ul>
 * <li><strong>Versioned path</strong> — everything sits under {@code /api/v1}.
 * A breaking change ships as {@code /api/v2} while v1 keeps working, so
 * a deployed frontend never breaks because the backend was released.</li>
 * <li><strong>Plural noun, no verbs</strong> — the resource is
 * {@code /deployment-requests}. The HTTP method is the verb, which is why
 * there is no {@code /submitDeploymentRequest}.</li>
 * <li><strong>201 with a {@code Location} header</strong> on create, as
 * required for a POST that creates a resource.</li>
 * <li><strong>PATCH, not PUT</strong>, for the status change: it modifies one
 * field rather than replacing the whole resource.</li>
 * <li><strong>Status as a sub-resource</strong> ({@code /{id}/status}) rather
 * than a general update endpoint, so a client cannot rewrite the mill's
 * submitted details while changing a workflow stage.</li>
 * </ul>
 *
 * <h2>Access control</h2>
 * Creating a request is public — it is the website's contact form. Everything
 * else exposes submitters' contact details and requires the admin role; see
 * {@code SecurityConfig}.
 */
@RestController
@RequestMapping("/api/v1/deployment-requests")
@Tag(name = "Deployment requests", description = "Retrofit assessment enquiries from mills")
public class DeploymentRequestController {

  private final DeploymentRequestService service;

  public DeploymentRequestController(DeploymentRequestService service) {
    this.service = service;
  }

  /**
   * Submits a new deployment request. Public — this backs the website form.
   *
   * <p>
   * {@code @Valid} is what triggers the constraints on
   * {@link CreateDeploymentRequest}; without it they are silently ignored.
   */
  @PostMapping
  @Operation(summary = "Submit a deployment request", description = "Public endpoint backing the contact form on the FABINS site.")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Request recorded"),
      @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content())
  })
  public ResponseEntity<DeploymentRequestResponse> submit(
      @Valid @RequestBody CreateDeploymentRequest request,
      UriComponentsBuilder uriBuilder) {
    DeploymentRequestResponse created = service.submit(request);

    // Built from the incoming request rather than hardcoded, so the URI is
    // correct behind a proxy or on a non-default port.
    URI location = uriBuilder
        .path("/api/v1/deployment-requests/{id}")
        .buildAndExpand(created.id())
        .toUri();

    return ResponseEntity.created(location).body(created);
  }

  /**
   * Generates an official assessment PDF report on the fly for client-side
   * preview or download.
   * Public — allows users on /deploy to preview and download the authentic
   * assessment document.
   */
  @PostMapping(value = "/preview-pdf", produces = MediaType.APPLICATION_PDF_VALUE)
  @Operation(summary = "Generate preview assessment PDF", description = "Compiles the official branded assessment PDF without persisting a record.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "PDF report generated"),
      @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content())
  })
  public ResponseEntity<byte[]> previewPdf(@Valid @RequestBody CreateDeploymentRequest request) {
    byte[] pdf = service.generatePreviewPdf(request);
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"FABINS-Assessment-Preview.pdf\"")
        .body(pdf);
  }

  /**
   * Downloads the official assessment PDF for a previously submitted deployment
   * request.
   * Public — allows applicants with their request UUID to download or reprint
   * their assessment copy.
   */
  @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
  @Operation(summary = "Download assessment PDF", description = "Fetches the official compiled PDF report for a submitted request.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "PDF report retrieved"),
      @ApiResponse(responseCode = "404", description = "Request not found", content = @Content())
  })
  public ResponseEntity<byte[]> getPdf(@PathVariable UUID id) {
    byte[] pdf = service.getAssessmentPdf(id);
    DeploymentRequestResponse request = service.getById(id);
    String filename = "FABINS-Assessment-" + request.referenceCode() + ".pdf";
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
        .body(pdf);
  }

  /**
   * Lists requests, newest first. Admin only.
   *
   * <p>
   * {@code @PageableDefault} caps the page size, so a client cannot ask
   * for a million rows in one call.
   *
   * @param status optional filter, e.g. {@code ?status=NEW}
   */
  @GetMapping
  @Operation(summary = "List deployment requests", security = @SecurityRequirement(name = "basicAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "A page of requests"),
      @ApiResponse(responseCode = "401", description = "Missing or invalid credentials", content = @Content())
  })
  public PageResponse<DeploymentRequestResponse> list(
      @RequestParam(required = false) DeploymentRequestStatus status,
      @PageableDefault(size = 20) Pageable pageable) {
    return service.list(status, pageable);
  }

  /** Fetches a single request by id. Admin only. */
  @GetMapping("/{id}")
  @Operation(summary = "Get one deployment request", security = @SecurityRequirement(name = "basicAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "The request"),
      @ApiResponse(responseCode = "404", description = "No request with that id", content = @Content())
  })
  public DeploymentRequestResponse getById(@PathVariable UUID id) {
    return service.getById(id);
  }

  /** Moves a request to a new stage of the follow-up process. Admin only. */
  @PatchMapping("/{id}/status")
  @Operation(summary = "Change a request's status", security = @SecurityRequirement(name = "basicAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Updated request"),
      @ApiResponse(responseCode = "404", description = "No request with that id", content = @Content())
  })
  public DeploymentRequestResponse changeStatus(
      @PathVariable UUID id,
      @Valid @RequestBody ChangeStatusRequest request) {
    return service.changeStatus(id, request.status());
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
  @Operation(summary = "View acknowledgement confirmation page for deployment request")
  public ResponseEntity<String> showAcknowledgeConfirmation(@PathVariable UUID id) {
    DeploymentRequestResponse request = service.getById(id);

    String content;
    if (request.status() != DeploymentRequestStatus.NEW) {
      content = """
          <div style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 999px; font-weight: 700; font-size: 13px; margin-bottom: 16px;">
            Status: %s
          </div>
          <h2 style="color: #0f172a; margin-top: 0;">Request Already Acknowledged</h2>
          <p style="font-size: 15px; color: #334155;">Deployment request <strong>%s</strong> for <strong>%s</strong> is already in progress.</p>
          <p style="color: #64748b; font-size: 13px;">No further automated action is needed.</p>
          """
          .formatted(request.status(), request.referenceCode(), request.millName());
    } else {
      content = """
          <h2 style="color: #0f172a; margin-top: 0;">Confirm Assessment Acknowledgement</h2>
          <p style="font-size: 15px; color: #334155; margin-bottom: 20px;">
            You are about to acknowledge the deployment assessment application for:
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; text-align: left; margin-bottom: 24px; font-size: 14px;">
            <div style="margin-bottom: 8px;"><strong>Tracking ID:</strong> <span style="color: #0284c7;">%s</span></div>
            <div style="margin-bottom: 8px;"><strong>Mill Name:</strong> %s</div>
            <div style="margin-bottom: 8px;"><strong>Contact Person:</strong> %s</div>
            <div><strong>Applicant Email:</strong> %s</div>
          </div>
          <form method="POST" action="/api/v1/deployment-requests/%s/acknowledge">
            <button type="submit" style="background: #0284c7; color: #ffffff; border: none; padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);">
              &#10003; Confirm &amp; Dispatch Acknowledgement
            </button>
          </form>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">
            Clicking confirm will mark the application as IN_REVIEW and notify the applicant.
          </p>
          """
          .formatted(request.referenceCode(), request.millName(), request.contactName(), request.email(), id);
    }

    String html = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FABINS@NEVOLYN — Deployment Acknowledgement</title>
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
   * Executes the state change to IN_REVIEW and dispatches the acknowledgement
   * email.
   */
  @PostMapping("/{id}/acknowledge")
  @Operation(summary = "Acknowledge a deployment request and notify sender")
  public ResponseEntity<String> acknowledge(@PathVariable UUID id) {
    DeploymentRequestResponse response = service.acknowledge(id);
    String htmlResponse = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FABINS@NEVOLYN — Request Acknowledged</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px 15px; line-height: 1.6; background-color: #f1f5f9;">
          <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; padding: 36px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);">
            <div style="font-size: 13px; font-weight: 700; color: #0284c7; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">FABINS@NEVOLYN</div>
            <div style="font-size: 36px; margin-bottom: 12px; color: #16a34a;">&#10003;</div>
            <h2 style="color: #0f172a; margin-top: 0;">Application Successfully Acknowledged</h2>
            <p style="font-size: 15px; color: #1e293b;">Deployment request <strong>%s</strong> for <strong>%s</strong> is now marked as <strong>IN REVIEW</strong>.</p>
            <p style="color: #64748b; font-size: 14px;">An official acknowledgement email has been dispatched to <strong>%s</strong> confirming our team will contact them within 24 hours.</p>
          </div>
        </body>
        </html>
        """
        .formatted(response.referenceCode(), response.millName(), response.email());

    return ResponseEntity.ok()
        .contentType(new MediaType(MediaType.TEXT_HTML, StandardCharsets.UTF_8))
        .body(htmlResponse);
  }

  /** Deletes a single request by id. Admin only. */
  @DeleteMapping("/{id}")
  @Operation(summary = "Delete one deployment request", security = @SecurityRequirement(name = "basicAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Request deleted"),
      @ApiResponse(responseCode = "404", description = "No request with that id", content = @Content())
  })
  public ResponseEntity<Void> deleteById(@PathVariable UUID id) {
    service.deleteById(id);
    return ResponseEntity.noContent().build();
  }

  /** Deletes all deployment requests from the database. Admin only. */
  @DeleteMapping
  @Operation(summary = "Delete all deployment requests", security = @SecurityRequirement(name = "basicAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "All requests deleted"),
      @ApiResponse(responseCode = "401", description = "Missing or invalid credentials", content = @Content())
  })
  public ResponseEntity<Void> deleteAll() {
    service.deleteAll();
    return ResponseEntity.noContent().build();
  }
}
