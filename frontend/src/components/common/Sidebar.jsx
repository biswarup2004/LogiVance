import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Shipments", to: "/shipments" },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <span className="brand-dot" aria-hidden="true" />
        <div>
          <p className="brand-name">TransitHub</p>
          <p className="brand-subtitle">Shipper Portal</p>
        </div>
      </div>
      <nav className="nav-list" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) =>
              isActive ? "nav-item nav-item-active" : "nav-item"
            }
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
