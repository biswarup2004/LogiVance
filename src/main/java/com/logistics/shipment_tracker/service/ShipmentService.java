package com.logistics.shipment_tracker.service;

import com.logistics.shipment_tracker.dto.request.ShipmentRequest;
import com.logistics.shipment_tracker.dto.response.LocationUpdateResponse;
import com.logistics.shipment_tracker.dto.response.ShipmentResponse;
import com.logistics.shipment_tracker.dto.response.ShipmentSummaryResponse;
import com.logistics.shipment_tracker.dto.response.ShipmentUpdateEvent;
import com.logistics.shipment_tracker.entity.LocationUpdate;
import com.logistics.shipment_tracker.entity.Shipment;
import com.logistics.shipment_tracker.entity.User;
import com.logistics.shipment_tracker.enums.ShipmentStatus;
import com.logistics.shipment_tracker.exception.BadRequestException;
import com.logistics.shipment_tracker.exception.ResourceNotFoundException;
import com.logistics.shipment_tracker.exception.UnauthorizedException;
import com.logistics.shipment_tracker.service.AuditLogService;
import com.logistics.shipment_tracker.repository.LocationUpdateRepository;
import com.logistics.shipment_tracker.repository.ShipmentRepository;
import com.logistics.shipment_tracker.repository.UserRepository;
import com.logistics.shipment_tracker.util.InputSanitizer;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.UUID;

@Service
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final LocationUpdateRepository locationUpdateRepository;
    private final ShipmentStreamService shipmentStreamService;
    private final AuditLogService auditLogService;
    private final InputSanitizer inputSanitizer;
    private final SimpMessagingTemplate messagingTemplate;

    public ShipmentService(ShipmentRepository shipmentRepository,
                           UserRepository userRepository,
                           LocationUpdateRepository locationUpdateRepository,
                           ShipmentStreamService shipmentStreamService,
                           AuditLogService auditLogService,
                           InputSanitizer inputSanitizer,
                           SimpMessagingTemplate messagingTemplate) {
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
        this.locationUpdateRepository = locationUpdateRepository;
        this.shipmentStreamService = shipmentStreamService;
        this.auditLogService = auditLogService;
        this.inputSanitizer = inputSanitizer;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public ShipmentResponse createShipment(ShipmentRequest request, String username) {
        User shipper = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Shipment shipment = Shipment.builder()
                .shipper(shipper)
                .origin(inputSanitizer.sanitize(request.getOrigin()))
                .destination(inputSanitizer.sanitize(request.getDestination()))
                .weightKg(request.getWeightKg())
                .description(inputSanitizer.sanitize(request.getDescription()))
                .status(ShipmentStatus.POSTED)
                .build();

        Shipment savedShipment = shipmentRepository.save(shipment);
        emitUpdate(savedShipment, "created");
        auditLogService.log(username, "CREATE_SHIPMENT", "Shipment created: " + savedShipment.getId());
        return ShipmentResponse.fromEntity(savedShipment);
    }

    @Transactional(readOnly = true)
    public List<ShipmentSummaryResponse> getAllShipmentsForCarrier(int page, int size, String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        return shipmentRepository.findByStatus(ShipmentStatus.POSTED, pageable)
                .map(ShipmentSummaryResponse::fromEntity)
                .getContent();
    }

    @Transactional(readOnly = true)
    public List<ShipmentSummaryResponse> getMyShipments(String username, int page, int size, String sort) {
        User shipper = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Pageable pageable = buildPageable(page, size, sort);

        return shipmentRepository.findByShipper(shipper, pageable)
                .map(ShipmentSummaryResponse::fromEntity)
                .getContent();
    }

    @Transactional(readOnly = true)
    public ShipmentResponse getShipmentById(UUID id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found"));
        return ShipmentResponse.fromEntity(shipment);
    }

    @Transactional(readOnly = true)
    public ShipmentResponse getShipmentById(UUID id, String username, boolean isAdmin, boolean isCarrier) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found"));

        boolean isOwner = shipment.getShipper() != null && shipment.getShipper().getUsername().equals(username);
        boolean carrierCanView = isCarrier && shipment.getStatus() == ShipmentStatus.POSTED;

        if (!isOwner && !isAdmin && !carrierCanView) {
            throw new UnauthorizedException("You are not allowed to view this shipment");
        }

        return ShipmentResponse.fromEntity(shipment);
    }

    @Transactional(readOnly = true)
    public List<LocationUpdateResponse> getShipmentStatusHistory(UUID id, String username, boolean isAdmin) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found"));

        boolean isOwner = shipment.getShipper() != null && shipment.getShipper().getUsername().equals(username);
        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You are not allowed to view this shipment history");
        }

        List<LocationUpdate> updates = locationUpdateRepository.findByShipmentOrderByTimestampAsc(shipment);
        return updates.stream()
                .map(LocationUpdateResponse::fromEntity)
                .toList();
    }

    @Transactional
    public ShipmentResponse updateShipment(UUID id, ShipmentRequest request, String username) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found"));

        if (!shipment.getShipper().getUsername().equals(username)) {
            throw new UnauthorizedException("You are not allowed to update this shipment");
        }

        if (shipment.getStatus() != ShipmentStatus.POSTED) {
            throw new BadRequestException("Cannot update shipment that is not in POSTED status");
        }

        shipment.setOrigin(request.getOrigin());
        shipment.setDestination(request.getDestination());
        shipment.setWeightKg(request.getWeightKg());
        shipment.setDescription(inputSanitizer.sanitize(request.getDescription()));

        Shipment updatedShipment = shipmentRepository.save(shipment);
        emitUpdate(updatedShipment, "updated");
        auditLogService.log(username, "UPDATE_SHIPMENT", "Shipment updated: " + updatedShipment.getId());
        return ShipmentResponse.fromEntity(updatedShipment);
    }

    @Transactional
    public void cancelShipment(UUID id, String username) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found"));

        if (!shipment.getShipper().getUsername().equals(username)) {
            throw new UnauthorizedException("You are not allowed to cancel this shipment");
        }

        if (shipment.getStatus() != ShipmentStatus.POSTED) {
            throw new BadRequestException("Cannot cancel shipment that is not in POSTED status");
        }

        shipment.setStatus(ShipmentStatus.CANCELLED);
        shipmentRepository.save(shipment);
        emitUpdate(shipment, "cancelled");
        auditLogService.log(username, "CANCEL_SHIPMENT", "Shipment cancelled: " + shipment.getId());
    }

    public void validateReadAccess(UUID id, String username, boolean isAdmin, boolean isCarrier) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found"));

        boolean isOwner = shipment.getShipper() != null && shipment.getShipper().getUsername().equals(username);
        boolean carrierCanView = isCarrier && shipment.getStatus() == ShipmentStatus.POSTED;

        if (!isOwner && !isAdmin && !carrierCanView) {
            throw new UnauthorizedException("You are not allowed to view this shipment");
        }
    }

    private void emitUpdate(Shipment shipment, String message) {
        Double lat = null;
        Double lng = null;
        if (shipment.getLocationUpdates() != null && !shipment.getLocationUpdates().isEmpty()) {
            LocationUpdate last = shipment.getLocationUpdates()
                    .stream()
                    .max((a, b) -> a.getTimestamp().compareTo(b.getTimestamp()))
                    .orElse(null);
            if (last != null) {
                lat = last.getLatitude();
                lng = last.getLongitude();
            }
        }

        ShipmentUpdateEvent event = new ShipmentUpdateEvent(
                shipment.getId(),
                shipment.getStatus(),
                message,
                shipment.getUpdatedAt() != null ? shipment.getUpdatedAt() : shipment.getCreatedAt(),
                lat,
                lng
        );
        shipmentStreamService.publish(shipment.getId(), event);
        messagingTemplate.convertAndSend("/topic/shipments/" + shipment.getId(), event);
    }

    private Pageable buildPageable(int page, int size, String sort) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Sort sortSpec = Sort.by("createdAt").descending();
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",");
            String prop = parts[0];
            Sort.Direction dir = parts.length > 1 ? Sort.Direction.fromOptionalString(parts[1]).orElse(Sort.Direction.DESC) : Sort.Direction.DESC;
            sortSpec = Sort.by(dir, prop);
        }
        return PageRequest.of(safePage, safeSize, sortSpec);
    }
}
