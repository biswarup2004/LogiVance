package com.logistics.shipment_tracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ShipmentTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShipmentTrackerApplication.class, args);
    }
}