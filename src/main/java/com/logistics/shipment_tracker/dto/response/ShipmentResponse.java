package com.logistics.shipment_tracker.dto.response;

import com.logistics.shipment_tracker.entity.Shipment;
import com.logistics.shipment_tracker.entity.LocationUpdate;
import com.logistics.shipment_tracker.enums.ShipmentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.Collections;
import java.util.stream.Collectors;

public class ShipmentResponse {

    private UUID id;
    private UUID shipperId;
    private String shipperName;
    private String origin;
    private String destination;
    private BigDecimal weightKg;
    private String description;
    private ShipmentStatus status;
    private UUID awardedBidId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<LocationUpdateResponse> locationUpdates;

    public ShipmentResponse() {
    }

    public ShipmentResponse(UUID id,
                            UUID shipperId,
                            String shipperName,
                            String origin,
                            String destination,
                            BigDecimal weightKg,
                            String description,
                            ShipmentStatus status,
                            UUID awardedBidId,
                            LocalDateTime createdAt,
                            LocalDateTime updatedAt,
                            List<LocationUpdateResponse> locationUpdates) {
        this.id = id;
        this.shipperId = shipperId;
        this.shipperName = shipperName;
        this.origin = origin;
        this.destination = destination;
        this.weightKg = weightKg;
        this.description = description;
        this.status = status;
        this.awardedBidId = awardedBidId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.locationUpdates = locationUpdates;
    }

    public static ShipmentResponse fromEntity(Shipment shipment) {
        List<LocationUpdateResponse> updates = shipment.getLocationUpdates() == null
                ? Collections.emptyList()
                : shipment.getLocationUpdates().stream()
                .sorted((a, b) -> a.getTimestamp().compareTo(b.getTimestamp()))
                .map(LocationUpdateResponse::fromEntity)
                .collect(Collectors.toList());

        return new ShipmentResponse(
                shipment.getId(),
                shipment.getShipper() != null ? shipment.getShipper().getId() : null,
                shipment.getShipper() != null ? shipment.getShipper().getUsername() : null,
                shipment.getOrigin(),
                shipment.getDestination(),
                shipment.getWeightKg(),
                shipment.getDescription(),
                shipment.getStatus(),
                shipment.getAwardedBid() != null ? shipment.getAwardedBid().getId() : null,
                shipment.getCreatedAt(),
                shipment.getUpdatedAt(),
                updates
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getShipperId() {
        return shipperId;
    }

    public void setShipperId(UUID shipperId) {
        this.shipperId = shipperId;
    }

    public String getShipperName() {
        return shipperName;
    }

    public void setShipperName(String shipperName) {
        this.shipperName = shipperName;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ShipmentStatus getStatus() {
        return status;
    }

    public void setStatus(ShipmentStatus status) {
        this.status = status;
    }

    public UUID getAwardedBidId() {
        return awardedBidId;
    }

    public void setAwardedBidId(UUID awardedBidId) {
        this.awardedBidId = awardedBidId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<LocationUpdateResponse> getLocationUpdates() {
        return locationUpdates;
    }

    public void setLocationUpdates(List<LocationUpdateResponse> locationUpdates) {
        this.locationUpdates = locationUpdates;
    }
}
