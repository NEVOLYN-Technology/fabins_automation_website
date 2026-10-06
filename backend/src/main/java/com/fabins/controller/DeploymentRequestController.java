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
import com.fabins.service.mail.EmailTemplateRenderer;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Set;
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
  private final EmailTemplateRenderer templateRenderer;

  @org.springframework.beans.factory.annotation.Autowired
  public DeploymentRequestController(DeploymentRequestService service, EmailTemplateRenderer templateRenderer) {
    this.service = service;
    this.templateRenderer = templateRenderer != null ? templateRenderer : new EmailTemplateRenderer();
  }

  public DeploymentRequestController(DeploymentRequestService service) {
    this(service, new EmailTemplateRenderer());
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
    String filename = "FABINS_Deployment_Assessment-" + request.referenceCode() + ".pdf";
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

    if (request.status() != DeploymentRequestStatus.NEW) {
      String html = templateRenderer.render(
          "templates/web/deployment-acknowledge-result.html",
          Map.ofEntries(
              Map.entry("title", "Request Already Acknowledged"),
              Map.entry("statusBadge", request.status().name()),
              Map.entry("referenceCode", request.referenceCode()),
              Map.entry("millName", request.millName()),
              Map.entry("email", request.email()),
              Map.entry("message", "Deployment request " + request.referenceCode() + " for " + request.millName() + " has already been acknowledged."),
              Map.entry("detailNote", "An official acknowledgement email was already dispatched to " + request.email() + ". To prevent duplicate emails to the applicant, this application cannot be acknowledged again.")
          ));
      return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
    }

    String html = templateRenderer.render(
        "templates/web/deployment-acknowledge-confirm.html",
        Map.ofEntries(
            Map.entry("actionUrl", "/api/v1/deployment-requests/" + id + "/acknowledge"),
            Map.entry("referenceCode", request.referenceCode()),
            Map.entry("millName", request.millName()),
            Map.entry("contactName", request.contactName()),
            Map.entry("email", request.email()),
            Map.entry("machineBrand", request.machineBrand() != null ? request.machineBrand() : "N/A")
        ),
        Set.of("actionUrl"));

    return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
  }

  /**
   * Executes the state change to IN_REVIEW and dispatches the acknowledgement
   * email. Enforces single-acknowledgement: subsequent calls do not re-send.
   */
  @PostMapping("/{id}/acknowledge")
  @Operation(summary = "Acknowledge a deployment request and notify sender")
  public ResponseEntity<String> acknowledge(@PathVariable UUID id) {
    DeploymentRequestResponse current = service.getById(id);

    if (current.status() != DeploymentRequestStatus.NEW) {
      String html = templateRenderer.render(
          "templates/web/deployment-acknowledge-result.html",
          Map.ofEntries(
              Map.entry("title", "Request Already Acknowledged"),
              Map.entry("statusBadge", current.status().name()),
              Map.entry("referenceCode", current.referenceCode()),
              Map.entry("millName", current.millName()),
              Map.entry("email", current.email()),
              Map.entry("message", "Deployment request " + current.referenceCode() + " for " + current.millName() + " was already acknowledged previously."),
              Map.entry("detailNote", "To prevent sending duplicate emails to the applicant, no additional email was sent. An acknowledgement email was already dispatched to " + current.email() + ".")
          ));
      return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
    }

    DeploymentRequestResponse response = service.acknowledge(id);
    String htmlResponse = templateRenderer.render(
        "templates/web/deployment-acknowledge-result.html",
        Map.ofEntries(
            Map.entry("title", "Application Successfully Acknowledged"),
            Map.entry("statusBadge", "IN_REVIEW"),
            Map.entry("referenceCode", response.referenceCode()),
            Map.entry("millName", response.millName()),
            Map.entry("email", response.email()),
            Map.entry("message", "Deployment request " + response.referenceCode() + " for " + response.millName() + " is now marked as IN_REVIEW."),
            Map.entry("detailNote", "An official acknowledgement email has been dispatched to " + response.email() + " confirming our team will contact them within 24 hours.")
        ));

    return ResponseEntity.ok()
        .contentType(MediaType.TEXT_HTML)
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
