package com.fabins.service.impl;

import com.fabins.entity.DeploymentRequest;
import com.fabins.service.PdfGenerationService;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Generates an official, publication-quality PDF assessment report for FABINS
 * deployment enquiries.
 * Formatted and attached to automated email dispatches sent to both the
 * engineering desk and client applicant.
 */
@Service
public class PdfGenerationServiceImpl implements PdfGenerationService {

    private static final Logger log = LoggerFactory.getLogger(PdfGenerationServiceImpl.class);

    private static final Color COLOR_PRIMARY = new Color(15, 23, 42); // Slate 900
    private static final Color COLOR_ACCENT = new Color(14, 165, 233); // Cyan / Sky 500
    private static final Color COLOR_HEADER_BG = new Color(241, 245, 249); // Slate 100
    private static final Color COLOR_BORDER = new Color(203, 213, 225); // Slate 300
    private static final Color COLOR_LABEL_BG = new Color(248, 250, 252); // Slate 50
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

            // Section 2: Contact Representative & Machine Parameters
            addSectionHeader(document, "2. TECHNICAL REPRESENTATIVE & SPECIFICATIONS");
            addContactTable(document, request);

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
        PdfPTable headerTable = new PdfPTable(3);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[] { 11f, 54f, 35f });
        headerTable.setSpacingAfter(10f);

        // Logo cell on the left
        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        logoCell.setPaddingRight(6f);
        try {
            ClassPathResource logoRes = new ClassPathResource("static/fabins-logo.png");
            if (logoRes.exists()) {
                try (InputStream is = logoRes.getInputStream()) {
                    Image logoImg = Image.getInstance(is.readAllBytes());
                    logoImg.scaleToFit(38f, 38f);
                    logoCell.addElement(logoImg);
                }
            }
        } catch (Exception e) {
            log.warn("Could not embed logo in PDF header: {}", e.getMessage());
        }
        headerTable.addCell(logoCell);

        // Company & Product Title
        Font titleFont = new Font(Font.HELVETICA, 15, Font.BOLD, COLOR_PRIMARY);
        Font subTitleFont = new Font(Font.HELVETICA, 8.5f, Font.BOLD, COLOR_ACCENT);
        Font orgFont = new Font(Font.HELVETICA, 8, Font.NORMAL, COLOR_TEXT_MUTED);

        Paragraph leftPara = new Paragraph();
        leftPara.add(new Phrase("NEVOLYN\n", orgFont));
        leftPara.add(new Phrase("FABINS Vision AI Retrofit Assessment\n", titleFont));
        leftPara.add(new Phrase("AUTOMATED FABRIC DEFECT DETECTION & CLASSIFICATION\n", subTitleFont));

        PdfPCell leftCell = new PdfPCell(leftPara);
        leftCell.setBorder(Rectangle.NO_BORDER);
        leftCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        headerTable.addCell(leftCell);

        // Official Reference Badge on Right
        Font badgeFont = new Font(Font.HELVETICA, 8.5f, Font.BOLD, COLOR_PRIMARY);
        Font badgeSub = new Font(Font.HELVETICA, 7.5f, Font.NORMAL, COLOR_TEXT_MUTED);

        Paragraph rightPara = new Paragraph();
        rightPara.setAlignment(Element.ALIGN_RIGHT);
        rightPara.add(new Phrase("OFFICIAL ASSESSMENT COPY\n", badgeFont));
        rightPara.add(new Phrase("DISPATCH TO: fabins@nevolyn.com\n", badgeSub));

        PdfPCell rightCell = new PdfPCell(rightPara);
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        headerTable.addCell(rightCell);

        document.add(headerTable);
    }

    private void addMetadataBar(Document document, DeploymentRequest request) throws DocumentException {
        PdfPTable metaTable = new PdfPTable(3);
        metaTable.setWidthPercentage(100);
        metaTable.setWidths(new float[] { 35f, 40f, 25f });
        metaTable.setSpacingAfter(15f);

        Font labelFont = new Font(Font.HELVETICA, 7.5f, Font.BOLD, COLOR_TEXT_MUTED);
        Font valFont = new Font(Font.HELVETICA, 9, Font.BOLD, COLOR_PRIMARY);

        String refCode = request.getReferenceCode();
        String dateStr = request.getSubmittedAt() != null
                ? DATE_FORMATTER.format(request.getSubmittedAt())
                : DATE_FORMATTER.format(java.time.Instant.now());

        // Cell 1: Reference Code
        PdfPCell cell1 = createMetaCell("REFERENCE CODE", refCode, labelFont, valFont);
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
        table.setWidths(new float[] { 22f, 28f, 22f, 28f });
        table.setSpacingAfter(10f);

        addKeyValueRow(table, "Mill / Factory Name", valueOrNA(request.getMillName()),
                              "Machine / Frame Brand", valueOrNA(request.getMachineBrand()));
        addKeyValueRow(table, "Factory Location / Zone", valueOrNA(request.getLocation()),
                              "Operation / Sector Type", valueOrNA(request.getFactoryType()));

        document.add(table);
    }

    private void addContactTable(Document document, DeploymentRequest request) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[] { 22f, 28f, 22f, 28f });
        table.setSpacingAfter(12f);

        addKeyValueRow(table, "Technical Representative", valueOrNA(request.getContactName()),
                              "Work Email Address", valueOrNA(request.getEmail()));
        addKeyValueRow(table, "Phone / WhatsApp", valueOrNA(request.getPhone()),
                              "Roll / Table Width", valueOrNA(request.getRollWidth()));

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
        footerTable.setSpacingBefore(12f);

        Font noticeHeaderFont = new Font(Font.HELVETICA, 8, Font.BOLD, COLOR_PRIMARY);
        Font noticeBodyFont = new Font(Font.HELVETICA, 7, Font.NORMAL, COLOR_TEXT_MUTED);

        Paragraph p = new Paragraph();
        p.add(new Phrase("INDUSTRIAL VERIFICATION & MUTUAL NON-DISCLOSURE GUARANTEE\n", noticeHeaderFont));
        p.add(new Phrase(
                "This technical assessment document is automatically compiled by NEVOLYN on behalf of " +
                valueOrNA(request.getMillName()) + " under mutual industrial non-disclosure terms. Machine parameters " +
                "and roll dimensions are retained securely for AI model architecture configuration and edge camera retrofit planning. " +
                "For technical verifications, contact the engineering desk at fabins@nevolyn.com.",
                noticeBodyFont
        ));

        PdfPCell cell = new PdfPCell(p);
        cell.setBackgroundColor(COLOR_HEADER_BG);
        cell.setBorderColor(COLOR_BORDER);
        cell.setPadding(8f);
        footerTable.addCell(cell);

        document.add(footerTable);
    }

    private String valueOrNA(String val) {
        return (val == null || val.isBlank()) ? "Not Specified" : val.trim();
    }
}