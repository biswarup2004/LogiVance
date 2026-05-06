import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { getShipments } from "../../services/shipmentService";

const statusOptions = [
  { value: "ALL", label: "All Statuses" },
  { value: "POSTED", label: "Posted" },
  { value: "AWARDED", label: "Awarded" },
  { value: "AWAITING_PICKUP", label: "Awaiting Pickup" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function ShipmentListPage() {
  const [shipments, setShipments] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadShipments = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const data = await getShipments();
      setShipments(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load shipments.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, []);

  const filteredShipments = useMemo(() => {
    const text = query.trim().toLowerCase();

    return shipments.filter((shipment) => {
      const matchesStatus =
        statusFilter === "ALL" ? true : shipment.status?.toUpperCase() === statusFilter;

      const matchesText =
        text.length === 0
          ? true
          : (shipment.id ?? "").toLowerCase().includes(text) ||
            (shipment.origin ?? "").toLowerCase().includes(text) ||
            (shipment.destination ?? "").toLowerCase().includes(text);

      return matchesStatus && matchesText;
    });
  }, [shipments, query, statusFilter]);

  return (
    <section>
      <p className="eyebrow">Load Board</p>
      <h2 className="page-title">Shipments</h2>

      <div className="title-row">
        <input
          className="text-input search"
          placeholder="Search by ID, origin, destination"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="list-actions">
          <select
            className="text-input select-input"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter shipments by status"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="btn btn-secondary" type="button" onClick={loadShipments}>
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="panel">
          <LoadingState
            title="Loading shipments"
            message="Fetching latest shipment board. This takes a few seconds."
          />
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="panel">
          <ErrorState
            title="Unable to load shipments"
            message={errorMessage}
            actionLabel="Try again"
            onAction={loadShipments}
          />
        </div>
      ) : null}

      {!isLoading && !errorMessage && shipments.length === 0 ? (
        <div className="panel">
          <EmptyState
            title="No shipments yet"
            message="No active shipments are available right now."
          />
        </div>
      ) : null}

      {!isLoading && !errorMessage && shipments.length > 0 && filteredShipments.length === 0 ? (
        <div className="panel">
          <EmptyState
            title="No matching results"
            message="Try a different search term or select another status."
          />
        </div>
      ) : null}

      {!isLoading && !errorMessage && filteredShipments.length > 0 ? (
        <div className="panel table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Route</th>
                <th>Weight</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td>{shipment.id}</td>
                  <td>
                    {shipment.origin} to {shipment.destination}
                  </td>
                  <td>{shipment.weightKg} kg</td>
                  <td>
                    <span className={`status-pill status-${(shipment.status ?? "").toLowerCase()}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td>
                    <Link className="link-btn" to={`/shipments/${shipment.id}`}>
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
