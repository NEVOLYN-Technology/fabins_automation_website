package com.fabins.dto.response;

import com.fabins.entity.enums.DeploymentRequestStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

/**
 * Public response returned by the API for a deployment request.
 */
@Schema(description = "Assessment response for a submitted deployment request")
public record DeploymentRequestResponse(

        @Schema(description = "Unique request identifier")
        UUID id,

        @Schema(description = "Human-readable tracking reference code, e.g. FAB-2026-ABB5B9D6")
        String referenceCode,

        String millName,
        String machineBrand,
        String location,
        String contactName,
        String email,
        String phone,
        String factoryType,
        String rollWidth,

        @Schema(description = "Current stage in the engineering review workflow")
        DeploymentRequestStatus status,

        @Schema(description = "Timestamp when the request was submitted (UTC)")
        Instant submittedAt,

        @Schema(description = "Timestamp when the record was last updated (UTC)")
        Instant updatedAt
) {
}
