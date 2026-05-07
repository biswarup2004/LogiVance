import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createShipment } from "../../services/shipmentService";
import { ErrorState } from "../../components/common/ErrorState";

export function ShipmentCreatePage() {
  const navigate = useNavigate();
  
  // Steps: 1 = Details, 2 = Quote, 3 = Payment
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    weightKg: "",
    description: "",
  });

  const [quote, setQuote] = useState(null);

  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGetQuote = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.origin || !formData.destination || !formData.weightKg) {
      setErrorMessage("Please fill out origin, destination, and weight to get a quote.");
      return;
    }

    const weight = Number(formData.weightKg);
    if (isNaN(weight) || weight <= 0) {
      setErrorMessage("Weight must be a positive number.");
      return;
    }

    // Dummy realistic distance calculation based on string length (for prototype)
    const mockDistanceKm = (formData.origin.length + formData.destination.length) * 15 + 100;
    
    // Pricing formula: Base $50 + $1.50 per km + $0.50 per kg
    const calculatedPrice = 50 + (mockDistanceKm * 1.50) + (weight * 0.50);
    
    setQuote({
      distanceKm: mockDistanceKm,
      price: Number(calculatedPrice.toFixed(2)),
    });

    setStep(2);
  };

  const handleProceedToPayment = () => {
    setStep(3);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!paymentData.cardNumber || !paymentData.expiry || !paymentData.cvv) {
      setErrorMessage("Please fill out all payment details.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        origin: formData.origin,
        destination: formData.destination,
        weightKg: Number(formData.weightKg),
        description: formData.description,
        price: quote.price
      };
      
      const newShipment = await createShipment(payload);
      // Navigate to the newly created shipment detail page
      navigate(`/shipments/${newShipment.id}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to process payment and create shipment.");
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
             <ErrorState title="Action Failed" message={errorMessage} />
          </div>
        )}

        {/* STEP 1: Details */}
        {step === 1 && (
          <form onSubmit={handleGetQuote} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} autoComplete="off">
            <h3>Step 1: Shipment Details</h3>
            
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
                onChange={handleFormChange}
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
                onChange={handleFormChange}
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
                onChange={handleFormChange}
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
                onChange={handleFormChange}
              />
            </div>

            <div style={{ marginTop: "1rem" }}>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                Calculate Quote
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Quote */}
        {step === 2 && quote && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h3>Step 2: Fair Charge Quote</h3>
            
            <div className="kv-list" style={{ background: "var(--background-secondary)", padding: "1rem", borderRadius: "8px" }}>
               <p><strong>Route:</strong> {formData.origin} &rarr; {formData.destination}</p>
               <p><strong>Estimated Distance:</strong> {quote.distanceKm} km</p>
               <p><strong>Total Weight:</strong> {formData.weightKg} kg</p>
               <p style={{ fontSize: "1.2rem", marginTop: "1rem", color: "var(--primary-color)" }}>
                 <strong>Total Quote: ${quote.price.toFixed(2)}</strong>
               </p>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>
                Edit Details
              </button>
              <button type="button" className="btn btn-primary" onClick={handleProceedToPayment} style={{ flex: 1 }}>
                Proceed to Payment
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment */}
        {step === 3 && quote && (
          <form onSubmit={handlePaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} autoComplete="off">
            <h3>Step 3: Payment</h3>
            <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
              <strong>Amount Due: ${quote.price.toFixed(2)}</strong>
            </p>

            <div>
              <label htmlFor="cardNumber" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Card Number (Dummy)
              </label>
              <input
                id="cardNumber"
                name="cardNumber"
                type="text"
                className="text-input"
                style={{ width: "100%" }}
                placeholder="0000 0000 0000 0000"
                value={paymentData.cardNumber}
                onChange={handlePaymentChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
               <div style={{ flex: 1 }}>
                  <label htmlFor="expiry" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                    Expiry Date
                  </label>
                  <input
                    id="expiry"
                    name="expiry"
                    type="text"
                    className="text-input"
                    style={{ width: "100%" }}
                    placeholder="MM/YY"
                    value={paymentData.expiry}
                    onChange={handlePaymentChange}
                    disabled={isSubmitting}
                    required
                  />
               </div>
               <div style={{ flex: 1 }}>
                  <label htmlFor="cvv" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                    CVV
                  </label>
                  <input
                    id="cvv"
                    name="cvv"
                    type="text"
                    className="text-input"
                    style={{ width: "100%" }}
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={handlePaymentChange}
                    disabled={isSubmitting}
                    required
                  />
               </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(2)} disabled={isSubmitting} style={{ flex: 1 }}>
                Back to Quote
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ flex: 1 }}>
                {isSubmitting ? "Processing..." : `Pay $${quote.price.toFixed(2)}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
