package com.fabins.dto.response;

import com.fabins.entity.enums.ContactInquiryStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

/**
 * What the API returns for a general contact inquiry.
 *
 * <p>Separate from the {@link com.fabins.entity.ContactInquiry} entity on
 * purpose. The entity is free to grow internal fields — assigned team member,
 * reply notes, internal priority — without any risk of them leaking into a
 * public API response. Everything a client should see must be added here
 * deliberately.
 *
 * <p>Conversion from the entity lives in {@code ContactInquiryMapper}, not
 * here, so this record stays a pure data carrier with no knowledge of
 * persistence or business logic.
 *
 * <p>This response is returned on HTTP 201 after a successful submission, and
 * is the only thing the anonymous submitter will ever receive — there are no
 * public GET endpoints for individual inquiries.
 */
@Schema(description = "A submitted general contact inquiry")
public record ContactInquiryResponse(

        /** Server-generated surrogate UUID key. */
        @Schema(description = "Server-generated identifier")
        UUID id,

        /**
         * Short, human-readable tracking reference the submitter can quote in
         * follow-up emails. Built from the first 8 hex digits of the UUID.
         * Example: {@code FAB-CONTACT-A1B2C3D4}.
         */
        @Schema(description = "Human-readable reference code, e.g. FAB-CONTACT-A1B2C3D4")
        String referenceCode,

        /** Full name of the person who submitted the inquiry. */
        String name,

        /** Email address the reply should be sent to. */
        String email,

        /** Subject line as submitted. */
        String subject,

        /** Free-text message body. */
        String message,

        /**
         * Current workflow status of the inquiry.
         * {@link ContactInquiryStatus#NEW} on creation;
         * {@link ContactInquiryStatus#REPLIED} once the team has responded.
         */
        ContactInquiryStatus status,

        /** UTC instant the inquiry was first persisted. */
        Instant createdAt

) {}
