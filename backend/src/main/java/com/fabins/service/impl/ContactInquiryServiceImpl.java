package com.fabins.service.impl;

import com.fabins.dto.request.CreateContactInquiry;
import com.fabins.dto.response.ContactInquiryResponse;
import com.fabins.entity.ContactInquiry;
import com.fabins.entity.enums.ContactInquiryStatus;
import com.fabins.exception.ResourceNotFoundException;
import com.fabins.mapper.ContactInquiryMapper;
import com.fabins.repository.ContactInquiryRepository;
import com.fabins.service.ContactInquiryService;
import com.fabins.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Default implementation of {@link ContactInquiryService}.
 *
 * <h2>Honeypot handling</h2>
 * The homepage form includes a hidden {@code honeypot} field that real users
 * never see. A non-blank value means an automated bot filled it in. Rather than
 * returning a 400 (which tells the bot to adapt), we return a 201 with a fake
 * response object — the bot cannot distinguish success from rejection. No
 * database write and no email are triggered.
 *
 * <h2>Email notification</h2>
 * After a successful {@code save()}, both an internal R&amp;D team alert and a
 * visitor sender-confirmation are dispatched asynchronously by
 * {@link EmailService}. Because the dispatch is {@code @Async}, the HTTP 201
 * response returns to the browser immediately; email delivery does not block
 * the request. A failed notification is logged but never propagates back to the
 * caller — a successfully recorded inquiry must not become a 500 because of a
 * transient mail-server hiccup.
 *
 * @see ContactInquiryService
 * @see com.fabins.service.impl.EmailServiceImpl
 */
@Service
public class ContactInquiryServiceImpl implements ContactInquiryService {

    private static final Logger log = LoggerFactory.getLogger(ContactInquiryServiceImpl.class);

    private final ContactInquiryRepository repository;
    private final ContactInquiryMapper     mapper;
    private final EmailService             emailService;

    /**
     * Constructor injection — Spring resolves all three dependencies from the
     * application context. Constructor injection is preferred over field
     * injection because:
     * <ul>
     *   <li>The required collaborators are explicit in the class signature.</li>
     *   <li>Unit tests can instantiate this class with real or stub
     *       collaborators without a Spring context.</li>
     *   <li>The fields can be {@code final}, preventing reassignment.</li>
     * </ul>
     */
    public ContactInquiryServiceImpl(ContactInquiryRepository repository,
                                     ContactInquiryMapper mapper,
                                     EmailService emailService) {
        this.repository   = repository;
        this.mapper       = mapper;
        this.emailService = emailService;
    }

    /**
     * {@inheritDoc}
     *
     * <p>Processing steps:
     * <ol>
     *   <li>Check the honeypot field — if non-blank, return a fake success
     *       immediately without touching the database.</li>
     *   <li>Map the validated DTO to a new {@link ContactInquiry} entity via
     *       {@link ContactInquiryMapper#toEntity(CreateContactInquiry)}.</li>
     *   <li>Persist the entity via
     *       {@link ContactInquiryRepository#save(Object)}. JPA auditing writes
     *       {@code createdAt} and {@code updatedAt} on the first flush.</li>
     *   <li>Trigger asynchronous email notifications for both the admin and the
     *       visitor.</li>
     *   <li>Map the persisted entity (now with id + timestamps) to a response
     *       DTO and return it.</li>
     * </ol>
     */
    @Override
    @Transactional
    public ContactInquiryResponse submit(CreateContactInquiry dto) {

        // ── Honeypot check ─────────────────────────────────────────────────
        // A non-blank honeypot means a bot filled the hidden form field.
        // Return a fake 201 so the bot cannot distinguish rejection.
        if (dto.honeypot() != null && !dto.honeypot().isBlank()) {
            log.debug("Honeypot triggered on contact inquiry from '{}' — silently ignoring", dto.email());
            // Build a detached entity with no id so the caller receives a
            // believable-looking response without a database write.
            ContactInquiry fake = ContactInquiry.create(
                    dto.name(), dto.email(), dto.subject(), dto.message());
            return mapper.toResponse(fake);
        }

        // ── Persist ────────────────────────────────────────────────────────
        ContactInquiry entity = mapper.toEntity(dto);
        ContactInquiry saved  = repository.save(entity);

        log.info("Contact inquiry submitted: id={}, ref={}, email={}",
                saved.getId(), saved.getReferenceCode(), saved.getEmail());

        // ── Email notifications (async — never blocks the response) ────────
        // Any exception inside the async method is caught and logged there;
        // it is never propagated here.
        emailService.sendContactInquiryNotifications(saved);

        // ── Return public-facing response ──────────────────────────────────
        return mapper.toResponse(saved);
    }

    /**
     * {@inheritDoc}
     *
     * <p>Processing steps:
     * <ol>
     *   <li>Look up the inquiry by id — throws {@link ResourceNotFoundException}
     *       (mapped to HTTP 404) if it does not exist.</li>
     *   <li>Move the status to {@link ContactInquiryStatus#REPLIED}.</li>
     *   <li>Persist the change.</li>
     *   <li>Dispatch an asynchronous acknowledgement email to the visitor.</li>
     *   <li>Return the updated response DTO.</li>
     * </ol>
     *
     * <p>Calling this method on an inquiry that is already {@code REPLIED} is
     * idempotent: the status is set to the same value and the email is sent
     * again — this mirrors the behaviour of the deploy-request acknowledge
     * endpoint and prevents surprising errors when the admin clicks a stale link.
     */
    @Override
    @Transactional
    public ContactInquiryResponse acknowledge(UUID id) {
        ContactInquiry inquiry = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact inquiry", id));

        // When acknowledged one time, cannot be acknowledged again.
        if (inquiry.getStatus() == ContactInquiryStatus.REPLIED) {
            log.info("Contact inquiry {} has already been acknowledged; skipping duplicate email dispatch", id);
            return mapper.toResponse(inquiry);
        }

        // Mark as replied and save
        inquiry.markReplied();
        ContactInquiry saved = repository.save(inquiry);

        log.info("Contact inquiry acknowledged: id={}, ref={}",
                saved.getId(), saved.getReferenceCode());

        // Dispatch acknowledgement email asynchronously
        emailService.sendContactInquiryAcknowledgement(saved);

        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ContactInquiryResponse getById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Contact inquiry", id));
    }
}
