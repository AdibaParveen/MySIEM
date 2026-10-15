function Topbar({ onMenuClick }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-button" onClick={onMenuClick}>
          ☰
        </button>

        <div>
          <h1>Security Operations Center</h1>
          <span>Suricata-driven SIEM</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="connection-status">
          <span className="connection-dot" />
          Live
        </div>

        <div className="topbar-time">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </header>
  );
}

export default Topbar;