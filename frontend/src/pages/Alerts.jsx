import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

export default function Alerts({
  alerts = [],
  onOpenAlert,
  onRefresh,
}) {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set(alerts.map((a) => a.category).filter(Boolean));
    return Array.from(set);
  }, [alerts]);

  // Filtered alerts
  const filtered = useMemo(() => {
    return alerts.filter((alert) => {
      // Severity filter
      if (severityFilter !== "all") {
        const s = Number(alert.severity);
        if (severityFilter === "critical" && s !== 1) return false;
        if (severityFilter === "high" && s !== 2) return false;
        if (severityFilter === "medium" && s !== 3) return false;
        if (severityFilter === "low" && s !== 4) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const st = (alert.status || "").toLowerCase();
        if (st !== statusFilter.toLowerCase()) return false;
      }

      // Category filter
      if (categoryFilter !== "all" && alert.category !== categoryFilter) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const text = `${alert.signature || ""} ${alert.attack || ""} ${alert.source_ip || ""} ${alert.destination_ip || ""} ${alert.sensor || ""} ${alert.rule_id || ""}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [alerts, severityFilter, statusFilter, categoryFilter, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedAlerts = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSeverityBadgeClass = (severity) => {
    const s = Number(severity);
    if (s === 1) return "badge-critical";
    if (s === 2) return "badge-high";
    if (s === 3) return "badge-medium";
    return "badge-low";
  };

  const getSeverityLabel = (severity) => {
    const s = Number(severity);
    if (s === 1) return "Critical";
    if (s === 2) return "High";
    if (s === 3) return "Medium";
    return "Low";
  };

  const getStatusBadgeClass = (status) => {
    const st = (status || "").toLowerCase();
    if (st === "open") return "status-pill-open";
    if (st === "in progress" || st === "in_progress") return "status-pill-progress";
    if (st === "closed" || st === "resolved") return "status-pill-closed";
    return "status-pill-open";
  };

  const exportCSV = () => {
    const headers = [
      "Time",
      "Severity",
      "Source IP",
      "Destination IP",
      "Attack",
      "Signature",
      "Sensor",
      "Status",
    ];
    const rows = filtered.map((a) => [
      a.display_time || a.timestamp,
      getSeverityLabel(a.severity),
      a.source_ip,
      a.destination_ip,
      `"${a.attack || ""}"`,
      `"${a.signature || ""}"`,
      a.sensor,
      a.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `suricata_alerts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="alerts-page-wrapper">
      {/* Header Row */}
      <div className="alerts-page-header">
        <div>
          <h2>Security Alerts</h2>
          <p className="page-desc-subtext">
            Comprehensive log of all IDS alert events captured by Suricata sensors.
          </p>
        </div>

        <div className="header-action-buttons">
          <button className="secondary-outline-btn" onClick={exportCSV}>
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button className="primary-pill-btn" onClick={onRefresh}>
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="alerts-filters-card">
        <div className="filters-upper-row">
          {/* Search Box */}
          <div className="alerts-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by signature, IP, rule ID, or attack..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Category Dropdown */}
          <div className="category-select-wrapper">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select-field"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Severity & Status Filter Pills */}
        <div className="filters-lower-row">
          <div className="filter-pill-group">
            <span className="filter-group-label">Severity:</span>
            {["all", "critical", "high", "medium", "low"].map((sev) => (
              <button
                key={sev}
                className={`filter-pill-btn ${severityFilter === sev ? "active" : ""}`}
                onClick={() => {
                  setSeverityFilter(sev);
                  setCurrentPage(1);
                }}
              >
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
              </button>
            ))}
          </div>

          <div className="filter-pill-group">
            <span className="filter-group-label">Status:</span>
            {["all", "open", "in progress", "closed"].map((st) => (
              <button
                key={st}
                className={`filter-pill-btn ${statusFilter === st ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
              >
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Alerts Table */}
      <div className="dashboard-card table-panel">
        <div className="dashboard-card-header table-header-row">
          <h3 className="card-heading-title">
            All Alerts ({filtered.length} found)
          </h3>
          <span className="page-range-indicator">
            Showing {(currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, filtered.length)} of{" "}
            {filtered.length}
          </span>
        </div>

        <div className="table-responsive-container">
          <table className="siem-data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Severity</th>
                <th>Source IP</th>
                <th>Destination IP</th>
                <th>Attack</th>
                <th>Signature</th>
                <th>Sensor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-table-cell">
                    No alerts match the current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    onClick={() => onOpenAlert(alert)}
                    className="clickable-table-row"
                  >
                    <td className="time-cell">{alert.display_time || "10:42:15"}</td>
                    <td>
                      <span className={`pill-badge ${getSeverityBadgeClass(alert.severity)}`}>
                        {getSeverityLabel(alert.severity)}
                      </span>
                    </td>
                    <td className="ip-mono-cell">{alert.source_ip}</td>
                    <td className="ip-mono-cell">{alert.destination_ip}</td>
                    <td className="attack-cell">{alert.attack}</td>
                    <td className="signature-cell" title={alert.signature}>
                      {alert.signature}
                    </td>
                    <td className="sensor-cell">{alert.sensor}</td>
                    <td>
                      <span className={`status-pill ${getStatusBadgeClass(alert.status)}`}>
                        {alert.status || "Open"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="table-pagination-bar">
            <button
              className="pagination-arrow-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  className={`page-num-btn ${currentPage === pg ? "active" : ""}`}
                  onClick={() => setCurrentPage(pg)}
                >
                  {pg}
                </button>
              ))}
            </div>

            <button
              className="pagination-arrow-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
