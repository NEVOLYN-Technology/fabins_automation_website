package com.fabins.service.impl;

import com.fabins.entity.DeploymentRequest;
import com.fabins.service.PdfGenerationService;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

/**
 * Generates an official, publication-quality PDF assessment report for FABINS deployment enquiries.
 * Attached to automated email dispatches sent to both fabins@nevolyn.com and the client applicant.
 */
@Service
public class PdfGenerationServiceImpl implements PdfGenerationService {

    private static final Logger log = LoggerFactory.getLogger(PdfGenerationServiceImpl.class);

    private static final Color COLOR_PRIMARY = new Color(15, 23, 42);      // Slate 900
    private static final Color COLOR_ACCENT = new Color(14, 165, 233);     // Cyan / Sky 500
    private static final Color COLOR_HEADER_BG = new Color(241, 245, 249); // Slate 100
    private static final Color COLOR_BORDER = new Color(203, 213, 225);    // Slate 300
    private static final Color COLOR_LABEL_BG = new Color(248, 250, 252);  // Slate 50
    private static final Color COLOR_TEXT_MUTED = new Color(100, 116, 139); // Slate 500

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter
            .ofPattern("dd MMMM yyyy, HH:mm:ss z")
            .withZone(ZoneId.of("UTC"));

    @Override
    public byte[] generateDeploymentAssessmentPdf(DeploymentRequest request) {
        log.info("Generating PDF assessment report for request reference: {}", request.getReferenceCode());

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 40, 40);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Document Header Banner
            addHeader(document, request);

            // Metadata / Reference Strip
            addMetadataBar(document, request);

            // Section 1: Mill & Facility Profile
            addSectionHeader(document, "1. MILL & FACILITY PROFILE");
            addFacilityTable(document, request);

            // Section 2: Contact Representative Information
            addSectionHeader(document, "2. REPRESENTATIVE & COMMUNICATIONS");
            addContactTable(document, request);

            // Section 3: Technical Specifications & Retrofit Scope
            addSectionHeader(document, "3. TECHNICAL RETROFIT & OPERATION SCOPE");
            addTechnicalTable(document, request);

            // Security, NDA & Verification Footer
            addFooterNotice(document, request);

            document.close();
            return baos.toByteArray();
        } catch (DocumentException | java.io.IOException e) {
            log.error("Failed to compile deployment assessment PDF for reference: {}", request.getReferenceCode(), e);
            throw new IllegalStateException("PDF compilation error", e);
        }
    }

    private void addHeader(Document document, DeploymentRequest request) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{65f, 35f});
        headerTable.setSpacingAfter(10f);

        // Company & Product Title
        Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD, COLOR_PRIMARY);
        Font subTitleFont = new Font(Font.HELVETICA, 9, Font.BOLD, COLOR_ACCENT);
        Font orgFont = new Font(Font.HELVETICA, 8, Font.NORMAL, COLOR_TEXT_MUTED);

        Paragraph leftPara = new Paragraph();
        leftPara.add(new Phrase("NEVOLYN TECHNOLOGY\n", orgFont));
        leftPara.add(new Phrase("FABINS Vision AI Retrofit Assessment\n", titleFont));
        leftPara.add(new Phrase("AUTOMATED FABRIC DEFECT DETECTION & CLASSIFICATION\n", subTitleFont));

        PdfPCell leftCell = new PdfPCell(leftPara);
        leftCell.setBorder(Rectangle.NO_BORDER);
        leftCell.setPaddingBottom(6f);
        headerTable.addCell(leftCell);

        // Official Reference Badge on Right
        Font badgeFont = new Font(Font.HELVETICA, 9, Font.BOLD, COLOR_PRIMARY);
        Font badgeSub = new Font(Font.HELVETICA, 7, Font.NORMAL, COLOR_TEXT_MUTED);

        Paragraph rightPara = new Paragraph();
        rightPara.setAlignment(Element.ALIGN_RIGHT);
        rightPara.add(new Phrase("OFFICIAL ASSESSMENT COPY\n", badgeFont));
        rightPara.add(new Phrase("DISPATCH TO: fabins@nevolyn.com\n", badgeSub));
        rightPara.add(new Phrase("WEB: nevolyn.com\n", badgeSub));

        PdfPCell rightCell = new PdfPCell(rightPara);
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        headerTable.addCell(rightCell);

        document.add(headerTable);
    }

    private void addMetadataBar(Document document, DeploymentRequest request) throws DocumentException {
        PdfPTable metaTable = new PdfPTable(3);
        metaTable.setWidthPercentage(100);
        metaTable.setWidths(new float[]{35f, 40f, 25f});
        metaTable.setSpacingAfter(15f);

        Font labelFont = new Font(Font.HELVETICA, 7, Font.BOLD, COLOR_TEXT_MUTED);
        Font valFont = new Font(Font.HELVETICA, 9, Font.BOLD, COLOR_PRIMARY);

        String refCode = request.getReferenceCode();
        String dateStr = request.getSubmittedAt() != null
                ? DATE_FORMATTER.format(request.getSubmittedAt())
                : DATE_FORMATTER.format(java.time.Instant.now());

        // Cell 1: Reference Code
        PdfPCell cell1 = createMetaCell("APPLICATION REFERENCE ID", refCode, labelFont, valFont);
        // Cell 2: Submission Timestamp
        PdfPCell cell2 = createMetaCell("SUBMISSION TIMESTAMP (UTC)", dateStr, labelFont, valFont);
        // Cell 3: Verification Status
        PdfPCell cell3 = createMetaCell("RECORD STATUS", "VERIFIED & LOGGED", labelFont, valFont);

        metaTable.addCell(cell1);
        metaTable.addCell(cell2);
        metaTable.addCell(cell3);

        document.add(metaTable);
    }

    private PdfPCell createMetaCell(String label, String value, Font labelFont, Font valFont) {
        Paragraph p = new Paragraph();
        p.add(new Phrase(label + "\n", labelFont));
        p.add(new Phrase(value, valFont));

        PdfPCell cell = new PdfPCell(p);
        cell.setBackgroundColor(COLOR_HEADER_BG);
        cell.setBorderColor(COLOR_BORDER);
        cell.setPadding(6f);
        return cell;
    }

    private void addSectionHeader(Document document, String title) throws DocumentException {
        Font sectionFont = new Font(Font.HELVETICA, 9, Font.BOLD, COLOR_PRIMARY);
        Paragraph p = new Paragraph(title, sectionFont);
        p.setSpacingBefore(8f);
        p.setSpacingAfter(4f);
        document.add(p);
    }

    private void addFacilityTable(Document document, DeploymentRequest request) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{22f, 28f, 22f, 28f});
        table.setSpacingAfter(10f);

        String extractedBrand = extractMachineBrand(request);

        addKeyValueRow(table, "Mill / Factory Name", valueOrNA(request.getMillName()),
                              "Machine / Frame Brand", valueOrNA(extractedBrand));
        addKeyValueRow(table, "Factory Location / Zone", valueOrNA(request.getLocation()),
                              "Industry Sector", valueOrNA(request.getFactoryType()));

        document.add(table);
    }

    private void addContactTable(Document document, DeploymentRequest request) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{22f, 28f, 22f, 28f});
        table.setSpacingAfter(10f);

        addKeyValueRow(table, "Representative Name", valueOrNA(request.getContactName()),
                              "Job Title / Designation", valueOrNA(request.getDesignation()));
        addKeyValueRow(table, "Work Email Address", valueOrNA(request.getEmail()),
                              "Phone / WhatsApp", valueOrNA(request.getPhone()));

        document.add(table);
    }

    private void addTechnicalTable(Document document, DeploymentRequest request) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{22f, 28f, 22f, 28f});
        table.setSpacingAfter(12f);

        addKeyValueRow(table, "Roll / Table Width", valueOrNA(request.getRollWidth()),
                              "Inspection Frames", valueOrNA(request.getInspectionFramesCount()));
        addKeyValueRow(table, "Fabric Types Handled", valueOrNA(request.getFabricTypes()),
                              "Daily Production Vol.", valueOrNA(request.getDailyProductionVolume()));
        addKeyValueRow(table, "Target Inspection Speed", valueOrNA(request.getInspectionSpeed()),
                              "Target Timeline", valueOrNA(request.getTargetTimeline()));

        // Add special technical requirements if present
        if (request.getMessage() != null && !request.getMessage().isBlank()) {
            Font labelFont = new Font(Font.HELVETICA, 8, Font.BOLD, COLOR_TEXT_MUTED);
            Font valFont = new Font(Font.HELVETICA, 8, Font.NORMAL, COLOR_PRIMARY);

            PdfPCell labelCell = new PdfPCell(new Phrase("Additional Notes & Specs", labelFont));
            labelCell.setBackgroundColor(COLOR_LABEL_BG);
            labelCell.setBorderColor(COLOR_BORDER);
            labelCell.setPadding(5f);

            PdfPCell valCell = new PdfPCell(new Phrase(request.getMessage(), valFont));
            valCell.setColspan(3);
            valCell.setBorderColor(COLOR_BORDER);
            valCell.setPadding(5f);

            table.addCell(labelCell);
            table.addCell(valCell);
        }

        document.add(table);
    }

    private void addKeyValueRow(PdfPTable table, String k1, String v1, String k2, String v2) {
        Font labelFont = new Font(Font.HELVETICA, 8, Font.BOLD, COLOR_TEXT_MUTED);
        Font valFont = new Font(Font.HELVETICA, 8, Font.NORMAL, COLOR_PRIMARY);

        PdfPCell l1 = new PdfPCell(new Phrase(k1, labelFont));
        l1.setBackgroundColor(COLOR_LABEL_BG);
        l1.setBorderColor(COLOR_BORDER);
        l1.setPadding(5f);

        PdfPCell val1 = new PdfPCell(new Phrase(v1, valFont));
        val1.setBorderColor(COLOR_BORDER);
        val1.setPadding(5f);

        PdfPCell l2 = new PdfPCell(new Phrase(k2, labelFont));
        l2.setBackgroundColor(COLOR_LABEL_BG);
        l2.setBorderColor(COLOR_BORDER);
        l2.setPadding(5f);

        PdfPCell val2 = new PdfPCell(new Phrase(v2, valFont));
        val2.setBorderColor(COLOR_BORDER);
        val2.setPadding(5f);

        table.addCell(l1);
        table.addCell(val1);
        table.addCell(l2);
        table.addCell(val2);
    }

    private void addFooterNotice(Document document, DeploymentRequest request) throws DocumentException {
        PdfPTable footerTable = new PdfPTable(1);
        footerTable.setWidthPercentage(100);
        footerTable.setSpacingBefore(10f);

        Font noticeTitleFont = new Font(Font.HELVETICA, 7, Font.BOLD, COLOR_PRIMARY);
        Font noticeBodyFont = new Font(Font.HELVETICA, 7, Font.NORMAL, COLOR_TEXT_MUTED);

        Paragraph p = new Paragraph();
        p.add(new Phrase("MUTUAL CONFIDENTIALITY & ENGINEERING ASSESSMENT NOTICE\n", noticeTitleFont));
        p.add(new Phrase(
                "This document is an official assessment record submitted to NEVOLYN Technology for FABINS AI retrofitting. " +
                "All mill specifications and contact credentials provided herein are protected under strict Non-Disclosure terms. " +
                "Direct inquiries regarding this assessment may be addressed to: fabins@nevolyn.com | Official Domain: nevolyn.com\n" +
                "A verified digital copy of this report has been simultaneously delivered to both the NEVOLYN engineering desk and " +
                request.getEmail() + ".",
                noticeBodyFont
        ));

        PdfPCell cell = new PdfPCell(p);
        cell.setBackgroundColor(COLOR_HEADER_BG);
        cell.setBorderColor(COLOR_BORDER);
        cell.setPadding(8f);
        footerTable.addCell(cell);

        document.add(footerTable);
    }

    private String extractMachineBrand(DeploymentRequest request) {
        if (request.getMessage() != null && request.getMessage().contains("Machine / Frame Brand:")) {
            try {
                String sub = request.getMessage().substring(request.getMessage().indexOf("Machine / Frame Brand:") + 22).trim();
                if (sub.contains("|")) {
                    return sub.substring(0, sub.indexOf("|")).trim();
                }
                return sub;
            } catch (Exception e) {
                // Fallback
            }
        }
        return "Specified in Application";
    }

    private String valueOrNA(String val) {
        return (val == null || val.isBlank()) ? "Not Specified" : val.trim();
    }
}
