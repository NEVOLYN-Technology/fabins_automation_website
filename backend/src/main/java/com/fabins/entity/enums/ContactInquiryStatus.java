package com.fabins.entity.enums;

/**
 * Workflow stages for a general contact inquiry submitted via the FABINS
 * homepage "Let's Connect" form.
 *
 * <ul>
 *   <li>{@link #NEW} — the inquiry has just been received and is waiting for a
 *       team member to read and reply.</li>
 *   <li>{@link #ACKNOWLEDGED} — the admin has seen the inquiry and marked it as
 *       acknowledged. An intermediate stage before a full reply is sent.</li>
 *   <li>{@link #REPLIED} — an R&amp;D team member has responded to the
 *       inquiry. This is the terminal state.</li>
 * </ul>
 *
 * <p>Values are persisted as their {@link #name()} string (not as an ordinal),
 * so re-ordering or inserting enum constants will never silently corrupt rows
 * that are already stored in the database.</p>
 *
 * <p>The database column is constrained to the same set via a CHECK clause in
 * the migration SQL, so an out-of-range value inserted outside the application
 * is rejected at the database level too.</p>
 */
public enum ContactInquiryStatus {

    /**
     * The inquiry is freshly submitted and has not yet been seen by the
     * R&amp;D team. This is the initial status assigned by
     * {@code ContactInquiryServiceImpl} on every new submission.
     */
    NEW,

    /**
     * The admin has seen and acknowledged the inquiry but has not yet sent
     * a formal reply. This is an optional intermediate stage.
     */
    ACKNOWLEDGED,

    /**
     * A member of the R&amp;D team has replied to the inquiry, either directly
     * by email or by moving it through the admin dashboard. This is the
     * terminal state — the status cannot be moved backward once set.
     */
    REPLIED
}
