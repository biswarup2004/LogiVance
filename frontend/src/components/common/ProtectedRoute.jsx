import { Navigate, useLocation } from "react-router-dom";
import { hasValidAuthSession } from "../../utils/authStorage";

export function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!hasValidAuthSession()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
