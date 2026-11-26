package com.fabins.service.mail;

import java.util.Arrays;
import java.util.Objects;

/**
 * Immutable value object representing a transactional email message to be dispatched
 * over corporate Webmail / SMTP.
 *
 * <p>Carries both HTML and plain-text representations for multipart/alternative MIME
 * delivery, optional reply-to routing, and binary attachments (e.g. assessment PDFs).
 */
public record EmailMessage(
        String to,
        String subject,
        String htmlBody,
        String plainTextBody,
        String replyTo,
        String attachmentFilename,
        byte[] attachmentBytes
) {
    public EmailMessage {
        Objects.requireNonNull(to, "Recipient 'to' address cannot be null");
        Objects.requireNonNull(subject, "Email 'subject' cannot be null");
        Objects.requireNonNull(htmlBody, "Email 'htmlBody' cannot be null");
    }

    public boolean hasAttachment() {
        return attachmentBytes != null && attachmentBytes.length > 0 && attachmentFilename != null && !attachmentFilename.isBlank();
    }

    public boolean hasPlainText() {
        return plainTextBody != null && !plainTextBody.isBlank();
    }

    public boolean hasReplyTo() {
        return replyTo != null && !replyTo.isBlank();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String to;
        private String subject;
        private String htmlBody;
        private String plainTextBody;
        private String replyTo;
        private String attachmentFilename;
        private byte[] attachmentBytes;

        public Builder to(String to) {
            this.to = to;
            return this;
        }

        public Builder subject(String subject) {
            this.subject = subject;
            return this;
        }

        public Builder htmlBody(String htmlBody) {
            this.htmlBody = htmlBody;
            return this;
        }

        public Builder plainTextBody(String plainTextBody) {
            this.plainTextBody = plainTextBody;
            return this;
        }

        public Builder replyTo(String replyTo) {
            this.replyTo = replyTo;
            return this;
        }

        public Builder attachment(String filename, byte[] bytes) {
            this.attachmentFilename = filename;
            this.attachmentBytes = bytes != null ? Arrays.copyOf(bytes, bytes.length) : null;
            return this;
        }

        public EmailMessage build() {
            return new EmailMessage(to, subject, htmlBody, plainTextBody, replyTo, attachmentFilename, attachmentBytes);
        }
    }
}
