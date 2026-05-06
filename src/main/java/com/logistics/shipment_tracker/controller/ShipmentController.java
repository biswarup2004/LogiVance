package com.logistics.shipment_tracker.controller;

import com.logistics.shipment_tracker.dto.request.ShipmentRequest;
import com.logistics.shipment_tracker.dto.response.LocationUpdateResponse;
import com.logistics.shipment_tracker.dto.response.ShipmentResponse;
import com.logistics.shipment_tracker.dto.response.ShipmentSummaryResponse;
import com.logistics.shipment_tracker.dto.response.ShipmentUpdateEvent;
import com.logistics.shipment_tracker.exception.UnauthorizedException;
import com.logistics.shipment_tracker.service.ShipmentService;
import com.logistics.shipment_tracker.service.ShipmentStreamService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    private final ShipmentService shipmentService;
    private final ShipmentStreamService shipmentStreamService;

    public ShipmentController(ShipmentService shipmentService,
                              ShipmentStreamService shipmentStreamService) {
        this.shipmentService = shipmentService;
        this.shipmentStreamService = shipmentStreamService;
    }

    @PostMapping
    @PreAuthorize("hasRole('SHIPPER')")
    public ResponseEntity<ShipmentResponse> createShipment(@Valid @RequestBody ShipmentRequest request) {
        String username = getCurrentUsername();
        ShipmentResponse response = shipmentService.createShipment(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ShipmentSummaryResponse>> getShipments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_CARRIER"))) {
            List<ShipmentSummaryResponse> shipments = shipmentService.getAllShipmentsForCarrier(page, size, sort);
            return ResponseEntity.ok(shipments);
        }

        if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_SHIPPER"))) {
            String username = authentication.getName();
            List<ShipmentSummaryResponse> shipments = shipmentService.getMyShipments(username, page, size, sort);
            return ResponseEntity.ok(shipments);
        }

        throw new UnauthorizedException("You are not authorized to view shipments");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentResponse> getShipment(@PathVariable UUID id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        boolean isCarrier = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_CARRIER"));

        ShipmentResponse response = shipmentService.getShipmentById(id, username, isAdmin, isCarrier);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<LocationUpdateResponse>> getShipmentHistory(@PathVariable UUID id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));

        List<LocationUpdateResponse> history = shipmentService.getShipmentStatusHistory(id, username, isAdmin);
        return ResponseEntity.ok(history);
    }

    @GetMapping(value = "/{id}/stream", produces = "text/event-stream")
    public SseEmitter streamShipment(@PathVariable UUID id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        boolean isCarrier = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_CARRIER"));

        // Reuse read access rules from detail
        shipmentService.validateReadAccess(id, username, isAdmin, isCarrier);

        return shipmentStreamService.subscribe(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SHIPPER')")
    public ResponseEntity<ShipmentResponse> updateShipment(@PathVariable UUID id,
                                                           @Valid @RequestBody ShipmentRequest request) {
        String username = getCurrentUsername();
        ShipmentResponse response = shipmentService.updateShipment(id, request, username);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SHIPPER')")
    public ResponseEntity<Void> cancelShipment(@PathVariable UUID id) {
        String username = getCurrentUsername();
        shipmentService.cancelShipment(id, username);
        return ResponseEntity.noContent().build();
    }

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
