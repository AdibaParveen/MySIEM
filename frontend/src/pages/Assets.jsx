import React, { useState } from "react";
import {
  Monitor,
  Search,
  Server,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export default function Assets({ assets = [], onSelectAsset }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = assets.filter((ast) => {
    if (statusFilter !== "all" && ast.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        ast.hostname.toLowerCase().includes(q) ||
        ast.ip.toLowerCase().includes(q) ||
        ast.type.toLowerCase().includes(q) ||
        ast.os.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="assets-page-wrapper">
      <div className="alerts-page-header">
        <div>
          <h2>Monitored Assets ({assets.length})</h2>
          <p className="page-desc-subtext">
            Enterprise endpoints, gateways, and server infrastructure monitored by Suricata.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="alerts-filters-card">
        <div className="filters-upper-row">
          <div className="alerts-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search assets by IP, hostname, or OS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-pill-group">
            {["all", "active", "warning", "healthy"].map((st) => (
              <button
                key={st}
                className={`filter-pill-btn ${statusFilter === st ? "active" : ""}`}
                onClick={() => setStatusFilter(st)}
              >
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="assets-grid-cards">
        {filtered.map((ast) => (
          <div key={ast.id} className="asset-card">
            <div className="asset-card-top">
              <div className="asset-icon-box">
                <Server size={22} className="asset-icon" />
              </div>
              <div className="asset-heading-info">
                <h4>{ast.hostname}</h4>
                <span className="mono-ip">{ast.ip}</span>
              </div>
              <span
                className={`status-pill ${
                  ast.status === "Active"
                    ? "status-pill-closed"
                    : ast.status === "Warning"
                    ? "status-pill-open"
                    : "status-pill-progress"
                }`}
              >
                {ast.status}
              </span>
            </div>

            <div className="asset-details-list">
              <div className="asset-detail-row">
                <span>Role / Type</span>
                <strong>{ast.type}</strong>
              </div>
              <div className="asset-detail-row">
                <span>Operating System</span>
                <strong>{ast.os}</strong>
              </div>
              <div className="asset-detail-row">
                <span>Suricata Sensor</span>
                <strong>{ast.sensor}</strong>
              </div>
              <div className="asset-detail-row">
                <span>Risk Score</span>
                <strong
                  className={
                    ast.risk_score >= 80
                      ? "text-red"
                      : ast.risk_score >= 50
                      ? "text-orange"
                      : "text-green"
                  }
                >
                  {ast.risk_score} / 100
                </strong>
              </div>
              <div className="asset-detail-row">
                <span>Active Alerts</span>
                <strong className="text-red">{ast.alerts_count} events</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
