package com.fabins.service;

import com.fabins.entity.ContactInquiry;
import com.fabins.entity.DeploymentRequest;

/**
 * Service for sending automated transactional email notifications triggered
 * by user submissions on the FABINS website.
 *
 * <p>There are two submission flows, each with its own notification pair:
 * <ol>
 *   <li><strong>Deployment requests</strong> (via {@code /deploy} page) — a
 *       deep RMG technical assessment form whose notifications carry mill
 *       specifications and a one-click acknowledge link.</li>
 *   <li><strong>Contact inquiries</strong> (via the homepage "Let's Connect"
 *       form) — a simpler message-and-reply flow whose notifications carry
 *       the visitor's message and subject line.</li>
 * </ol>
 *
 * @see com.fabins.service.impl.EmailServiceImpl
 */
public interface EmailService {

    /**
     * Sends both the internal R&amp;D notification email and the external
     * sender-confirmation email triggered by a new deployment request.
     *
     * @param request the newly persisted deployment request entity
     */
    void sendDeploymentRequestNotifications(DeploymentRequest request);

    /**
     * Sends an acknowledgement email to the mill contact when an R&amp;D team
     * member picks up their deployment request (moves it to {@code IN_REVIEW}).
     *
     * @param request the acknowledged deployment request entity
     */
    void sendAcknowledgementNotification(DeploymentRequest request);

    /**
     * Sends both the internal R&amp;D alert email and the visitor confirmation
     * email triggered by a new general contact inquiry.
     *
     * @param inquiry the newly persisted contact inquiry entity
     */
    void sendContactInquiryNotifications(ContactInquiry inquiry);

    /**
     * Sends an acknowledgement email to the visitor after an R&amp;D team member
     * clicks the one-click acknowledge link in the admin notification email.
     *
     * <p>This mirrors the deployment-request acknowledgement flow: the admin
     * triggers it, and the visitor receives a confirmation that their inquiry
     * has been read and will be personally replied to.
     *
     * @param inquiry the inquiry that has just been moved to {@code REPLIED}
     */
    void sendContactInquiryAcknowledgement(ContactInquiry inquiry);
}

