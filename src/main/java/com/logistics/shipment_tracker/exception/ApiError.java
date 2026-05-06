package com.logistics.shipment_tracker.exception;

import java.time.LocalDateTime;
import java.util.Map;

public class ApiError {

    private final int status;
    private final String message;
    private final String path;
    private final LocalDateTime timestamp;
    private final Map<String, String> errors;

    public ApiError(int status, String message, String path, LocalDateTime timestamp) {
        this(status, message, path, timestamp, null);
    }

    public ApiError(int status, String message, String path, LocalDateTime timestamp, Map<String, String> errors) {
        this.status = status;
        this.message = message;
        this.path = path;
        this.timestamp = timestamp;
        this.errors = errors;
    }

    public int getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }

    public String getPath() {
        return path;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}
