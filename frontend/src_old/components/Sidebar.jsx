function Sidebar({ activePage, setActivePage, isOpen }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "⌂" },
    { id: "alerts", label: "Alerts", icon: "!" },
    { id: "events", label: "Events", icon: "◈" },
    { id: "settings", label: "Settings", icon: "⚙" },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-logo">
        <div className="logo-mark">S</div>

        {isOpen && (
          <div className="logo-text">
            <strong>Suricata</strong>
            <span>Security Intelligence</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${
              activePage === item.id ? "active" : ""
            }`}
            onClick={() => setActivePage(item.id)}
            title={!isOpen ? item.label : ""}
          >
            <span className="nav-icon">{item.icon}</span>

            {isOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {isOpen && (
        <div className="sidebar-status">
          <div className="status-dot" />
          <div>
            <strong>System Online</strong>
            <span>SIEM services active</span>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;