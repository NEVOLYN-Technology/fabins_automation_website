package com.fabins.mapper;

import com.fabins.dto.request.CreateDeploymentRequest;
import com.fabins.dto.response.DeploymentRequestResponse;
import com.fabins.entity.DeploymentRequest;
import org.springframework.stereotype.Component;

/**
 * Converts between {@link DeploymentRequest} entities and their API DTOs.
 */
@Component
public class DeploymentRequestMapper {

    /**
     * Builds a new entity from a submitted request payload.
     */
    public DeploymentRequest toEntity(CreateDeploymentRequest request) {
        return DeploymentRequest.submit(
                request.millName(),
                request.machineBrand(),
                request.location(),
                request.contactName(),
                request.email(),
                request.phone(),
                request.factoryType(),
                request.rollWidth()
        );
    }

    /**
     * Converts a persisted entity into its public API response DTO.
     */
    public DeploymentRequestResponse toResponse(DeploymentRequest entity) {
        return new DeploymentRequestResponse(
                entity.getId(),
                entity.getReferenceCode(),
                entity.getMillName(),
                entity.getMachineBrand(),
                entity.getLocation(),
                entity.getContactName(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getFactoryType(),
                entity.getRollWidth(),
                entity.getStatus(),
                entity.getSubmittedAt(),
                entity.getUpdatedAt()
        );
    }
}
