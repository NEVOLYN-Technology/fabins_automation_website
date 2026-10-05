package com.fabins.service;

import com.fabins.dto.request.CreateContactInquiry;
import com.fabins.dto.response.ContactInquiryResponse;

import java.util.UUID;

/**
 * Business operations for general contact inquiries submitted via the FABINS
 * homepage "Let's Connect" form.
 *
 * <p>The controller depends on this interface, not on the implementation, so
 * the two can change independently. A test can also substitute a stub without
 * requiring a mocking framework.
 *
 * <p>Note the vocabulary: nothing here mentions HTTP. The interface describes
 * what the application <em>does</em>. The same method could be driven from a
 * scheduled batch importer or a message consumer without any change to this
 * contract.
 *
 * @see com.fabins.service.impl.ContactInquiryServiceImpl
 */
public interface ContactInquiryService {

    /**
     * Records a new general inquiry from the homepage contact form, triggers
     * email notifications, and returns the stored inquiry.
     *
     * <p>The honeypot field on {@code dto} is checked <em>before</em> any
     * database activity: a non-blank value causes a fake-success response to
     * be returned immediately, indistinguishable from a real success to a bot.
     *
     * @param dto the validated request payload (already trimmed and validated
     *            by Bean Validation before reaching this layer)
     * @return the persisted inquiry as a public-facing response record
     */
    ContactInquiryResponse submit(CreateContactInquiry dto);

    /**
     * Retrieves a contact inquiry by id.
     *
     * @param id the inquiry's UUID primary key
     * @return the inquiry response
     * @throws com.fabins.exception.ResourceNotFoundException if no inquiry has that id
     */
    ContactInquiryResponse getById(UUID id);

    /**
     * Acknowledges a contact inquiry (moving its status to {@code REPLIED})
     * and dispatches an acknowledgement email to the visitor.
     *
     * <p>Triggered by the one-click acknowledge link in the admin notification
     * email. No authentication is required — the link is protected by the
     * opaqueness of the UUID, not by a credential.
     *
     * @param id the inquiry's UUID primary key
     * @return the updated inquiry response
     * @throws com.fabins.exception.ResourceNotFoundException if no inquiry has that id
     */
    ContactInquiryResponse acknowledge(UUID id);
}
