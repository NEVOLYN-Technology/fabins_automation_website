package com.fabins.service;

import com.fabins.dto.request.CreateDeploymentRequest;
import com.fabins.dto.response.DeploymentRequestResponse;
import com.fabins.dto.response.PageResponse;
import com.fabins.entity.enums.DeploymentRequestStatus;
import com.fabins.exception.ResourceNotFoundException;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Business operations on deployment requests.
 *
 * <p>The controller depends on this interface, not on the implementation, so
 * the two can change independently — and a test can substitute a stub without
 * a mocking framework.
 *
 * <p>Note the vocabulary: nothing here mentions HTTP. The interface describes
 * what the application <em>does</em>, which is why the same methods could be
 * driven from a scheduled job or a message consumer without change.
 *
 * @see com.fabins.service.impl.DeploymentRequestServiceImpl
 */
public interface DeploymentRequestService {

    /**
     * Records a new request from the website form.
     *
     * @param request validated payload
     * @return the stored request, including its generated id and timestamps
     */
    DeploymentRequestResponse submit(CreateDeploymentRequest request);

    /**
     * Lists requests, newest first, optionally filtered by status.
     *
     * @param status   stage to filter by, or {@code null} for all
     * @param pageable page number, size, and sort
     */
    PageResponse<DeploymentRequestResponse> list(DeploymentRequestStatus status, Pageable pageable);

    /**
     * Fetches one request.
     *
     * @throws ResourceNotFoundException if no request has that id
     */
    DeploymentRequestResponse getById(UUID id);

    /**
     * Moves a request to a new stage of the follow-up process.
     *
     * @throws ResourceNotFoundException if no request has that id
     */
    DeploymentRequestResponse changeStatus(UUID id, DeploymentRequestStatus newStatus);

    /**
     * Acknowledges a deployment request (moving status to IN_REVIEW) and sends an acknowledgement email to sender.
     *
     * @param id the request id
     * @return updated response
     */
    DeploymentRequestResponse acknowledge(UUID id);

    /**
     * Generates a preview assessment PDF byte stream from an unpersisted request payload.
     *
     * @param request validated payload
     * @return PDF binary bytes
     */
    byte[] generatePreviewPdf(CreateDeploymentRequest request);

    /**
     * Compiles and fetches the official assessment PDF for a previously submitted request.
     *
     * @param id the request id
     * @return PDF binary bytes
     */
    byte[] getAssessmentPdf(UUID id);

    /**
     * Deletes a single request by id.
     *
     * @param id the request id
     * @throws ResourceNotFoundException if no request has that id
     */
    void deleteById(UUID id);

    /**
     * Deletes all deployment requests from the database.
     */
    void deleteAll();
}
