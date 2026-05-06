package com.logistics.shipment_tracker.dto.response;

import com.logistics.shipment_tracker.entity.LocationUpdate;

import java.time.LocalDateTime;
import java.util.UUID;

public class LocationUpdateResponse {

    private UUID id;
    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;

    public LocationUpdateResponse() {
    }

    public LocationUpdateResponse(UUID id, Double latitude, Double longitude, LocalDateTime timestamp) {
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamp = timestamp;
    }

    public static LocationUpdateResponse fromEntity(LocationUpdate locationUpdate) {
        return new LocationUpdateResponse(
                locationUpdate.getId(),
                locationUpdate.getLatitude(),
                locationUpdate.getLongitude(),
                locationUpdate.getTimestamp()
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
