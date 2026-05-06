import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { hasValidAuthSession, saveAuthSession } from "../../utils/authStorage";
import { isValidEmail, minLength } from "../../utils/validators";

const roleOptions = [
  { value: "SHIPPER", label: "Shipper" },
  { value: "CARRIER", label: "Carrier" },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "SHIPPER",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (hasValidAuthSession()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setServerError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!minLength(form.username, 3)) {
      nextErrors.username = "Username must be at least 3 characters.";
    }

    if (!isValidEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!minLength(form.password, 8)) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const auth = await registerUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      saveAuthSession(auth);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed. Please try again.";
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Create account</p>
        <h1>Register to TransitHub</h1>
        {serverError ? <p className="alert alert-error">{serverError}</p> : null}

        <label className="field-label" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          type="text"
          className={`text-input ${errors.username ? "text-input-error" : ""}`}
          value={form.username}
          onChange={handleChange("username")}
          required
        />
        {errors.username ? <p className="field-error">{errors.username}</p> : null}

        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={`text-input ${errors.email ? "text-input-error" : ""}`}
          value={form.email}
          onChange={handleChange("email")}
          required
        />
        {errors.email ? <p className="field-error">{errors.email}</p> : null}

        <label className="field-label" htmlFor="role">
          Account Role
        </label>
        <select
          id="role"
          className="text-input"
          value={form.role}
          onChange={handleChange("role")}
        >
          {roleOptions.map((roleOption) => (
            <option key={roleOption.value} value={roleOption.value}>
              {roleOption.label}
            </option>
          ))}
        </select>

        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className={`text-input ${errors.password ? "text-input-error" : ""}`}
          value={form.password}
          onChange={handleChange("password")}
          required
        />
        {errors.password ? <p className="field-error">{errors.password}</p> : null}

        <label className="field-label" htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          className={`text-input ${errors.confirmPassword ? "text-input-error" : ""}`}
          value={form.confirmPassword}
          onChange={handleChange("confirmPassword")}
          required
        />
        {errors.confirmPassword ? (
          <p className="field-error">{errors.confirmPassword}</p>
        ) : null}

        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

        <p className="auth-help">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
