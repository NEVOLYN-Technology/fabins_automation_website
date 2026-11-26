package com.fabins.entity.enums;

/**
 * Where a deployment request sits in the sales follow-up process.
 *
 * <p>Stored in the database as its {@code name()} string rather than its
 * ordinal, so the column stays readable and reordering this enum cannot
 * silently corrupt existing rows. See the {@code @Enumerated(EnumType.STRING)}
 * annotation on the entity's status field.
 *
 * <p><strong>Adding a value:</strong> append it here and extend the
 * {@code ck_deployment_request_status} constraint in a new Flyway migration.
 * Never rename or remove a value that is already stored in production.
 */
public enum DeploymentRequestStatus {

    /** Just submitted through the website; nobody has looked at it yet. */
    NEW,

    /** An engineer is assessing whether the mill's frames can be retrofitted. */
    IN_REVIEW,

    /** Someone from the team has replied to the mill. */
    CONTACTED,

    /** Finished — either converted to a deployment or not proceeding. */
    CLOSED
}
