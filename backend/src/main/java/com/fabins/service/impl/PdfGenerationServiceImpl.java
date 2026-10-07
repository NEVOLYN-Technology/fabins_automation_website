package com.fabins.service.impl;

import com.fabins.entity.DeploymentRequest;
import com.fabins.service.PdfGenerationService;
import com.fabins.service.pdf.DeploymentAssessmentPdfBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * Service implementation for official FABINS deployment assessment PDF
 * generation.
 *
 * <p>
 * Delegates document construction and XHTML/CSS styling to
 * {@link DeploymentAssessmentPdfBuilder},
 * which renders from {@code templates/pdf/deployment-assessment.html}.
 */
@Service
public class PdfGenerationServiceImpl implements PdfGenerationService {

    private static final Logger log = LoggerFactory.getLogger(PdfGenerationServiceImpl.class);

    private final DeploymentAssessmentPdfBuilder pdfBuilder;

    /**
     * Default constructor for unit tests and manual wiring.
     */
    public PdfGenerationServiceImpl() {
        this.pdfBuilder = new DeploymentAssessmentPdfBuilder();
    }

    @Autowired
    public PdfGenerationServiceImpl(DeploymentAssessmentPdfBuilder pdfBuilder) {
        this.pdfBuilder = Objects.requireNonNull(pdfBuilder, "DeploymentAssessmentPdfBuilder cannot be null");
    }

    @Override
    public byte[] generateDeploymentAssessmentPdf(DeploymentRequest request) {
        Objects.requireNonNull(request, "DeploymentRequest cannot be null");

        long start = System.currentTimeMillis();
        String refCode = request.getReferenceCode() != null ? request.getReferenceCode() : "N/A";

        log.info("Generating deployment assessment report for reference: {}", refCode);

        byte[] pdfBytes = pdfBuilder.build(request);

        long duration = System.currentTimeMillis() - start;
        log.info("Successfully generated assessment report from HTML template for reference: {} ({} bytes, took {} ms)",
                refCode, pdfBytes.length, duration);

        return pdfBytes;
    }
}