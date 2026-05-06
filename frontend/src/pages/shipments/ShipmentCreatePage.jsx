import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createShipment } from "../../services/shipmentService";
import { ErrorState } from "../../components/common/ErrorState";

export function ShipmentCreatePage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    weightKg: "",
    description: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.origin || !formData.destination || !formData.weightKg) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const weight = Number(formData.weightKg);
    if (isNaN(weight) || weight <= 0) {
      setErrorMessage("Weight must be a positive number.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        origin: formData.origin,
        destination: formData.destination,
        weightKg: weight,
        description: formData.description,
      };
      
      const newShipment = await createShipment(payload);
      // Navigate to the newly created shipment detail page
      navigate(`/shipments/${newShipment.id}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create shipment. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <div className="detail-header">
        <div>
          <p className="eyebrow">Load Board</p>
          <h2 className="page-title">Create New Shipment</h2>
        </div>
        <Link className="btn btn-secondary" to="/shipments">
          Back to Shipments
        </Link>
      </div>

      <div className="panel" style={{ maxWidth: "600px" }}>
        {errorMessage && (
          <div style={{ marginBottom: "1.5rem" }}>
             <ErrorState title="Creation Failed" message={errorMessage} />
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label htmlFor="origin" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Origin (Required)
            </label>
            <input
              id="origin"
              name="origin"
              type="text"
              className="text-input"
              style={{ width: "100%" }}
              placeholder="e.g., Los Angeles, CA"
              value={formData.origin}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="destination" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Destination (Required)
            </label>
            <input
              id="destination"
              name="destination"
              type="text"
              className="text-input"
              style={{ width: "100%" }}
              placeholder="e.g., New York, NY"
              value={formData.destination}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="weightKg" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Weight in Kg (Required)
            </label>
            <input
              id="weightKg"
              name="weightKg"
              type="number"
              step="0.1"
              min="0.1"
              className="text-input"
              style={{ width: "100%" }}
              placeholder="e.g., 50.5"
              value={formData.weightKg}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="description" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              className="text-input"
              style={{ width: "100%", minHeight: "100px", resize: "vertical" }}
              placeholder="Any additional details about the cargo..."
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div style={{ marginTop: "1rem" }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting}
              style={{ width: "100%" }}
            >
              {isSubmitting ? "Creating Shipment..." : "Post Shipment to Load Board"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
