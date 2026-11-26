-- =============================================================================
-- V3 — contact_inquiry: add ACKNOWLEDGED status
--
-- Extends the existing CHECK constraint on contact_inquiry.status to allow the
-- new ACKNOWLEDGED intermediate state (NEW → ACKNOWLEDGED → REPLIED).
--
-- Safe on a live database: DROP CONSTRAINT + ADD CONSTRAINT is a metadata-only
-- operation in PostgreSQL and completes instantly without a table rewrite.
-- =============================================================================

ALTER TABLE contact_inquiry
    DROP CONSTRAINT ck_contact_inquiry_status;

ALTER TABLE contact_inquiry
    ADD CONSTRAINT ck_contact_inquiry_status
        CHECK (status IN ('NEW', 'ACKNOWLEDGED', 'REPLIED'));
