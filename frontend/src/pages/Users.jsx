import React, { useState } from "react";
import {
  Users as UsersIcon,
  Plus,
  Search,
  Check,
  Shield,
  X,
  Mail,
} from "lucide-react";
import { addUser } from "../services/api";

export default function Users({ users = [], onUserAdded }) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("SOC Analyst");
  const [department, setDepartment] = useState("Security Operations");
  const [twoFactor, setTwoFactor] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  });

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await addUser({
        name,
        email,
        role,
        department,
        two_factor: twoFactor,
      });
      if (onUserAdded && res.user) {
        onUserAdded(res.user);
      }
      setModalOpen(false);
      setName("");
      setEmail("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="users-page-wrapper">
      <div className="alerts-page-header">
        <div>
          <h2>SOC Team & Users ({users.length})</h2>
          <p className="page-desc-subtext">
            Manage cybersecurity operators, analysts, and access policies.
          </p>
        </div>

        <button className="primary-pill-btn" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          <span>Add Analyst</span>
        </button>
      </div>

      <div className="alerts-filters-card">
        <div className="filters-upper-row">
          <div className="alerts-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search analysts by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="dashboard-card table-panel">
        <div className="table-responsive-container">
          <table className="siem-data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>2FA Status</th>
                <th>Last Active</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="user-table-cell">
                    <div className="avatar-circle">{u.name.charAt(0)}</div>
                    <div>
                      <strong>{u.name}</strong>
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td>{u.role}</td>
                  <td>{u.department}</td>
                  <td>
                    {u.two_factor ? (
                      <span className="badge-chip success">Enabled</span>
                    ) : (
                      <span className="badge-chip warning">Disabled</span>
                    )}
                  </td>
                  <td>{u.last_login || "Recently"}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        u.status === "Active"
                          ? "status-pill-closed"
                          : "status-pill-open"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-backdrop-overlay">
          <div className="modal-content-dialog">
            <div className="modal-dialog-header">
              <h3>Add SOC Analyst</h3>
              <button
                className="close-dialog-btn"
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="modal-form-body">
              <div className="form-field-group">
                <label className="field-label">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="text-input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-field-group">
                <label className="field-label">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@mysiem.local"
                  className="text-input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-two-cols">
                <div className="form-field-group">
                  <label className="field-label">Role</label>
                  <select
                    className="select-input-field"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="SOC Analyst">SOC Analyst</option>
                    <option value="Senior SOC Analyst">Senior SOC Analyst</option>
                    <option value="Threat Hunter">Threat Hunter</option>
                    <option value="Security Engineer & Admin">Security Engineer & Admin</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="field-label">Department</label>
                  <select
                    className="select-input-field"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="Security Operations">Security Operations</option>
                    <option value="Incident Response">Incident Response</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="secondary-outline-btn"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-changes-primary-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Analyst"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
