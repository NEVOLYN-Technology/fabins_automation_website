package com.fabins.service;

import com.fabins.entity.DeploymentRequest;

/**
 * Generates an official, publication-quality PDF report for an assessment enquiry
 * to be attached to email dispatches and downloaded by the mill contact.
 */
public interface PdfGenerationService {

    /**
     * Generates a branded assessment summary PDF document for the given deployment request.
     *
     * @param request the persisted deployment request
     * @return PDF file contents as a byte array
     */
    byte[] generateDeploymentAssessmentPdf(DeploymentRequest request);
}
