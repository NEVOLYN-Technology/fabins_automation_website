-- =============================================================================
-- V1 — deployment_request
--
-- Optimal, production-grade schema for FABINS Deployment Assessment requests.
-- Stores the 8 essential factory profile, machine, and contact credentials
-- submitted via the /deploy portal.
-- =============================================================================

CREATE TABLE deployment_request
(
    id            UUID         NOT NULL,
    mill_name     VARCHAR(200) NOT NULL,
    machine_brand VARCHAR(150) NOT NULL,
    location      VARCHAR(200) NOT NULL,
    contact_name  VARCHAR(200) NOT NULL,
    email         VARCHAR(320) NOT NULL,
    phone         VARCHAR(50)  NOT NULL,
    factory_type  VARCHAR(100),
    roll_width    VARCHAR(50),
    status        VARCHAR(20)  NOT NULL,
    submitted_at  TIMESTAMP    NOT NULL,
    updated_at    TIMESTAMP    NOT NULL,

    CONSTRAINT pk_deployment_request PRIMARY KEY (id),
    CONSTRAINT ck_deployment_request_status
        CHECK (status IN ('NEW', 'IN_REVIEW', 'CONTACTED', 'CLOSED'))
);

CREATE INDEX ix_deployment_request_status_submitted
    ON deployment_request (status, submitted_at DESC);

CREATE INDEX ix_deployment_request_submitted
    ON deployment_request (submitted_at DESC);