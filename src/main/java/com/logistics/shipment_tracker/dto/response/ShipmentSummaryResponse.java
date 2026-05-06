package com.logistics.shipment_tracker.dto.response;

import com.logistics.shipment_tracker.entity.Shipment;
import com.logistics.shipment_tracker.enums.ShipmentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class ShipmentSummaryResponse {

    private UUID id;
    private String origin;
    private String destination;
    private BigDecimal weightKg;
    private ShipmentStatus status;
    private LocalDateTime createdAt;

    public ShipmentSummaryResponse() {
    }

    public ShipmentSummaryResponse(UUID id,
                                   String origin,
                                   String destination,
                                   BigDecimal weightKg,
                                   ShipmentStatus status,
                                   LocalDateTime createdAt) {
        this.id = id;
        this.origin = origin;
        this.destination = destination;
        this.weightKg = weightKg;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static ShipmentSummaryResponse fromEntity(Shipment shipment) {
        return new ShipmentSummaryResponse(
                shipment.getId(),
                shipment.getOrigin(),
                shipment.getDestination(),
                shipment.getWeightKg(),
                shipment.getStatus(),
                shipment.getCreatedAt()
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getOrigin() {
        return origin;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(BigDecimal weightKg) {
        this.weightKg = weightKg;
    }

    public ShipmentStatus getStatus() {
        return status;
    }

    public void setStatus(ShipmentStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
