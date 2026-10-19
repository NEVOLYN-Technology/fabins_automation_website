package com.fabins.repository;

import com.fabins.entity.ContactInquiry;
import com.fabins.entity.enums.ContactInquiryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Spring Data JPA repository for {@link ContactInquiry} entities.
 */
public interface ContactInquiryRepository extends JpaRepository<ContactInquiry, UUID> {

    /**
     * Finds all inquiries ordered newest first.
     */
    Page<ContactInquiry> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Finds inquiries by status ordered newest first.
     */
    Page<ContactInquiry> findByStatusOrderByCreatedAtDesc(ContactInquiryStatus status, Pageable pageable);
}
