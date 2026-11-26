package com.fabins.dto.request;

import com.fabins.entity.enums.ContactInquiryStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/**
 * Payload for {@code PATCH /api/v1/contact-inquiries/{id}/status}.
 */
@Schema(description = "New stage for a contact inquiry")
public record ChangeInquiryStatusRequest(

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, example = "REPLIED")
        @NotNull(message = "Status is required")
        ContactInquiryStatus status
) {
}
