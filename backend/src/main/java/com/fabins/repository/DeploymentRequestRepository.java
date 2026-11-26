package com.fabins.repository;

import com.fabins.entity.DeploymentRequest;
import com.fabins.entity.enums.DeploymentRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Database access for {@link DeploymentRequest}.
 *
 * <p>There is no implementation class: Spring Data generates one at startup
 * from the method names below. {@code findByStatus} becomes
 * {@code WHERE status = ?} without any SQL being written.
 *
 * <p>Keep query methods here rather than in the service. The service decides
 * <em>what</em> should happen; the repository decides <em>how</em> rows are
 * fetched.
 */
@Repository
public interface DeploymentRequestRepository extends JpaRepository<DeploymentRequest, UUID> {

    /**
     * Returns one page of requests in a given stage, newest first.
     *
     * <p>Paginated rather than returning a list, because this table grows
     * without bound and an admin screen must never load every row at once.
     */
    Page<DeploymentRequest> findByStatusOrderBySubmittedAtDesc(DeploymentRequestStatus status,
                                                               Pageable pageable);

    /** Returns one page of all requests, newest first. */
    Page<DeploymentRequest> findAllByOrderBySubmittedAtDesc(Pageable pageable);
}
