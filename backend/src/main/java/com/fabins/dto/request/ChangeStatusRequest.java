package com.fabins.dto.request;

import com.fabins.entity.enums.DeploymentRequestStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/**
 * Payload for {@code PATCH /api/v1/deployment-requests/{id}/status}.
 *
 * <p>An object with one field rather than a bare enum in the body, so that
 * further fields — a reason, or who made the change — can be added later
 * without breaking existing clients.
 */
@Schema(description = "New stage for a deployment request")
public record ChangeStatusRequest(

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "IN_REVIEW")
        @NotNull(message = "Status is required")
        DeploymentRequestStatus status
) {
}
