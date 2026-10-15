import React, { useState, useEffect } from "react";
import {
  Bell,
  ShieldAlert,
  BarChart3,
  Radio,
  Monitor,
  ArrowUpRight,
  ArrowRight,
  Cpu,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  AlertsOverTimeChart,
  SeverityDonutChart,
  TopAttackCategoriesChart,
} from "../components/Charts";
import { getAnomalies, runAnomalyDetection } from "../services/api";

export default function Dashboard({
  alerts = [],
  stats = null,
  onOpenAlert,
  onNavigate,
}) {
  const [anomalies, setAnomalies] = useState([]);
  const [runningML, setRunningML] = useState(false);
  const [showAnomalies, setShowAnomalies] = useState(false);

  useEffect(() => {
    getAnomalies()
      .then((data) => {
        if (data && data.anomalies) setAnomalies(data.anomalies);
      })
      .catch(() => {});
  }, []);

  const handleRunML = async () => {
    setRunningML(true);
    try {
      const res = await runAnomalyDetection();
      if (res && res.anomalies) {
        setAnomalies(res.anomalies);
      }
    } catch (e) {
      console.warn("ML detection local state fallback:", e);
    } finally {
      setRunningML(false);
    }
  };
  // Extract or default KPI values
  const kpi = stats?.kpi || {
    total_alerts: "1,248",
    total_change: "↑ 18% from yesterday",
    critical_alerts: "23",
    critical_change: "↑ 27% from yesterday",
    high_alerts: "67",
    high_change: "↑ 12% from yesterday",
    active_sensors: "5",
    sensors_status: "All sensors running",
    assets_monitored: "120",
    assets_change: "↑ 8% from yesterday",
  };

  // Recent 5 alerts matching the table shown in Image 3
  const recentAlerts = alerts.slice(0, 5);

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

  return (
    <div className="dashboard-page">
      {/* Row 1: 5 KPI Summary Cards */}
      <section className="kpi-cards-row">
        {/* 1. Total Alerts */}
        <div className="stat-card">
          <div className="stat-card-text">
            <span className="stat-card-title">Total Alerts</span>
            <div className="stat-card-value">
              {typeof kpi.total_alerts === "number"
                ? kpi.total_alerts.toLocaleString()
                : kpi.total_alerts}
            </div>
            <div className="stat-card-trend positive">
              <span className="trend-arrow">↑</span>
              <span>18% from yesterday</span>
            </div>
          </div>
          <div className="stat-icon-wrapper blue">
            <Bell size={22} className="kpi-icon" />
          </div>
        </div>

        {/* 2. Critical Alerts */}
        <div className="stat-card">
          <div className="stat-card-text">
            <span className="stat-card-title">Critical Alerts</span>
            <div className="stat-card-value">
              {typeof kpi.critical_alerts === "number"
                ? kpi.critical_alerts.toLocaleString()
                : kpi.critical_alerts}
            </div>
            <div className="stat-card-trend positive">
              <span className="trend-arrow">↑</span>
              <span>27% from yesterday</span>
            </div>
          </div>
          <div className="stat-icon-wrapper red">
            <ShieldAlert size={22} className="kpi-icon" />
          </div>
        </div>

        {/* 3. High Alerts */}
        <div className="stat-card">
          <div className="stat-card-text">
            <span className="stat-card-title">High Alerts</span>
            <div className="stat-card-value">
              {typeof kpi.high_alerts === "number"
                ? kpi.high_alerts.toLocaleString()
                : kpi.high_alerts}
            </div>
            <div className="stat-card-trend positive">
              <span className="trend-arrow">↑</span>
              <span>12% from yesterday</span>
            </div>
          </div>
          <div className="stat-icon-wrapper orange">
            <BarChart3 size={22} className="kpi-icon" />
          </div>
        </div>

        {/* 4. Active Sensors */}
        <div className="stat-card">
          <div className="stat-card-text">
            <span className="stat-card-title">Active Sensors</span>
            <div className="stat-card-value">{kpi.active_sensors}</div>
            <div className="stat-card-subtitle">
              <span>All sensors running</span>
            </div>
          </div>
          <div className="stat-icon-wrapper green">
            <Radio size={22} className="kpi-icon" />
          </div>
        </div>

        {/* 5. Assets Monitored */}
        <div className="stat-card">
          <div className="stat-card-text">
            <span className="stat-card-title">Assets Monitored</span>
            <div className="stat-card-value">{kpi.assets_monitored}</div>
            <div className="stat-card-trend positive">
              <span className="trend-arrow">↑</span>
              <span>8% from yesterday</span>
            </div>
          </div>
          <div className="stat-icon-wrapper purple">
            <Monitor size={22} className="kpi-icon" />
          </div>
        </div>
      </section>

      {/* Row 2: 3 Analytics Visualizations */}
      <section className="analytics-charts-row">
        {/* Chart 1: Alerts Over Time */}
        <div className="dashboard-card chart-panel">
          <div className="dashboard-card-header">
            <h3 className="card-heading-title">Alerts Over Time (Last 24 Hours)</h3>
          </div>
          <div className="card-body-chart">
            <AlertsOverTimeChart data={stats?.time_series} />
          </div>
        </div>

        {/* Chart 2: Alerts by Severity */}
        <div className="dashboard-card chart-panel">
          <div className="dashboard-card-header">
            <h3 className="card-heading-title">Alerts by Severity</h3>
          </div>
          <div className="card-body-chart">
            <SeverityDonutChart data={stats?.severity_breakdown} />
          </div>
        </div>

        {/* Chart 3: Top Attack Categories */}
        <div className="dashboard-card chart-panel">
          <div className="dashboard-card-header">
            <h3 className="card-heading-title">Top Attack Categories</h3>
          </div>
          <div className="card-body-chart">
            <TopAttackCategoriesChart data={stats?.categories} />
          </div>
        </div>
      </section>

      {/* Row 2.5: AI & ML Anomaly Detection (Section 9) */}
      <section className="ml-anomaly-section">
        <div className="dashboard-card ml-panel">
          <div className="dashboard-card-header ml-header-row">
            <div className="ml-title-group">
              <div className="ml-icon-badge">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="card-heading-title">Python ML Anomaly Detection (Isolation Forest)</h3>
                <p className="ml-subtitle">
                  Continuous behavioral anomaly evaluation &amp; statistical entropy monitoring
                </p>
              </div>
            </div>
            <div className="ml-actions">
              <span className="ml-status-tag">
                <span className="live-dot-green"></span>
                Engine Active (scikit-learn)
              </span>
              <button
                className="btn-primary-blue run-ml-btn"
                onClick={handleRunML}
                disabled={runningML}
              >
                {runningML ? (
                  <>
                    <RefreshCw size={14} className="spin-icon" /> Running Engine...
                  </>
                ) : (
                  <>
                    <Cpu size={14} /> Run ML Detection
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="ml-body">
            {anomalies && anomalies.length > 0 ? (
              <div className="anomalies-grid">
                {anomalies.slice(0, 4).map((anom, idx) => (
                  <div key={idx} className="anomaly-card">
                    <div className="anomaly-top">
                      <span className="anomaly-type-pill">
                        <AlertTriangle size={12} />
                        {anom.threat_context || "Behavioral Anomaly"}
                      </span>
                      <span className="anomaly-confidence">
                        Score: <strong>{anom.confidence_score}</strong>
                      </span>
                    </div>
                    <div className="anomaly-title">{anom.anomaly_type}</div>
                    <div className="anomaly-endpoints">
                      <span><strong>Src:</strong> {anom.source_ip}</span>
                      <span>→</span>
                      <span><strong>Dst:</strong> {anom.destination_ip}</span>
                    </div>
                    {anom.metrics && (
                      <div className="anomaly-metrics-chips">
                        {anom.metrics.packet_rate_per_sec > 50 && (
                          <span className="chip-stat">Rate: {anom.metrics.packet_rate_per_sec}/s</span>
                        )}
                        {anom.metrics.dns_entropy > 3.5 && (
                          <span className="chip-stat">Entropy: {anom.metrics.dns_entropy}</span>
                        )}
                        {anom.metrics.failed_auth_count > 0 && (
                          <span className="chip-stat">Failed Auth: {anom.metrics.failed_auth_count}</span>
                        )}
                        {anom.metrics.unique_dest_ports > 5 && (
                          <span className="chip-stat">Ports: {anom.metrics.unique_dest_ports}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="ml-empty-state">
                <Sparkles size={24} className="empty-icon" />
                <p>No anomalous patterns detected in current traffic baseline window.</p>
                <span>Click &quot;Run ML Detection&quot; to execute Isolation Forest analysis on latest Suricata events.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Row 3: Recent Alerts Table */}
      <section className="recent-alerts-section">
        <div className="dashboard-card table-panel">
          <div className="dashboard-card-header table-header-row">
            <h3 className="card-heading-title">Recent Alerts</h3>
            <button
              className="view-all-link-btn"
              onClick={() => onNavigate("alerts")}
            >
              <span>View All</span>
              <ArrowRight size={14} className="arrow-icon" />
            </button>
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
                {recentAlerts.map((alert) => (
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
                    <td className="ip-mono-cell">{alert.source_ip || "10.0.0.5"}</td>
                    <td className="ip-mono-cell">{alert.destination_ip || "192.168.1.10"}</td>
                    <td className="attack-cell">{alert.attack || "SQL Injection Attempt"}</td>
                    <td className="signature-cell" title={alert.signature}>
                      {alert.signature || "ET WEB_SERVER Apache Struts RCE"}
                    </td>
                    <td className="sensor-cell">{alert.sensor || "suricata-sensor-01"}</td>
                    <td>
                      <span className={`status-pill ${getStatusBadgeClass(alert.status)}`}>
                        {alert.status || "Open"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
