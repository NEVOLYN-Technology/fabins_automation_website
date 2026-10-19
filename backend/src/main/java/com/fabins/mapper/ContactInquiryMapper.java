package com.fabins.mapper;

import com.fabins.dto.request.CreateContactInquiry;
import com.fabins.dto.response.ContactInquiryResponse;
import com.fabins.entity.ContactInquiry;
import org.springframework.stereotype.Component;

/**
 * Converts between {@link ContactInquiry} entities and their DTOs.
 *
 * <p>Mapping lives here rather than being scattered across the service and
 * controller, so there is exactly one place to update when a field is added.
 * Adding a column to the entity has no effect on the public API until this
 * class exposes it — leaking an internal field has to be a deliberate act,
 * not an accident.
 *
 * <p>Written by hand rather than generated with MapStruct or ModelMapper.
 * With one entity the mapping is ten lines, and hand-written code produces
 * clearer stack traces and no build-time code generation to reason about.
 */
@Component
public class ContactInquiryMapper {

    /**
     * Builds a new {@link ContactInquiry} entity from a validated DTO.
     *
     * <p>Delegates to the entity's factory method rather than setting fields
     * directly, so the initial status ({@code NEW}) is enforced by the entity
     * itself and never controlled by the caller.
     *
     * @param dto the validated incoming request DTO
     * @return a transient (not yet persisted) entity
     */
    public ContactInquiry toEntity(CreateContactInquiry dto) {
        return ContactInquiry.create(
                dto.name(),
                dto.email(),
                dto.subject(),
                dto.message()
        );
    }

    /**
     * Converts a persisted {@link ContactInquiry} entity into the public
     * API response record.
     *
     * <p>Only the fields declared on {@link ContactInquiryResponse} are
     * exposed — any future internal-only fields on the entity (e.g. assigned
     * team member, reply notes) are silently excluded by not being listed here.
     *
     * @param inquiry a persisted entity (with id and timestamps assigned)
     * @return the public-facing response record
     */
    public ContactInquiryResponse toResponse(ContactInquiry inquiry) {
        return new ContactInquiryResponse(
                inquiry.getId(),
                inquiry.getReferenceCode(),
                inquiry.getName(),
                inquiry.getEmail(),
                inquiry.getSubject(),
                inquiry.getMessage(),
                inquiry.getStatus(),
                inquiry.getCreatedAt()
        );
    }
}
