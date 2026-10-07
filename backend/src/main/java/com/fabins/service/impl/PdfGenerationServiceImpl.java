package com.fabins.service.impl;

import com.fabins.entity.DeploymentRequest;
import com.fabins.service.PdfGenerationService;
import com.lowagie.text.Anchor;
import com.lowagie.text.Chunk;
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

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Generates an official, executive-grade single-page A4 engineering assessment
 * report
 * for FABINS deployment enquiries.
 *
 * <p>
 * Layout Structure:
 * - Direct dual-brand header lockup (FABINS | NEVOLYN)
 * - Metadata strip (Tracking Reference Code & Submission Timestamp)
 * - Single-column 8-row "DEPLOYMENT ASSESSMENT" table holding all 8 authentic
 * customer inputs
 * - Green NDA safeguard alert banner with padlock emblem
 * - 2-column institutional footer with clean corporate typography and
 * hyperlinks
 */
@Service
public class PdfGenerationServiceImpl implements PdfGenerationService {

    private static final Logger log = LoggerFactory.getLogger(PdfGenerationServiceImpl.class);

    // ── Brand Color Palette ────────────────────────────────────────────────
    private static final Color COLOR_PRIMARY = new Color(15, 23, 42); // Slate 900
    private static final Color COLOR_ACCENT = new Color(2, 132, 199); // Sky 600
    private static final Color COLOR_BORDER = new Color(203, 213, 225); // Slate 300
    private static final Color COLOR_TEXT_MUTED = new Color(71, 85, 105); // Slate 600
    private static final Color COLOR_SUCCESS_DOT = new Color(16, 185, 129); // Emerald 500

    private static final Color COLOR_TABLE_HEADER_BG = new Color(219, 228, 238); // Slate soft blue
    private static final Color COLOR_TABLE_LABEL_BG = new Color(248, 250, 252); // Slate 50
    private static final Color COLOR_CARD_BG = new Color(248, 250, 252); // Slate 50

    private static final Color COLOR_NDA_BG = new Color(240, 253, 244); // Emerald 50
    private static final Color COLOR_NDA_BORDER = new Color(187, 247, 208); // Emerald 200
    private static final Color COLOR_NDA_TEXT = new Color(20, 83, 45); // Emerald 900
    private static final Color COLOR_NDA_HEADING = new Color(22, 101, 52); // Emerald 800

    // ── Typography ──────────────────────────────────────────────────────────
    private static final Font FONT_TABLE_HEADER = font(12.0f, Font.BOLD, COLOR_PRIMARY);
    private static final Font FONT_GRID_LABEL = font(8.8f, Font.BOLD, COLOR_TEXT_MUTED);
    private static final Font FONT_GRID_VALUE = font(9.8f, Font.BOLD, COLOR_PRIMARY);
    private static final Font FONT_GRID_LINK = font(9.8f, Font.BOLD, COLOR_ACCENT);

    // ── Assets ──────────────────────────────────────────────────────────────
    private static final String ASSET_FABINS_LOGO = "static/fabins-logo.png";
    private static final String ASSET_NEVOLYN_ICON = "static/nevolyn-icon.png";

    private static final String ASSESSMENT_LABEL = "Official Technical Assessment";

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter
            .ofPattern("dd MMMM yyyy, HH:mm 'UTC'")
            .withZone(ZoneId.of("UTC"));

    private static final float[] GRID_WIDTHS = { 32f, 68f };

    @Override
    public byte[] generateDeploymentAssessmentPdf(DeploymentRequest request) {
        log.info("Compiling official full-page PDF assessment report for reference: {}", request.getReferenceCode());

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 30, 30, 26, 26);
            PdfWriter.getInstance(document, baos);
            document.open();

            // 1. Dual-Brand Header Lockup (Direct on page, no outer card)
            addBrandHeader(document);

            // 2. Metadata Strip (Tracking Reference Code & Submission Timestamp)
            addMetadataStrip(document, request);

            // 3. Official Deployment & Feasibility Request Statement
            addDeploymentRequestStatement(document, request);

            // 4. Consolidated Single-Column 8-Row "DEPLOYMENT ASSESSMENT" Table
            addDeploymentAssessmentTable(document, request);

            // 5. NDA Safeguard Alert Banner
            addNdaBanner(document);

            // 6. Dual-Brand Institutional Footer with Clean Typography & Clickable
            // Hyperlinks
            addInstitutionalFooter(document);

            document.close();
            return baos.toByteArray();
        } catch (DocumentException | java.io.IOException e) {
            log.error("Failed to compile deployment assessment PDF for reference: {}", request.getReferenceCode(), e);
            throw new IllegalStateException("PDF compilation error", e);
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 1. Dual-Brand Header Lockup
    // ═════════════════════════════════════════════════════════════════════════

    private void addBrandHeader(Document document) throws DocumentException {
        // [FABINS: 48%] [Divider: 4%] [NEVOLYN: 48%]
        PdfPTable lockup = new PdfPTable(new float[] { 48f, 4f, 48f });
        lockup.setWidthPercentage(100);

        // --- Left: FABINS Brand Block ---
        PdfPTable fabinsBlock = new PdfPTable(new float[] { 26f, 74f });
        fabinsBlock.setWidthPercentage(100);

        Image fabinsIcon = loadImage(ASSET_FABINS_LOGO, 36f, 36f);
        PdfPCell fabIconCell = fabinsIcon != null ? new PdfPCell(fabinsIcon, false) : new PdfPCell(new Phrase(""));
        styleBorderless(fabIconCell);
        fabIconCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        fabIconCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        fabinsBlock.addCell(fabIconCell);

        Paragraph fabText = new Paragraph();
        fabText.setLeading(14f);
        fabText.add(new Chunk("FAB", font(18f, Font.BOLD, COLOR_PRIMARY)));
        fabText.add(new Chunk("INS", font(18f, Font.BOLD, COLOR_ACCENT)));
        fabText.add(Chunk.NEWLINE);
        fabText.add(
                new Chunk("FABRIC INSPECTION AUTOMATION", new Font(Font.COURIER, 6.8f, Font.BOLD, COLOR_TEXT_MUTED)));
        PdfPCell fabTextCell = new PdfPCell(fabText);
        styleBorderless(fabTextCell);
        fabTextCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        fabTextCell.setPaddingLeft(6f);
        fabinsBlock.addCell(fabTextCell);

        PdfPCell leftCell = new PdfPCell(fabinsBlock);
        styleBorderless(leftCell);
        lockup.addCell(leftCell);

        // --- Center: Vertical Divider ---
        PdfPCell divider = new PdfPCell(new Phrase(""));
        divider.setBorder(Rectangle.RIGHT);
        divider.setBorderColor(COLOR_BORDER);
        divider.setBorderWidth(1.0f);
        lockup.addCell(divider);

        // --- Right: NEVOLYN Brand Block ---
        PdfPTable nevolynBlock = new PdfPTable(new float[] { 26f, 74f });
        nevolynBlock.setWidthPercentage(100);

        Image nevolynIcon = loadImage(ASSET_NEVOLYN_ICON, 34f, 34f);
        PdfPCell nevIconCell = nevolynIcon != null ? new PdfPCell(nevolynIcon, false) : new PdfPCell(new Phrase(""));
        styleBorderless(nevIconCell);
        nevIconCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        nevIconCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        nevolynBlock.addCell(nevIconCell);

        Paragraph nevText = new Paragraph();
        nevText.setLeading(12f);
        nevText.add(new Chunk("POWERED BY\n", font(7.0f, Font.BOLD, COLOR_TEXT_MUTED)));
        nevText.add(link("NEVOLYN", "https://nevolyn.com", font(17.5f, Font.BOLD, COLOR_ACCENT)));
        nevText.add(new Chunk("\nEngineering What is Next", font(7.5f, Font.NORMAL, COLOR_TEXT_MUTED)));
        PdfPCell nevTextCell = new PdfPCell(nevText);
        styleBorderless(nevTextCell);
        nevTextCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        nevTextCell.setPaddingLeft(6f);
        nevolynBlock.addCell(nevTextCell);

        PdfPCell rightCell = new PdfPCell(nevolynBlock);
        styleBorderless(rightCell);
        rightCell.setPaddingLeft(10f);
        lockup.addCell(rightCell);

        document.add(lockup);

        // Subtitle status line: • Official Technical Assessment | fabins@nevolyn.com
        Paragraph status = new Paragraph();
        status.setAlignment(Element.ALIGN_CENTER);
        status.setSpacingBefore(8f);
        status.setSpacingAfter(7f);
        status.add(new Chunk("\u2022 ", font(10f, Font.BOLD, COLOR_SUCCESS_DOT)));
        status.add(new Chunk(ASSESSMENT_LABEL, font(8.5f, Font.BOLD, COLOR_TEXT_MUTED)));
        status.add(new Chunk("   |   ", font(8.5f, Font.BOLD, COLOR_BORDER)));
        status.add(link("fabins@nevolyn.com", "mailto:fabins@nevolyn.com", font(8.5f, Font.BOLD, COLOR_ACCENT)));
        document.add(status);

        // Full-width Accent divider line
        PdfPTable rule = new PdfPTable(1);
        rule.setWidthPercentage(100);
        rule.setSpacingAfter(12f);
        PdfPCell lineCell = new PdfPCell();
        lineCell.setFixedHeight(2f);
        lineCell.setBackgroundColor(COLOR_ACCENT);
        lineCell.setBorder(Rectangle.NO_BORDER);
        rule.addCell(lineCell);
        document.add(rule);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 2. Metadata Strip
    // ═════════════════════════════════════════════════════════════════════════

    private void addMetadataStrip(Document document, DeploymentRequest request) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[] { 50f, 50f });
        table.setWidthPercentage(100);
        table.setSpacingAfter(12f);

        Font labelFont = font(7.5f, Font.BOLD, COLOR_TEXT_MUTED);
        Font refValFont = new Font(Font.COURIER, 13.5f, Font.BOLD, COLOR_ACCENT);
        Font dateValFont = font(12.5f, Font.BOLD, COLOR_PRIMARY);

        Instant submitted = request.getSubmittedAt() != null ? request.getSubmittedAt() : Instant.now();

        table.addCell(
                metaCell("TRACKING REFERENCE CODE", request.getReferenceCode(), labelFont, refValFont, COLOR_CARD_BG));
        table.addCell(metaCell("SUBMISSION TIMESTAMP", DATE_FORMATTER.format(submitted), labelFont, dateValFont,
                COLOR_CARD_BG));

        document.add(table);
    }

    private PdfPCell metaCell(String label, String value, Font labelFont, Font valFont, Color bg) {
        Paragraph p = new Paragraph();
        p.add(new Phrase(label + "\n", labelFont));
        p.add(new Phrase(value, valFont));

        PdfPCell cell = new PdfPCell(p);
        cell.setBackgroundColor(bg);
        cell.setBorderColor(COLOR_BORDER);
        cell.setPaddingTop(6f);
        cell.setPaddingBottom(7f);
        cell.setPaddingLeft(10f);
        cell.setPaddingRight(10f);
        return cell;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 3. Official Deployment & Feasibility Request Statement
    // ═════════════════════════════════════════════════════════════════════════

    private void addDeploymentRequestStatement(Document document, DeploymentRequest request) throws DocumentException {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingAfter(12f);

        Paragraph p = new Paragraph();
        p.setLeading(13.0f);
        p.add(new Chunk("TECHNICAL ASSESSMENT FABINS\n", font(8.8f, Font.BOLD, COLOR_PRIMARY)));

        String mill = valueOrNA(request.getMillName());
        String contact = valueOrNA(request.getContactName());

        p.add(new Chunk("This application is willingly submitted by ",
                font(7.8f, Font.NORMAL, COLOR_TEXT_MUTED)));
        p.add(new Chunk(contact, font(7.8f, Font.BOLD, COLOR_PRIMARY)));
        p.add(new Chunk(" on behalf of ", font(7.8f, Font.NORMAL, COLOR_TEXT_MUTED)));
        p.add(new Chunk(mill, font(7.8f, Font.BOLD, COLOR_PRIMARY)));
        p.add(new Chunk(
                ", who is eager to cooperate with the FABINS team at NEVOLYN for technical assessment. All evaluations and deployment services are provided directly by NEVOLYN's dedicated FABINS team. FABINS does not alter the core mechanical structure of the existing machine; it operates as an add-on retrofitting solution where optical camera frames, a dedicated AI processing unit, and an operator monitor are seamlessly integrated to make the machine smarter. Furthermore, if the client prefers a complete standalone machine setup, the FABINS team is fully capable of providing complete turnkey automated fabric inspection machinery.",
                font(7.8f, Font.NORMAL, COLOR_TEXT_MUTED)));

        PdfPCell cell = new PdfPCell(p);
        cell.setBackgroundColor(COLOR_CARD_BG);
        cell.setBorderColor(COLOR_BORDER);
        cell.setBorderWidth(0.8f);
        cell.setPaddingTop(8f);
        cell.setPaddingBottom(9f);
        cell.setPaddingLeft(12f);
        cell.setPaddingRight(12f);
        table.addCell(cell);

        document.add(table);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 4. Consolidated Single-Column "DEPLOYMENT ASSESSMENT" Table (8 Rows)
    // ═════════════════════════════════════════════════════════════════════════

    private void addDeploymentAssessmentTable(Document document, DeploymentRequest request) throws DocumentException {
        PdfPTable table = new PdfPTable(GRID_WIDTHS);
        table.setWidthPercentage(100);
        table.setSpacingAfter(12f);

        // Header Title Banner spanning all columns
        PdfPCell headerCell = new PdfPCell(new Phrase("DEPLOYMENT ASSESSMENT", FONT_TABLE_HEADER));
        headerCell.setColspan(2);
        headerCell.setBackgroundColor(COLOR_TABLE_HEADER_BG);
        headerCell.setBorderColor(COLOR_BORDER);
        headerCell.setPaddingTop(7.5f);
        headerCell.setPaddingBottom(7.5f);
        headerCell.setPaddingLeft(10f);
        table.addCell(headerCell);

        // 8 Sequential Rows for Authentic Customer Credentials
        addRow(table, Field.of("Mill / Factory Name", valueOrNA(request.getMillName())));
        addRow(table, Field.of("Machine / Frame Brand", valueOrNA(request.getMachineBrand())));
        addRow(table, Field.of("Factory Location / Zone", valueOrNA(request.getLocation())));
        addRow(table, Field.of("Sector / Operation Type", valueOrNA(request.getFactoryType())));
        addRow(table, Field.of("Fabric Roll / Table Width", valueOrNA(request.getRollWidth())));
        addRow(table, Field.of("Representative Name", valueOrNA(request.getContactName())));
        addRow(table, Field.of("Phone / WhatsApp", valueOrNA(request.getPhone())));

        String email = valueOrNA(request.getEmail());
        String emailUrl = request.getEmail() != null && !request.getEmail().isBlank()
                ? "mailto:" + request.getEmail().trim()
                : null;

        addRow(table, emailUrl != null
                ? Field.link("Work Email Address", email, emailUrl)
                : Field.of("Work Email Address", email));

        document.add(table);
    }

    private void addRow(PdfPTable table, Field field) {
        PdfPCell label = new PdfPCell(new Phrase(field.label(), FONT_GRID_LABEL));
        label.setBackgroundColor(COLOR_TABLE_LABEL_BG);
        label.setBorderColor(COLOR_BORDER);
        label.setPaddingTop(6f);
        label.setPaddingBottom(6f);
        label.setPaddingLeft(10f);
        label.setPaddingRight(8f);
        label.setVerticalAlignment(Element.ALIGN_MIDDLE);
        table.addCell(label);

        Paragraph content = new Paragraph();
        if (field.url() != null) {
            content.add(link(field.value(), field.url(), FONT_GRID_LINK));
        } else {
            content.add(new Chunk(field.value(), FONT_GRID_VALUE));
        }
        PdfPCell value = new PdfPCell();
        value.setBackgroundColor(Color.WHITE);
        value.setBorderColor(COLOR_BORDER);
        value.setPaddingTop(6f);
        value.setPaddingBottom(6f);
        value.setPaddingLeft(10f);
        value.setPaddingRight(8f);
        value.setVerticalAlignment(Element.ALIGN_MIDDLE);
        value.addElement(content);
        table.addCell(value);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 4. NDA Safeguard Alert Banner
    // ═════════════════════════════════════════════════════════════════════════

    private void addNdaBanner(Document document) throws DocumentException {
        PdfPTable banner = new PdfPTable(new float[] { 8f, 92f });
        banner.setWidthPercentage(100);
        banner.setSpacingAfter(14f);

        // Left: Lock Emblem Cell
        Image lockIcon = createLockIcon();
        PdfPCell iconCell = lockIcon != null ? new PdfPCell(lockIcon, false) : new PdfPCell(new Phrase(""));
        iconCell.setBackgroundColor(COLOR_NDA_BG);
        iconCell.setBorderColor(COLOR_NDA_BORDER);
        iconCell.setBorder(Rectangle.LEFT | Rectangle.TOP | Rectangle.BOTTOM | Rectangle.RIGHT);
        iconCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        iconCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        iconCell.setPadding(5f);
        banner.addCell(iconCell);

        // Right: NDA Text
        Paragraph p = new Paragraph();
        p.add(new Chunk("NDA ", font(8.8f, Font.BOLD, COLOR_NDA_HEADING)));
        p.add(new Chunk(" \u2022  ", font(8.8f, Font.BOLD, COLOR_NDA_HEADING)));
        p.add(new Chunk("Factory and project data are confidential under a Non-Disclosure Agreement (NDA).",
                font(8.2f, Font.NORMAL, COLOR_NDA_TEXT)));

        PdfPCell textCell = new PdfPCell(p);
        textCell.setBackgroundColor(COLOR_NDA_BG);
        textCell.setBorderColor(COLOR_NDA_BORDER);
        textCell.setBorder(Rectangle.TOP | Rectangle.BOTTOM | Rectangle.RIGHT);
        textCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        textCell.setPaddingLeft(10f);
        textCell.setPaddingTop(6f);
        textCell.setPaddingBottom(6f);
        banner.addCell(textCell);

        document.add(banner);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 6. Institutional Dual-Brand Footer (Clean Typography, No Weird Icons)
    // ═════════════════════════════════════════════════════════════════════════

    private void addInstitutionalFooter(Document document) throws DocumentException {
        // Divider line above footer
        PdfPTable rule = new PdfPTable(1);
        rule.setWidthPercentage(100);
        rule.setSpacingAfter(10f);
        PdfPCell lineCell = new PdfPCell();
        lineCell.setFixedHeight(1.0f);
        lineCell.setBackgroundColor(COLOR_BORDER);
        lineCell.setBorder(Rectangle.NO_BORDER);
        rule.addCell(lineCell);
        document.add(rule);

        // 2-Column Brand Socials
        PdfPTable footer = new PdfPTable(new float[] { 50f, 50f });
        footer.setWidthPercentage(100);
        footer.setSpacingAfter(12f);

        // --- Left: FABINS AUTOMATION ---
        PdfPCell fabinsCol = new PdfPCell();
        styleBorderless(fabinsCol);
        fabinsCol.addElement(new Paragraph("FABINS AUTOMATION", font(9.8f, Font.BOLD, COLOR_PRIMARY)));
        Paragraph fabSub = new Paragraph("Fabric Inspection Automation", font(7.5f, Font.NORMAL, COLOR_TEXT_MUTED));
        fabSub.setSpacingAfter(5f);
        fabinsCol.addElement(fabSub);

        fabinsCol.addElement(createFooterLink("Website", "fabins.nevolyn.com", "https://fabins.nevolyn.com"));
        fabinsCol.addElement(
                createFooterLink("LinkedIn", "fabinsautomation", "https://www.linkedin.com/company/fabinsautomation/"));
        fabinsCol.addElement(
                createFooterLink("Facebook", "fabinsautomation", "https://www.facebook.com/fabinsautomation/"));
        fabinsCol.addElement(createFooterLink("Email", "fabins@nevolyn.com", "mailto:fabins@nevolyn.com"));
        footer.addCell(fabinsCol);

        // --- Right: NEVOLYN ---
        PdfPCell nevolynCol = new PdfPCell();
        styleBorderless(nevolynCol);
        nevolynCol.setPaddingLeft(14f);
        nevolynCol.addElement(new Paragraph("NEVOLYN", font(9.8f, Font.BOLD, COLOR_PRIMARY)));
        Paragraph nevSub = new Paragraph("Engineering What is Next", font(7.5f, Font.NORMAL, COLOR_TEXT_MUTED));
        nevSub.setSpacingAfter(5f);
        nevolynCol.addElement(nevSub);

        nevolynCol.addElement(createFooterLink("Website", "nevolyn.com", "https://nevolyn.com"));
        nevolynCol.addElement(createFooterLink("LinkedIn", "nevolyn", "https://www.linkedin.com/company/nevolyn/"));
        nevolynCol.addElement(createFooterLink("Facebook", "nevolyn", "https://www.facebook.com/nevolyn/"));
        nevolynCol.addElement(createFooterLink("Email", "info@nevolyn.com", "mailto:info@nevolyn.com"));
        footer.addCell(nevolynCol);

        document.add(footer);

        // Bottom Document Classification Strip
        PdfPTable endStrip = new PdfPTable(new float[] { 70f, 30f });
        endStrip.setWidthPercentage(100);

        Paragraph left = new Paragraph(
                "FABINS Industrial Assessment Specification",
                font(6.6f, Font.NORMAL, COLOR_TEXT_MUTED));
        PdfPCell leftCell = new PdfPCell(left);
        leftCell.setBorder(Rectangle.NO_BORDER);
        endStrip.addCell(leftCell);

        Paragraph right = new Paragraph("System Generated",
                font(6.6f, Font.NORMAL, COLOR_TEXT_MUTED));
        right.setAlignment(Element.ALIGN_RIGHT);
        PdfPCell rightCell = new PdfPCell(right);
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        endStrip.addCell(rightCell);

        document.add(endStrip);
    }

    private Paragraph createFooterLink(String label, String value, String url) {
        Paragraph p = new Paragraph();
        p.setLeading(11.5f);
        p.add(new Chunk(label + ":  ", font(7.5f, Font.BOLD, COLOR_TEXT_MUTED)));
        p.add(link(value, url, font(7.5f, Font.BOLD, COLOR_ACCENT)));
        return p;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Procedural Emblem Generator (Lock Emblem for NDA Banner)
    // ═════════════════════════════════════════════════════════════════════════

    private Image createLockIcon() {
        try {
            int size = 28;
            BufferedImage img = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g = img.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            // Dark green rounded rectangle badge
            g.setColor(new Color(47, 107, 73));
            g.fillRoundRect(2, 2, size - 4, size - 4, 7, 7);

            // White lock body
            g.setColor(Color.WHITE);
            g.fillRoundRect(7, 12, 14, 10, 3, 3);

            // White lock shackle
            g.setStroke(new BasicStroke(2.2f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
            g.drawArc(9, 5, 10, 11, 0, 180);

            // Keyhole dot
            g.setColor(new Color(47, 107, 73));
            g.fillOval(13, 15, 2, 3);

            g.dispose();
            Image itextImage = Image.getInstance(img, null);
            itextImage.scaleToFit(15f, 15f);
            return itextImage;
        } catch (Exception e) {
            log.warn("Failed to create lock icon: {}", e.getMessage());
            return null;
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Helpers
    // ═════════════════════════════════════════════════════════════════════════

    private static Font font(float size, int style, Color color) {
        return new Font(Font.HELVETICA, size, style, color);
    }

    private static Anchor link(String text, String url, Font font) {
        Anchor anchor = new Anchor(text, font);
        anchor.setReference(url);
        return anchor;
    }

    private static void styleBorderless(PdfPCell cell) {
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
    }

    private Image loadImage(String classpath, float maxWidth, float maxHeight) {
        try {
            ClassPathResource resource = new ClassPathResource(classpath);
            if (!resource.exists()) {
                log.warn("PDF brand asset not found on classpath: {}", classpath);
                return null;
            }
            try (InputStream is = resource.getInputStream()) {
                Image image = Image.getInstance(is.readAllBytes());
                image.scaleToFit(maxWidth, maxHeight);
                return image;
            }
        } catch (Exception e) {
            log.warn("Could not embed {} in PDF: {}", classpath, e.getMessage());
            return null;
        }
    }

    private String valueOrNA(String val) {
        return (val == null || val.isBlank()) ? "Not Specified" : val.trim();
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Value Types
    // ═════════════════════════════════════════════════════════════════════════

    private record Field(String label, String value, String url) {
        static Field of(String label, String value) {
            return new Field(label, value, null);
        }

        static Field link(String label, String value, String url) {
            return new Field(label, value, url);
        }
    }
}