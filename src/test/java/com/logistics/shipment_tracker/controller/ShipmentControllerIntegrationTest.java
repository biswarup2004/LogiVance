package com.logistics.shipment_tracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.logistics.shipment_tracker.dto.request.ShipmentRequest;
import com.logistics.shipment_tracker.entity.User;
import com.logistics.shipment_tracker.enums.Role;
import com.logistics.shipment_tracker.repository.UserRepository;
import com.logistics.shipment_tracker.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ShipmentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private String shipperToken;
    private String carrierToken;

    @BeforeEach
    void setup() {
        userRepository.deleteAll();

        User shipper = User.builder()
                .username("shipper1")
                .email("shipper1@example.com")
                .password(passwordEncoder.encode("password"))
                .role(Role.SHIPPER)
                .build();
        shipper = userRepository.save(shipper);

        User carrier = User.builder()
                .username("carrier1")
                .email("carrier1@example.com")
                .password(passwordEncoder.encode("password"))
                .role(Role.CARRIER)
                .build();
        carrier = userRepository.save(carrier);

        shipperToken = "Bearer " + jwtService.generateToken(toUserDetails(shipper));
        carrierToken = "Bearer " + jwtService.generateToken(toUserDetails(carrier));
    }

    @Test
    void shipper_can_create_and_list_their_shipments_paginated() throws Exception {
        ShipmentRequest request = new ShipmentRequest("CityA", "CityB", new BigDecimal("12.5"), "desc");

        mockMvc.perform(post("/api/shipments")
                        .header("Authorization", shipperToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.origin").value("CityA"));

        mockMvc.perform(get("/api/shipments")
                        .header("Authorization", shipperToken)
                        .param("page", "0")
                        .param("size", "10")
                        .param("sort", "createdAt,desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].origin").value("CityA"));
    }

    @Test
    void carrier_sees_posted_shipments_with_pagination() throws Exception {
        // create shipment as shipper
        ShipmentRequest request = new ShipmentRequest("CityA", "CityB", new BigDecimal("12.5"), "desc");
        mockMvc.perform(post("/api/shipments")
                        .header("Authorization", shipperToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/shipments")
                        .header("Authorization", carrierToken)
                        .param("page", "0")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("POSTED"));
    }

    @Test
    void owner_can_stream_shipment() throws Exception {
        ShipmentRequest request = new ShipmentRequest("CityA", "CityB", new BigDecimal("12.5"), "desc");
        String shipmentId = mockMvc.perform(post("/api/shipments")
                        .header("Authorization", shipperToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String id = objectMapper.readTree(shipmentId).get("id").asText();

        mockMvc.perform(get("/api/shipments/" + id + "/stream")
                        .header("Authorization", shipperToken))
                .andExpect(status().isOk())
                .andExpect(result -> result.getResponse().getContentType().startsWith("text/event-stream"));
    }

    private UserDetails toUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }
}
