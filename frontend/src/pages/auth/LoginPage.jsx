import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { hasValidAuthSession, saveAuthSession } from "../../utils/authStorage";
import { minLength } from "../../utils/validators";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("shipper1");
  const [password, setPassword] = useState("password123");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (hasValidAuthSession()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const validate = () => {
    const nextErrors = {};

    if (!minLength(username, 3)) {
      nextErrors.username = "Username must be at least 3 characters.";
    }

    if (!minLength(password, 6)) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setServerError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const auth = await loginUser({ username: username.trim(), password });
      saveAuthSession(auth);

      const redirectTo = location.state?.from ?? "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed. Please try again.";
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to TransitHub</h1>
        {serverError ? <p className="alert alert-error">{serverError}</p> : null}

        <label className="field-label" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          type="text"
          className={`text-input ${errors.username ? "text-input-error" : ""}`}
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            setErrors((prev) => ({ ...prev, username: "" }));
          }}
          aria-invalid={Boolean(errors.username)}
          required
        />
        {errors.username ? <p className="field-error">{errors.username}</p> : null}

        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className={`text-input ${errors.password ? "text-input-error" : ""}`}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
          aria-invalid={Boolean(errors.password)}
          required
        />
        {errors.password ? <p className="field-error">{errors.password}</p> : null}

        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </button>

        <p className="auth-help">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
