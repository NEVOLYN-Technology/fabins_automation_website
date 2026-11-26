package com.fabins.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Incoming payload for {@code POST /api/v1/deployment-requests}.
 *
 * <p>Captures the 8 essential factory profile and machinery credentials
 * needed for an automated AI retrofit feasibility assessment.
 */
@Schema(description = "Factory credentials for a FABINS Vision AI retrofit assessment")
public record CreateDeploymentRequest(

        @Schema(example = "Apex Textile Mills", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Mill / Factory name is required")
        @Size(max = 200, message = "Mill name must be at most {max} characters")
        String millName,

        @Schema(example = "Winda / Bianco / Lafer", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Machine brand is required")
        @Size(max = 150, message = "Machine brand must be at most {max} characters")
        String machineBrand,

        @Schema(example = "Board Bazar, Gazipur", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Location / Zone is required")
        @Size(max = 200, message = "Location must be at most {max} characters")
        String location,

        @Schema(example = "Md. Rahim Ahmed", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Contact representative name is required")
        @Size(max = 200, message = "Contact name must be at most {max} characters")
        String contactName,

        @Schema(example = "rahim@apextextiles.com", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Work email is required")
        @Email(message = "Work email must be a valid email address")
        @Size(max = 320, message = "Email must be at most {max} characters")
        String email,

        @Schema(example = "+880 1700-000000", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Phone / WhatsApp number is required")
        @Size(max = 50, message = "Phone must be at most {max} characters")
        @Pattern(regexp = "^[+0-9][0-9 ()\\-]{4,}$", message = "Phone may contain digits, spaces, and + ( ) - only")
        String phone,

        @Schema(example = "Knit Fabric Mill")
        @Size(max = 100, message = "Factory type must be at most {max} characters")
        String factoryType,

        @Schema(example = "72 inches (182 cm)")
        @Size(max = 50, message = "Roll width must be at most {max} characters")
        String rollWidth
) {
    /**
     * Compact constructor: normalizes inputs by trimming surrounding whitespace
     * and reducing blank strings to null before validation annotations execute.
     */
    public CreateDeploymentRequest {
        millName = trimToNull(millName);
        machineBrand = trimToNull(machineBrand);
        location = trimToNull(location);
        contactName = trimToNull(contactName);
        email = trimToNull(email);
        phone = trimToNull(phone);
        factoryType = trimToNull(factoryType);
        rollWidth = trimToNull(rollWidth);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
