import React, { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Check,
  Clock,
  Shield,
  Send,
  Save,
} from "lucide-react";

export default function AlertDetails({
  alert,
  onBack,
  onUpdateStatus,
  onAddNote,
}) {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(alert?.status || "Open");
  const [notesText, setNotesText] = useState(alert?.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  if (!alert) {
    return (
      <div className="alert-details-empty">
        <p>No alert selected.</p>
        <button className="back-link-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Alerts</span>
        </button>
      </div>
    );
  }

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
    if (st === "false positive" || st === "false_positive") return "status-pill-muted";
    return "status-pill-open";
  };

  const handleSelectStatus = async (newStatus) => {
    setCurrentStatus(newStatus);
    setStatusDropdownOpen(false);
    setIsSaving(true);

    try {
      if (onUpdateStatus) {
        await onUpdateStatus(alert.id, newStatus, notesText);
      }
      setToastMessage(`Alert status updated to "${newStatus}"`);
      setTimeout(() => setToastMessage(""), 3500);
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to update alert status");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!notesText.trim()) return;
    setIsSaving(true);
    try {
      if (onAddNote) {
        await onAddNote(alert.id, notesText);
      } else if (onUpdateStatus) {
        await onUpdateStatus(alert.id, currentStatus, notesText);
      }
      setToastMessage("Investigation notes saved successfully");
      setTimeout(() => setToastMessage(""), 3500);
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="alert-details-page-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="details-toast-notification">
          <Check size={16} className="toast-check" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="alert-details-header-bar">
        <div className="header-left-title" onClick={onBack}>
          <ArrowLeft size={18} className="back-arrow" />
          <h2>Alert Details</h2>
        </div>

        <button className="back-to-alerts-btn" onClick={onBack}>
          <ArrowLeft size={15} />
          <span>Back to Alerts</span>
        </button>
      </div>

      {/* Main Alert Details Card (Exact match to Image 2) */}
      <div className="alert-details-card">
        <div className="alert-details-main-grid">
          {/* Left Column: Metadata Attributes */}
          <div className="alert-metadata-column">
            <div className="meta-attribute-row">
              <span className="meta-label">Severity</span>
              <div className="meta-value">
                <span className={`pill-badge ${getSeverityBadgeClass(alert.severity)}`}>
                  {getSeverityLabel(alert.severity)}
                </span>
              </div>
            </div>

            <div className="meta-attribute-row">
              <span className="meta-label">Status</span>
              <div className="meta-value">
                <span className={`status-pill ${getStatusBadgeClass(currentStatus)}`}>
                  {currentStatus}
                </span>
              </div>
            </div>

            <div className="meta-attribute-row">
              <span className="meta-label">Alert ID</span>
              <span className="meta-value mono-text">{alert.id || "66a8f3b9e7a1e"}</span>
            </div>

            <div className="meta-attribute-row">
              <span className="meta-label">Time</span>
              <span className="meta-value">
                {alert.formatted_date || alert.timestamp || "6 Aug 2025 10:42:15"}
              </span>
            </div>

            <div className="meta-attribute-row">
              <span className="meta-label">Sensor</span>
              <span className="meta-value">{alert.sensor || "suricata-sensor-01"}</span>
            </div>

            <div className="meta-attribute-row">
              <span className="meta-label">Signature</span>
              <span className="meta-value signature-text">
                {alert.signature || "ET WEB_SERVER Apache Struts RCE"}
              </span>
            </div>

            <div className="meta-attribute-row">
              <span className="meta-label">Category</span>
              <span className="meta-value">{alert.category || "Web Attack"}</span>
            </div>

            <div className="meta-attribute-row">
              <span className="meta-label">Rule ID</span>
              <span className="meta-value">{alert.rule_id || 2010937}</span>
            </div>

            <div className="meta-attribute-row">
              <span className="meta-label">Protocol</span>
              <span className="meta-value">{alert.protocol || "HTTP"}</span>
            </div>

            <div className="meta-attribute-row">
              <span className="meta-label">Action</span>
              <span className="meta-value">{alert.action || "Allowed"}</span>
            </div>
          </div>

          {/* Right Column: Description, Source, Destination, Packet Snippet */}
          <div className="alert-content-column">
            {/* Description */}
            <div className="alert-section-block">
              <h3 className="section-subheading">Description</h3>
              <p className="description-paragraph">
                {alert.description ||
                  "ET detected a potential Apache Struts Remote Code Execution (RCE) attempt from external source."}
              </p>
            </div>

            {/* Source & Destination Side-by-Side Cards */}
            <div className="endpoints-pair-grid">
              {/* Source Box */}
              <div className="endpoint-detail-box">
                <h4 className="endpoint-box-title">Source</h4>
                <div className="endpoint-data-list">
                  <div className="endpoint-data-row">
                    <span className="endpoint-field-name">IP Address</span>
                    <span className="endpoint-field-value mono-text">
                      {alert.source_ip || "10.0.0.5"}
                    </span>
                  </div>
                  <div className="endpoint-data-row">
                    <span className="endpoint-field-name">Port</span>
                    <span className="endpoint-field-value">
                      {alert.source_port ?? 52344}
                    </span>
                  </div>
                  <div className="endpoint-data-row">
                    <span className="endpoint-field-name">Country</span>
                    <span className="endpoint-field-value">
                      {alert.source_country || "United States"}
                    </span>
                  </div>
                  <div className="endpoint-data-row">
                    <span className="endpoint-field-name">ASN</span>
                    <span className="endpoint-field-value">
                      {alert.source_asn || "AS12345"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Destination Box */}
              <div className="endpoint-detail-box">
                <h4 className="endpoint-box-title">Destination</h4>
                <div className="endpoint-data-list">
                  <div className="endpoint-data-row">
                    <span className="endpoint-field-name">IP Address</span>
                    <span className="endpoint-field-value mono-text">
                      {alert.destination_ip || "192.168.1.10"}
                    </span>
                  </div>
                  <div className="endpoint-data-row">
                    <span className="endpoint-field-name">Port</span>
                    <span className="endpoint-field-value">
                      {alert.destination_port ?? 80}
                    </span>
                  </div>
                  <div className="endpoint-data-row">
                    <span className="endpoint-field-name">Country</span>
                    <span className="endpoint-field-value">
                      {alert.destination_country || "Private"}
                    </span>
                  </div>
                  <div className="endpoint-data-row">
                    <span className="endpoint-field-name">ASN</span>
                    <span className="endpoint-field-value">
                      {alert.destination_asn || "AS64512"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Packet Info (Snippet) Code Container */}
            <div className="alert-section-block packet-section">
              <h3 className="section-subheading">Packet Info (Snippet)</h3>
              <div className="packet-snippet-code-box">
                <pre>
                  {alert.packet_snippet ||
                    `GET /%SC%2e%SC%2e/%SC%2e%SC%2e/%SC%2e%SC%2e/etc/passwd HTTP/1.1\nHost: 192.168.1.10\nUser-Agent: curl/7.68.0`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Section: Notes & Update Status Button */}
        <div className="alert-notes-footer-section">
          <div className="notes-header-row">
            <h3 className="section-subheading">Notes</h3>
            {notesText.trim() && (
              <button
                className="save-notes-quick-btn"
                onClick={handleSaveNotes}
                disabled={isSaving}
              >
                <Save size={13} />
                <span>Save Notes</span>
              </button>
            )}
          </div>

          <div className="notes-input-area">
            <textarea
              className="notes-textarea"
              placeholder="Add notes about this alert..."
              rows={3}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
            />
          </div>

          <div className="notes-action-row">
            <div className="status-dropdown-container">
              <button
                className="update-status-primary-btn"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                disabled={isSaving}
              >
                <span>{isSaving ? "Updating..." : "Update Status"}</span>
                <ChevronDown size={15} className="dropdown-caret" />
              </button>

              {statusDropdownOpen && (
                <div className="status-menu-popover">
                  {["Open", "In Progress", "Closed", "False Positive"].map((option) => (
                    <button
                      key={option}
                      className={`status-menu-option ${currentStatus === option ? "selected" : ""}`}
                      onClick={() => handleSelectStatus(option)}
                    >
                      <span className={`status-pill ${getStatusBadgeClass(option)}`}>
                        {option}
                      </span>
                      {currentStatus === option && <Check size={14} className="check-icon" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
