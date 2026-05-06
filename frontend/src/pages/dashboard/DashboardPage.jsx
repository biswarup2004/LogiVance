import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { getShipments } from "../../services/shipmentService";

const statusOrder = ["POSTED", "AWARDED", "AWAITING_PICKUP", "IN_TRANSIT", "DELIVERED", "CANCELLED"];

export function DashboardPage() {
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadShipments = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const data = await getShipments();
      setShipments(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load dashboard data.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, []);

  const inTransitCount = useMemo(
    () => shipments.filter((shipment) => shipment.status === "IN_TRANSIT").length,
    [shipments],
  );

  const deliveredCount = useMemo(
    () => shipments.filter((shipment) => shipment.status === "DELIVERED").length,
    [shipments],
  );

  return (
    <section>
      <p className="eyebrow">Overview</p>
      <h2 className="page-title">Live Logistics Snapshot</h2>

      {isLoading ? (
        <div className="panel">
          <LoadingState
            title="Loading dashboard"
            message="Collecting latest shipment metrics from backend."
          />
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="panel">
          <ErrorState
            title="Unable to load dashboard"
            message={errorMessage}
            actionLabel="Retry"
            onAction={loadShipments}
          />
        </div>
      ) : null}

      {!isLoading && !errorMessage && shipments.length === 0 ? (
        <div className="panel">
          <EmptyState
            title="No shipment metrics available"
            message="Create shipments first to see dashboard insights."
          />
        </div>
      ) : null}

      {!isLoading && !errorMessage && shipments.length > 0 ? (
        <>
          <div className="stats-grid">
            <article className="stat-card">
              <p>Total Shipments</p>
              <h3>{shipments.length}</h3>
            </article>
            <article className="stat-card">
              <p>In Transit</p>
              <h3>{inTransitCount}</h3>
            </article>
            <article className="stat-card">
              <p>Delivered</p>
              <h3>{deliveredCount}</h3>
            </article>
          </div>

          <section className="panel">
            <h3>Status Pipeline</h3>
            <div className="timeline-row">
              {statusOrder.map((status) => {
                const count = shipments.filter((shipment) => shipment.status === status).length;
                return (
                  <div className="timeline-node" key={status}>
                    <span>{status}</span>
                    <strong>{count}</strong>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}
