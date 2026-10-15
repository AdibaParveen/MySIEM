import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  LogOut,
  X,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export default function Topbar({
  pageTitle = "Dashboard",
  onToggleSidebar,
  alerts = [],
  onOpenAlert,
  onLogout,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  // Close popovers when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResultsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter alerts for search dropdown
  const searchResults = searchQuery.trim()
    ? alerts
        .filter((a) => {
          const q = searchQuery.toLowerCase();
          return (
            (a.signature && a.signature.toLowerCase().includes(q)) ||
            (a.attack && a.attack.toLowerCase().includes(q)) ||
            (a.source_ip && a.source_ip.toLowerCase().includes(q)) ||
            (a.destination_ip && a.destination_ip.toLowerCase().includes(q)) ||
            (a.category && a.category.toLowerCase().includes(q))
          );
        })
        .slice(0, 5)
    : [];

  const unreadCount = 1; // As seen in image 3 badge

  return (
    <header className="siem-topbar">
      {/* Left side: Hamburger + Page title */}
      <div className="topbar-left">
        <button
          className="topbar-icon-button menu-toggle"
          onClick={onToggleSidebar}
          title="Toggle Navigation"
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>
        <h1 className="topbar-page-title">{pageTitle}</h1>
      </div>

      {/* Right side: Search, Notifications, Logout */}
      <div className="topbar-right">
        {/* Search Input Box */}
        <div className="topbar-search-container" ref={searchRef}>
          <div className="topbar-search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="topbar-search-input"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchResultsOpen(true);
              }}
              onFocus={() => setSearchResultsOpen(true)}
            />
            {searchQuery && (
              <button
                className="search-clear-button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResultsOpen(false);
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResultsOpen && searchQuery.trim() && (
            <div className="topbar-search-dropdown">
              <div className="search-dropdown-header">
                <span>Matching Alerts ({searchResults.length})</span>
              </div>
              {searchResults.length === 0 ? (
                <div className="search-dropdown-empty">
                  No alerts match "{searchQuery}"
                </div>
              ) : (
                <div className="search-dropdown-list">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="search-result-item"
                      onClick={() => {
                        setSearchResultsOpen(false);
                        setSearchQuery("");
                        if (onOpenAlert) onOpenAlert(item);
                      }}
                    >
                      <div className="result-indicator-col">
                        <span className={`severity-dot sev-${item.severity}`} />
                      </div>
                      <div className="result-text-col">
                        <strong className="result-title">
                          {item.attack || item.signature}
                        </strong>
                        <span className="result-subtitle">
                          {item.source_ip} → {item.destination_ip} • {item.sensor || "suricata"}
                        </span>
                      </div>
                      <ExternalLink size={13} className="result-arrow" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="topbar-notif-container" ref={notifRef}>
          <button
            className="topbar-icon-button notif-button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="notifications-popover">
              <div className="notif-popover-header">
                <span className="notif-title">Notifications</span>
                <span className="notif-subtext">{unreadCount} new critical alert</span>
              </div>
              <div className="notif-list">
                <div
                  className="notif-item unread"
                  onClick={() => {
                    setNotificationsOpen(false);
                    const criticalAlert = alerts.find((a) => Number(a.severity) === 1);
                    if (criticalAlert && onOpenAlert) onOpenAlert(criticalAlert);
                  }}
                >
                  <div className="notif-icon-circle critical">
                    <AlertTriangle size={15} />
                  </div>
                  <div className="notif-content">
                    <strong className="notif-headline">Critical Alert Detected</strong>
                    <p className="notif-desc">
                      ET WEB_SERVER Apache Struts RCE attempted against 192.168.1.10.
                    </p>
                    <span className="notif-time">2 minutes ago</span>
                  </div>
                </div>

                <div className="notif-item">
                  <div className="notif-icon-circle success">
                    <CheckCircle size={15} />
                  </div>
                  <div className="notif-content">
                    <strong className="notif-headline">Sensors Synchronized</strong>
                    <p className="notif-desc">All 5 Suricata sensors are healthy and streaming logs.</p>
                    <span className="notif-time">15 minutes ago</span>
                  </div>
                </div>
              </div>
              <div className="notif-popover-footer">
                <button
                  className="notif-action-btn"
                  onClick={() => setNotificationsOpen(false)}
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout Exit Icon (Red door icon in image 3) */}
        <button
          className="topbar-icon-button logout-button"
          onClick={onLogout}
          title="Sign out of MySIEM"
          aria-label="Sign out"
        >
          <LogOut size={20} className="logout-icon" />
        </button>
      </div>
    </header>
  );
}
