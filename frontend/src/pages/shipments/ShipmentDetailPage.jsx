import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { getShipmentById } from "../../services/shipmentService";
import { createShipmentTrackingSocket } from "../../services/trackingSocketService";
import { getAuthToken } from "../../utils/authStorage";

function normalizeLiveLocation(payload, fallbackLocation) {
  if (payload?.lastLocation?.latitude != null && payload?.lastLocation?.longitude != null) {
    return {
      latitude: Number(payload.lastLocation.latitude),
      longitude: Number(payload.lastLocation.longitude),
    };
  }

  if (payload?.latitude != null && payload?.longitude != null) {
    return {
      latitude: Number(payload.latitude),
      longitude: Number(payload.longitude),
    };
  }

  return fallbackLocation;
}

function normalizeLiveStatus(payload, currentStatus) {
  return payload?.status ?? payload?.shipmentStatus ?? currentStatus;
}

function normalizeLiveTimestamp(payload) {
  return payload?.timestamp ?? payload?.time ?? new Date().toISOString();
}

function appendTimelineEntry(currentTimeline, incomingStatus, timestamp) {
  const latest = currentTimeline[currentTimeline.length - 1];
  if (latest?.status === incomingStatus) {
    return currentTimeline;
  }

  return [...currentTimeline, { status: incomingStatus, timestamp }];
}

export function ShipmentDetailPage() {
  const { id } = useParams();
  const [shipment, setShipment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [liveConnectionState, setLiveConnectionState] = useState("idle");
  const [liveInfoMessage, setLiveInfoMessage] = useState("");
  const [lastLiveEventAt, setLastLiveEventAt] = useState("");
  const hasShipment = Boolean(shipment);

  const liveBadgeClass = useMemo(() => {
    switch (liveConnectionState) {
      case "connected":
        return "live-pill live-connected";
      case "reconnecting":
        return "live-pill live-reconnecting";
      case "error":
        return "live-pill live-error";
      case "connecting":
        return "live-pill live-connecting";
      default:
        return "live-pill";
    }
  }, [liveConnectionState]);

  const loadShipment = async () => {
    if (!id) {
      setIsLoading(false);
      setErrorMessage("Shipment id is missing in URL.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      const data = await getShipmentById(id);
      setShipment(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load shipment details.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShipment();
  }, [id]);

  useEffect(() => {
    if (!id || !shipment) {
      return undefined;
    }

    const token = getAuthToken();
    const socketSession = createShipmentTrackingSocket({
      shipmentId: id,
      token,
      onConnectionStateChange: (state) => {
        setLiveConnectionState(state);

        if (state === "reconnecting") {
          setLiveInfoMessage("Live connection dropped. Reconnecting automatically...");
        } else if (state === "connected") {
          setLiveInfoMessage("Live tracking connected.");
        } else if (state === "error") {
          setLiveInfoMessage("Live tracking encountered an error. Waiting to recover...");
        }
      },
      onError: (message) => {
        setLiveInfoMessage(message);
      },
      onMessage: (payload) => {
        setShipment((current) => {
          if (!current) {
            return current;
          }

          const incomingStatus = normalizeLiveStatus(payload, current.status);
          const timestamp = normalizeLiveTimestamp(payload);
          const updatedTimeline = appendTimelineEntry(
            current.statusTimeline,
            incomingStatus,
            timestamp,
          );

          return {
            ...current,
            status: incomingStatus,
            eta: payload?.eta ?? current.eta,
            lastLocation: normalizeLiveLocation(payload, current.lastLocation),
            statusTimeline: updatedTimeline,
          };
        });
        setLastLiveEventAt(new Date().toLocaleString());
      },
    });

    return () => {
      socketSession.disconnect();
    };
  }, [id, hasShipment]);

  if (isLoading) {
    return (
      <section className="panel">
        <LoadingState
          title="Loading shipment details"
          message="Preparing route, timeline, and tracking cards."
        />
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="panel">
        <ErrorState
          title="Unable to open shipment"
          message={errorMessage}
          actionLabel="Try again"
          onAction={loadShipment}
        />
      </section>
    );
  }

  if (!shipment) {
    return (
      <section className="panel">
        <EmptyState
          title="Shipment not found"
          message="The shipment id does not match any available record."
        />
      </section>
    );
  }

  return (
    <section>
      <div className="detail-header">
        <div>
          <p className="eyebrow">Shipment Detail</p>
          <h2 className="page-title">{shipment.id}</h2>
          <div className="live-row">
            <span className={liveBadgeClass}>{liveConnectionState.toUpperCase()}</span>
            {lastLiveEventAt ? <span className="live-meta">Last update: {lastLiveEventAt}</span> : null}
          </div>
          {liveInfoMessage ? <p className="live-note">{liveInfoMessage}</p> : null}
        </div>
        <Link className="btn btn-secondary" to="/shipments">
          Back to Shipments
        </Link>
      </div>

      <div className="detail-grid">
        <article className="panel">
          <h3>Route Summary</h3>
          <div className="kv-list">
            <p>
              <strong>Origin:</strong> {shipment.origin}
            </p>
            <p>
              <strong>Destination:</strong> {shipment.destination}
            </p>
            <p>
              <strong>Weight:</strong> {shipment.weightKg} kg
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`status-pill status-${(shipment.status ?? "").toLowerCase()}`}>
                {shipment.status}
              </span>
            </p>
          </div>
        </article>

        <article className="panel">
          <h3>Location Card</h3>
          <div className="kv-list">
            <p>
              <strong>Latitude:</strong> {shipment.lastLocation.latitude}
            </p>
            <p>
              <strong>Longitude:</strong> {shipment.lastLocation.longitude}
            </p>
            <p>
              <strong>ETA:</strong> {shipment.eta}
            </p>
          </div>
        </article>
      </div>

      <article className="panel">
        <h3>Timeline Card</h3>
        <ul className="timeline-list">
          {shipment.statusTimeline.map((step) => (
            <li key={`${step.status}-${step.timestamp}`}>
              <strong>{step.status}</strong> - {step.timestamp}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
