package com.fabins.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Incoming payload for {@code POST /api/v1/contact}.
 *
 * <p>A record, so it is immutable and Jackson can bind it straight from JSON.
 *
 * <h2>Where validation happens</h2>
 * The annotations below run before the controller method body executes,
 * because the parameter is marked {@code @Valid}. A violation never reaches
 * the service — it is turned into a 400 response listing every offending
 * field by {@code GlobalExceptionHandler}.
 *
 * <h2>Field limits</h2>
 * <strong>Keep these in step</strong> with the column widths on the
 * {@code ContactInquiry} entity and in {@code V3__create_contact_inquiry.sql}.
 * Widening a field here without widening the column would produce a database
 * constraint violation (500) instead of a clean validation error (400).
 *
 * <h2>Honeypot</h2>
 * The form renders a hidden {@code honeypot} field that real users never
 * see or fill. The service treats any non-blank value as a bot submission
 * and silently returns a fake success — the bot cannot distinguish acceptance
 * from rejection, which is the desired effect.
 */
@Schema(description = "A general contact inquiry submitted via the FABINS homepage 'Let\\'s Connect' form")
public record CreateContactInquiry(

        /** Full name of the enquiring person. Required. */
        @Schema(example = "Farrukh Rahman", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Name is required")
        @Size(max = 200, message = "Name must be at most {max} characters")
        String name,

        /**
         * Email address. Required and must be a well-formed address.
         * 320 = RFC 5321 maximum (64 local + '@' + 255 domain).
         */
        @Schema(example = "farrukh@textilesbd.com", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid address")
        @Size(max = 320, message = "Email must be at most {max} characters")
        String email,

        /** Subject line of the inquiry. Required. */
        @Schema(example = "Partnership Inquiry — Knit Factory Automation")
        @NotBlank(message = "Subject is required")
        @Size(max = 200, message = "Subject must be at most {max} characters")
        String subject,

        /** Free-text message body. Required. */
        @Schema(example = "We operate a knit composite mill in Gazipur and would like to discuss how FABINS could improve our current inspection workflow.")
        @NotBlank(message = "Message is required")
        @Size(max = 5000, message = "Message must be at most {max} characters")
        String message,

        /**
         * Bot honeypot field — rendered hidden in the form, never filled by a
         * real user. A non-blank value signals a bot; the service silently fakes
         * success rather than rejecting explicitly (so the bot cannot adapt).
         *
         * <p>Validation-wise this field is unconstrained: we want to accept any
         * value (including blanks and garbage) and decide in the service layer.
         */
        @Schema(hidden = true)
        String honeypot

) {
    /**
     * Compact canonical constructor — trims every string field on the way in,
     * so later comparisons and persistence never see accidental leading or
     * trailing whitespace.
     *
     * <p>The {@code honeypot} field is left untrimmed intentionally: a blank
     * honeypot means "not filled by a bot", and trimming {@code null} would
     * produce a {@link NullPointerException}.
     */
    public CreateContactInquiry {
        if (name    != null) name    = name.trim();
        if (email   != null) email   = email.trim();
        if (subject != null) subject = subject.trim();
        if (message != null) message = message.trim();
    }
}
