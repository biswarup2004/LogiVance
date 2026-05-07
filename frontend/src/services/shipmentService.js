
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
    price: shipment.price ?? 0,
    carrierId: shipment.carrierId ?? null,
    carrierName: shipment.carrierName ?? null,
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
  const response = await httpClient.get("/shipments");
  const apiShipments = normalizeShipmentArray(response.data).map(normalizeShipment);
  return apiShipments;
}

export async function getShipmentById(id) {
  const response = await httpClient.get(`/shipments/${id}`);
  return normalizeShipment(response.data);
}

export async function updateShipmentLocation(id, payload) {
  const response = await httpClient.post(`/shipments/${id}/location`, payload);
  return response.data;
}

export async function createShipment(payload) {
  const response = await httpClient.post("/shipments", payload);
  return response.data;
}

export async function acceptShipment(id) {
  const response = await httpClient.post(`/shipments/${id}/accept`);
  return response.data;
}
