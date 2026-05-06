package com.logistics.shipment_tracker.repository;

import com.logistics.shipment_tracker.entity.LocationUpdate;
import com.logistics.shipment_tracker.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LocationUpdateRepository extends JpaRepository<LocationUpdate, UUID> {

    List<LocationUpdate> findByShipmentOrderByTimestampAsc(Shipment shipment);
}
