-- =============================================================================
-- V2 — contact_inquiry
--
-- Optimal, production-grade schema for general visitor inquiries submitted
-- through the FABINS homepage contact form.
-- =============================================================================

CREATE TABLE contact_inquiry
(
    id         UUID         NOT NULL,
    name       VARCHAR(200) NOT NULL,
    email      VARCHAR(320) NOT NULL,
    subject    VARCHAR(300) NOT NULL,
    message    VARCHAR(4000) NOT NULL,
    status     VARCHAR(20)  NOT NULL,
    created_at TIMESTAMP    NOT NULL,
    updated_at TIMESTAMP    NOT NULL,

    CONSTRAINT pk_contact_inquiry PRIMARY KEY (id),
    CONSTRAINT ck_contact_inquiry_status
        CHECK (status IN ('NEW', 'REPLIED'))
);

CREATE INDEX ix_contact_inquiry_status_created
    ON contact_inquiry (status, created_at DESC);

CREATE INDEX ix_contact_inquiry_created
    ON contact_inquiry (created_at DESC);
