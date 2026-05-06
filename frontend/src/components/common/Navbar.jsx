import { useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthProfile } from "../../utils/authStorage";

export function Navbar() {
  const navigate = useNavigate();
  const profile = getAuthProfile();

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div>
        <p className="eyebrow">Real-Time Shipment Tracking</p>
        <h1 className="navbar-title">Operations Dashboard</h1>
        {profile.username ? (
          <p className="navbar-meta">
            Logged in as <strong>{profile.username}</strong> ({profile.role})
          </p>
        ) : null}
      </div>
      <button className="btn btn-secondary" onClick={handleLogout} type="button">
        Logout
      </button>
    </header>
  );
}
