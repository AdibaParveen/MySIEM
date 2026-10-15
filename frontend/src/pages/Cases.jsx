import React, { useState } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderOpen,
  X,
  FileCheck,
} from "lucide-react";
import { createCase } from "../services/api";

export default function Cases({ cases = [], onCaseCreated }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSeverity, setNewSeverity] = useState("Critical");
  const [newAssignee, setNewAssignee] = useState("Analyst");
  const [newSummary, setNewSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = cases.filter((c) => {
    if (filter !== "all" && c.status.toLowerCase() !== filter.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.summary && c.summary.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await createCase({
        title: newTitle,
        severity: newSeverity,
        assignee: newAssignee,
        summary: newSummary,
        artifacts: ["10.0.0.5", "192.168.1.10"],
      });
      if (onCaseCreated && result.case) {
        onCaseCreated(result.case);
      }
      setCreateModalOpen(false);
      setNewTitle("");
      setNewSummary("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cases-page-wrapper">
      {/* Page Header */}
      <div className="alerts-page-header">
        <div>
          <h2>Incident Response Cases</h2>
          <p className="page-desc-subtext">
            Track, investigate, and remediate security events escalated from Suricata alerts.
          </p>
        </div>

        <button
          className="primary-pill-btn"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus size={16} />
          <span>New Case</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="alerts-filters-card">
        <div className="filters-upper-row">
          <div className="alerts-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search cases by title, ID, or summary..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-pill-group">
            {["all", "open", "in progress", "closed"].map((st) => (
              <button
                key={st}
                className={`filter-pill-btn ${filter === st ? "active" : ""}`}
                onClick={() => setFilter(st)}
              >
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="cases-cards-grid">
        {filtered.map((item) => (
          <div key={item.id} className="case-card">
            <div className="case-card-header">
              <span className="case-id-badge">{item.id}</span>
              <span
                className={`pill-badge badge-${(item.severity || "medium").toLowerCase()}`}
              >
                {item.severity}
              </span>
            </div>

            <h3 className="case-card-title">{item.title}</h3>
            <p className="case-card-summary">{item.summary}</p>

            {item.artifacts && item.artifacts.length > 0 && (
              <div className="case-artifacts-row">
                {item.artifacts.map((art, idx) => (
                  <span key={idx} className="artifact-chip">
                    {art}
                  </span>
                ))}
              </div>
            )}

            <div className="case-card-footer">
              <div className="case-meta-group">
                <span className="meta-assignee">Assignee: {item.assignee}</span>
                <span className="meta-time">{item.created_at}</span>
              </div>
              <span
                className={`status-pill ${
                  item.status === "Closed"
                    ? "status-pill-closed"
                    : item.status === "In Progress"
                    ? "status-pill-progress"
                    : "status-pill-open"
                }`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Case Modal */}
      {createModalOpen && (
        <div className="modal-backdrop-overlay">
          <div className="modal-content-dialog">
            <div className="modal-dialog-header">
              <h3>Create Investigation Case</h3>
              <button
                className="close-dialog-btn"
                onClick={() => setCreateModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="modal-form-body">
              <div className="form-field-group">
                <label className="field-label">Case Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Web Server RCE Attempt Analysis"
                  className="text-input-field"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="form-two-cols">
                <div className="form-field-group">
                  <label className="field-label">Severity</label>
                  <select
                    className="select-input-field"
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="field-label">Assignee</label>
                  <select
                    className="select-input-field"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                  >
                    <option value="Analyst">Analyst (Current)</option>
                    <option value="Adiba">Adiba (Admin)</option>
                    <option value="Security Lead">Security Lead</option>
                  </select>
                </div>
              </div>

              <div className="form-field-group">
                <label className="field-label">Incident Summary</label>
                <textarea
                  className="text-input-field"
                  rows={3}
                  placeholder="Provide incident context, suspected threat actor, or affected assets..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                />
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="secondary-outline-btn"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-changes-primary-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
