package com.fabins.entity;

import com.fabins.entity.enums.DeploymentRequestStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * A mill or textile factory's request for a FABINS Vision AI retrofit assessment.
 *
 * <p>Persists the 8 essential factory profile, machinery, and technical contact credentials
 * collected through the /deploy portal.
 */
@Entity
@Table(name = "deployment_request")
@EntityListeners(AuditingEntityListener.class)
public class DeploymentRequest {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "mill_name", nullable = false, length = 200)
    private String millName;

    @Column(name = "machine_brand", nullable = false, length = 150)
    private String machineBrand;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(name = "contact_name", nullable = false, length = 200)
    private String contactName;

    @Column(nullable = false, length = 320)
    private String email;

    @Column(nullable = false, length = 50)
    private String phone;

    @Column(name = "factory_type", length = 100)
    private String factoryType;

    @Column(name = "roll_width", length = 50)
    private String rollWidth;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DeploymentRequestStatus status;

    @CreatedDate
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /** Required by JPA. Not for direct application use. */
    protected DeploymentRequest() {
    }

    private DeploymentRequest(String millName, String machineBrand, String location,
                              String contactName, String email, String phone,
                              String factoryType, String rollWidth) {
        this.millName = millName;
        this.machineBrand = machineBrand;
        this.location = location;
        this.contactName = contactName;
        this.email = email;
        this.phone = phone;
        this.factoryType = factoryType;
        this.rollWidth = rollWidth;
        this.status = DeploymentRequestStatus.NEW;
    }

    /**
     * Factory method to build a newly submitted deployment assessment request.
     */
    public static DeploymentRequest submit(String millName, String machineBrand, String location,
                                           String contactName, String email, String phone,
                                           String factoryType, String rollWidth) {
        return new DeploymentRequest(millName, machineBrand, location, contactName, email, phone, factoryType, rollWidth);
    }

    /**
     * Factory method to build a transient assessment request for PDF preview/download prior to submission.
     */
    public static DeploymentRequest preview(String millName, String machineBrand, String location,
                                            String contactName, String email, String phone,
                                            String factoryType, String rollWidth) {
        DeploymentRequest req = new DeploymentRequest(millName, machineBrand, location, contactName, email, phone, factoryType, rollWidth);
        req.id = UUID.randomUUID();
        req.submittedAt = Instant.now();
        req.updatedAt = req.submittedAt;
        return req;
    }

    /**
     * Updates the workflow follow-up status.
     */
    public void changeStatus(DeploymentRequestStatus newStatus) {
        this.status = newStatus;
    }

    /**
     * Computes the human-readable tracking reference code (e.g. FAB-2026-XXXXXXXX).
     */
    public String getReferenceCode() {
        if (id == null) {
            return "FAB-2026-PENDING";
        }
        return "FAB-2026-" + id.toString().substring(0, 8).toUpperCase();
    }

    // ── Getters and Setters ──────────────────────────────────────────────────

    public UUID getId() {
        return id;
    }

    public String getMillName() {
        return millName;
    }

    public void setMillName(String millName) {
        this.millName = millName;
    }

    public String getMachineBrand() {
        return machineBrand;
    }

    public void setMachineBrand(String machineBrand) {
        this.machineBrand = machineBrand;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getFactoryType() {
        return factoryType;
    }

    public void setFactoryType(String factoryType) {
        this.factoryType = factoryType;
    }

    public String getRollWidth() {
        return rollWidth;
    }

    public void setRollWidth(String rollWidth) {
        this.rollWidth = rollWidth;
    }

    public DeploymentRequestStatus getStatus() {
        return status;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
