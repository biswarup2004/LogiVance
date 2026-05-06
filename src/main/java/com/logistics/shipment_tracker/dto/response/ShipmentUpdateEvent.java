package com.logistics.shipment_tracker.dto.response;

import com.logistics.shipment_tracker.enums.ShipmentStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class ShipmentUpdateEvent {

    private UUID shipmentId;
    private ShipmentStatus status;
    private String message;
    private LocalDateTime timestamp;
    private Double latitude;
    private Double longitude;

    public ShipmentUpdateEvent() {
    }

    public ShipmentUpdateEvent(UUID shipmentId, ShipmentStatus status, String message, LocalDateTime timestamp) {
        this(shipmentId, status, message, timestamp, null, null);
    }

    public ShipmentUpdateEvent(UUID shipmentId, ShipmentStatus status, String message, LocalDateTime timestamp, Double latitude, Double longitude) {
        this.shipmentId = shipmentId;
        this.status = status;
        this.message = message;
        this.timestamp = timestamp;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public UUID getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(UUID shipmentId) {
        this.shipmentId = shipmentId;
    }

    public ShipmentStatus getStatus() {
        return status;
    }

    public void setStatus(ShipmentStatus status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
