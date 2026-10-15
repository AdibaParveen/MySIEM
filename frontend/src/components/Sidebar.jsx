import React, { useState } from "react";
import {
  LayoutDashboard,
  Bell,
  Briefcase,
  Monitor,
  FileText,
  Users,
  Settings,
  Shield,
  ChevronDown,
  User,
  ShieldCheck,
  LogOut,
} from "lucide-react";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "cases", label: "Cases", icon: Briefcase },
  { id: "assets", label: "Assets", icon: Monitor },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "users", label: "Users", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
  activePage,
  onNavigate,
  isOpen,
  currentUser = { name: "Analyst", email: "admin@mysiem.local", role: "Senior SOC Analyst" },
  onLogout,
}) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <aside className={`siem-sidebar ${isOpen ? "open" : "collapsed"}`}>
      {/* Brand Header */}
      <div className="sidebar-brand" onClick={() => onNavigate("dashboard")}>
        <div className="brand-logo-icon">
          <Shield className="shield-icon" size={20} fill="#ffffff" stroke="#2563eb" />
        </div>
        {isOpen && <span className="brand-title">MySIEM</span>}
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
              title={!isOpen ? item.label : ""}
            >
              <Icon size={19} className="nav-icon" />
              {isOpen && <span className="nav-label">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Profile Card at Bottom */}
      <div className="sidebar-footer">
        <div
          className={`user-profile-card ${profileMenuOpen ? "active" : ""}`}
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
        >
          <div className="user-avatar">
            <span>{currentUser.name.charAt(0)}</span>
          </div>
          {isOpen && (
            <>
              <div className="user-info">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-email">{currentUser.email}</span>
              </div>
              <ChevronDown size={15} className={`chevron-icon ${profileMenuOpen ? "rotated" : ""}`} />
            </>
          )}
        </div>

        {/* Profile Dropdown Menu */}
        {profileMenuOpen && isOpen && (
          <div className="profile-dropdown-menu">
            <div className="profile-header">
              <span className="profile-role-badge">{currentUser.role}</span>
              <span className="profile-status-dot online">Online</span>
            </div>
            <div className="profile-divider" />
            <button
              className="profile-menu-item"
              onClick={() => {
                setProfileMenuOpen(false);
                onNavigate("users");
              }}
            >
              <User size={15} />
              <span>User Profile</span>
            </button>
            <button
              className="profile-menu-item"
              onClick={() => {
                setProfileMenuOpen(false);
                onNavigate("settings");
              }}
            >
              <ShieldCheck size={15} />
              <span>Security Settings</span>
            </button>
            <div className="profile-divider" />
            <button
              className="profile-menu-item logout"
              onClick={() => {
                setProfileMenuOpen(false);
                if (onLogout) onLogout();
              }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
