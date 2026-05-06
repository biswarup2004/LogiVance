import { mockShipments } from "../mocks/shipments";
import { httpClient } from "./httpClient";

function toTimestamp(value) {
  if (!value) {
    return new Date().toISOString();
  }

  return value;
}

function normalizeStatusTimeline(shipment) {
  if (Array.isArray(shipment?.statusTimeline) && shipment.statusTimeline.length > 0) {
    return shipment.statusTimeline.map((entry) => ({
      status: entry.status ?? shipment.status ?? "POSTED",
      timestamp: toTimestamp(entry.timestamp ?? entry.time),
    }));
  }

  if (Array.isArray(shipment?.locationUpdates) && shipment.locationUpdates.length > 0) {
    return shipment.locationUpdates.map((entry) => ({
      status: entry.status ?? shipment.status ?? "IN_TRANSIT",
      timestamp: toTimestamp(entry.timestamp),
    }));
  }

  return [
    {
      status: shipment?.status ?? "POSTED",
      timestamp: toTimestamp(shipment?.updatedAt ?? shipment?.createdAt),
    },
  ];
}

function normalizeLastLocation(shipment) {
  if (shipment?.lastLocation?.latitude && shipment?.lastLocation?.longitude) {
    return shipment.lastLocation;
  }

  const updates = shipment?.locationUpdates;
  if (Array.isArray(updates) && updates.length > 0) {
    const latest = updates[updates.length - 1];
    return {
      latitude: Number(latest.latitude ?? 0),
      longitude: Number(latest.longitude ?? 0),
    };
  }

  return {
    latitude: 0,
    longitude: 0,
  };
}

function normalizeShipment(shipment) {
  return {
    id: shipment.id,
    origin: shipment.origin,
    destination: shipment.destination,
    weightKg: Number(shipment.weightKg ?? 0),
    status: shipment.status ?? "POSTED",
    eta: shipment.eta ?? "Pending ETA",
    lastLocation: normalizeLastLocation(shipment),
    statusTimeline: normalizeStatusTimeline(shipment),
  };
}

function normalizeShipmentArray(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.shipments)) {
    return payload.shipments;
  }

  return [];
}

export async function getShipments() {
  try {
    const response = await httpClient.get("/shipments");
    const apiShipments = normalizeShipmentArray(response.data).map(normalizeShipment);
    return apiShipments.length > 0 ? apiShipments : mockShipments;
  } catch {
    return mockShipments;
  }
}

export async function getShipmentById(id) {
  try {
    const response = await httpClient.get(`/shipments/${id}`);
    return normalizeShipment(response.data);
  } catch {
    const fallback = mockShipments.find((shipment) => shipment.id === id);
    if (!fallback) {
      throw new Error("Shipment not found.");
    }
    return fallback;
  }
}
