# API Contract (Frontend + Backend Sync)

## Authentication Endpoints
- `POST /api/auth/register`
  - request:
    - `username` (string)
    - `email` (string)
    - `password` (string)
    - `role` (`SHIPPER` or `CARRIER`)
- `POST /api/auth/login`
  - request:
    - `username` (string)
    - `password` (string)

## Authentication Response Shape
```json
{
  "token": "jwt-token",
  "userId": "uuid",
  "username": "shipper1",
  "email": "shipper1@example.com",
  "role": "SHIPPER"
}
```

## Shipment Status Enum
- `POSTED`
- `AWARDED`
- `AWAITING_PICKUP`
- `IN_TRANSIT`
- `DELIVERED`
- `CANCELLED`

## Shipment Endpoints Needed by Frontend
- `GET /api/shipments`
  - accepted response shapes:
    - raw array `[...]`
    - `{ "items": [...] }`
    - `{ "data": [...] }`
    - `{ "shipments": [...] }`
- `GET /api/shipments/{id}`
  - returns one shipment object

## Shipment Object Shape (Preferred)
```json
{
  "id": "uuid-or-business-id",
  "origin": "Bengaluru",
  "destination": "Hyderabad",
  "weightKg": 1800,
  "status": "IN_TRANSIT",
  "eta": "Apr 7, 2026 18:30 IST",
  "lastLocation": {
    "latitude": 14.4426,
    "longitude": 78.8242
  },
  "statusTimeline": [
    {
      "status": "POSTED",
      "timestamp": "2026-04-06T08:00:00Z"
    }
  ]
}
```

## Realtime Tracking Contract
- WebSocket endpoint: `/ws`
- Topic format: `/topic/shipments/{shipmentId}`
- Payload shape accepted by frontend:
```json
{
  "shipmentId": "uuid-or-business-id",
  "status": "IN_TRANSIT",
  "latitude": 14.44,
  "longitude": 78.82,
  "eta": "Apr 7, 2026 18:30 IST",
  "timestamp": "2026-04-06T13:10:00Z"
}
```

## Notes
- `id`, `origin`, `destination`, `status` are required.
- Frontend expects auth token in `Authorization: Bearer <token>`.
- Invalid auth should return JSON message for UI display.
