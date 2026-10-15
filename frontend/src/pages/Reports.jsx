import React from "react";
import {
  FileText,
  Printer,
  Download,
  Shield,
  AlertTriangle,
  Server,
  Calendar,
} from "lucide-react";

export default function Reports({ alerts = [], stats = null }) {
  const kpi = stats?.kpi || {
    total_alerts: 1248,
    critical_alerts: 23,
    high_alerts: 67,
    active_sensors: 5,
    assets_monitored: 120,
  };

  return (
    <div className="reports-page-wrapper">
      <div className="alerts-page-header">
        <div>
          <h2>Security Operations Report</h2>
          <p className="page-desc-subtext">
            Official SOC audit report of intrusion detection events, threats, and sensor telemetry.
          </p>
        </div>

        <div className="header-action-buttons">
          <button
            className="save-changes-primary-btn"
            onClick={() => window.print()}
          >
            <Printer size={15} />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="printable-report-card">
        <div className="report-doc-header">
          <div className="report-doc-brand">
            <Shield size={28} className="text-blue" />
            <div>
              <h3>MySIEM Enterprise SOC Report</h3>
              <span>Generated on {new Date().toLocaleDateString()} • Confidential</span>
            </div>
          </div>
          <div className="report-doc-badge">
            <span>Suricata IDS Engine v7.0</span>
          </div>
        </div>

        <div className="report-divider" />

        {/* Executive Summary */}
        <div className="report-section">
          <h4 className="report-section-title">1. Executive Summary</h4>
          <p className="report-body-text">
            During the monitoring cycle, a total of{" "}
            <strong>{kpi.total_alerts.toLocaleString()} security events</strong> were captured
            across 5 distributed Suricata network IDS sensors. A notable cluster of{" "}
            <strong>{kpi.critical_alerts} Critical</strong> and{" "}
            <strong>{kpi.high_alerts} High</strong> severity alerts were identified, primarily
            involving Web Application Exploit attempts (Apache Struts RCE) and internal Reconnaissance sweeps.
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="report-section">
          <h4 className="report-section-title">2. Operational Key Metrics</h4>
          <div className="report-metrics-grid">
            <div className="report-metric-box">
              <span>Total Alerts</span>
              <strong>{kpi.total_alerts.toLocaleString()}</strong>
            </div>
            <div className="report-metric-box critical-border">
              <span>Critical Incidents</span>
              <strong className="text-red">{kpi.critical_alerts}</strong>
            </div>
            <div className="report-metric-box high-border">
              <span>High Severity</span>
              <strong className="text-orange">{kpi.high_alerts}</strong>
            </div>
            <div className="report-metric-box">
              <span>Monitored Assets</span>
              <strong>{kpi.assets_monitored}</strong>
            </div>
          </div>
        </div>

        {/* Top Threat Incidents Table */}
        <div className="report-section">
          <h4 className="report-section-title">3. Critical Threat Signatures Recorded</h4>
          <table className="siem-data-table">
            <thead>
              <tr>
                <th>Rule ID</th>
                <th>Signature / Threat Vector</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Action Taken</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="mono-text">2010937</td>
                <td>ET WEB_SERVER Apache Struts RCE</td>
                <td>Web Attack</td>
                <td><span className="pill-badge badge-critical">Critical</span></td>
                <td>Alert / Logged</td>
              </tr>
              <tr>
                <td className="mono-text">2009582</td>
                <td>ET SCAN Nmap Scripting Engine</td>
                <td>Scanning</td>
                <td><span className="pill-badge badge-high">High</span></td>
                <td>Alert / Logged</td>
              </tr>
              <tr>
                <td className="mono-text">2024108</td>
                <td>ET INFO DNS Tunneling Detected</td>
                <td>Malware</td>
                <td><span className="pill-badge badge-medium">Medium</span></td>
                <td>Alert / Logged</td>
              </tr>
              <tr>
                <td className="mono-text">2001219</td>
                <td>ET SSH Failed Login Attempt</td>
                <td>Brute Force</td>
                <td><span className="pill-badge badge-high">High</span></td>
                <td>Alert / Logged</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-footer-signoff">
          <span>Prepared by SOC Security Operations Center • MySIEM Security Platform</span>
          <span>Status: Verified by Lead Analyst</span>
        </div>
      </div>
    </div>
  );
}
