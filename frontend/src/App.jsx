import React, { useEffect, useState } from "react";
import Sidebar, { NAV_ITEMS } from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import AlertDetails from "./pages/AlertDetails";
import Cases from "./pages/Cases";
import Assets from "./pages/Assets";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import {
  getAlerts,
  getStats,
  getHealth,
  getCases,
  getAssets,
  getUsers,
  updateAlert,
  addAlertNote,
} from "./services/api";
import "./App.css";

// Initial seed alerts for instantaneous render and offline fallback
const INITIAL_ALERTS = [
  {
    id: "66a8f3b9e7a1e",
    timestamp: "2025-08-06T10:42:15Z",
    display_time: "10:42:15",
    formatted_date: "6 Aug 2025 10:42:15",
    severity: 1,
    status: "Open",
    source_ip: "10.0.0.5",
    source_port: 52344,
    source_country: "United States",
    source_asn: "AS12345",
    destination_ip: "192.168.1.10",
    destination_port: 80,
    destination_country: "Private",
    destination_asn: "AS64512",
    attack: "SQL Injection Attempt",
    signature: "ET WEB_SERVER Apache Struts RCE",
    sensor: "suricata-sensor-01",
    category: "Web Attack",
    rule_id: 2010937,
    protocol: "HTTP",
    action: "Allowed",
    description: "ET detected a potential Apache Struts Remote Code Execution (RCE) attempt from external source.",
    packet_snippet: "GET /%SC%2e%SC%2e/%SC%2e%SC%2e/%SC%2e%SC%2e/etc/passwd HTTP/1.1\nHost: 192.168.1.10\nUser-Agent: curl/7.68.0",
    notes: "",
  },
  {
    id: "66a8f3b9e7a2f",
    timestamp: "2025-08-06T10:37:42Z",
    display_time: "10:37:42",
    formatted_date: "6 Aug 2025 10:37:42",
    severity: 2,
    status: "Open",
    source_ip: "192.168.1.20",
    source_port: 44120,
    source_country: "Internal",
    source_asn: "AS64512",
    destination_ip: "192.168.1.10",
    destination_port: 445,
    destination_country: "Private",
    destination_asn: "AS64512",
    attack: "Port Scan Detected",
    signature: "ET SCAN Nmap Scripting Engine",
    sensor: "suricata-sensor-02",
    category: "Scanning",
    rule_id: 2009582,
    protocol: "TCP",
    action: "Allowed",
    description: "Nmap Scripting Engine activity detected scanning multiple high-risk ports.",
    packet_snippet: "SYN packet sequence with custom TCP window size 1024, MSS 1460, Nmap probe signature",
    notes: "",
  },
  {
    id: "66a8f3b9e7a3a",
    timestamp: "2025-08-06T10:31:09Z",
    display_time: "10:31:09",
    formatted_date: "6 Aug 2025 10:31:09",
    severity: 3,
    status: "In Progress",
    source_ip: "8.8.8.8",
    source_port: 53,
    source_country: "United States",
    source_asn: "AS15169",
    destination_ip: "192.168.1.10",
    destination_port: 53211,
    destination_country: "Private",
    destination_asn: "AS64512",
    attack: "DNS Tunneling Detected",
    signature: "ET INFO DNS Tunneling",
    sensor: "suricata-sensor-01",
    category: "Malware",
    rule_id: 2024108,
    protocol: "UDP",
    action: "Allowed",
    description: "Anomalous high-entropy subdomains observed querying external resolver, potential C2 tunneling.",
    packet_snippet: "QUERY: 78617368636f6465313233.tunnel.exfil-domain.org A IN\nTTL: 60",
    notes: "Analyst checking DNS cache on workstation 192.168.1.10.",
  },
  {
    id: "66a8f3b9e7a4b",
    timestamp: "2025-08-06T10:22:11Z",
    display_time: "10:22:11",
    formatted_date: "6 Aug 2025 10:22:11",
    severity: 2,
    status: "Open",
    source_ip: "203.0.113.45",
    source_port: 59102,
    source_country: "Germany",
    source_asn: "AS48201",
    destination_ip: "192.168.1.15",
    destination_port: 22,
    destination_country: "Private",
    destination_asn: "AS64512",
    attack: "Brute Force Attempt",
    signature: "ET SSH Failed Login",
    sensor: "suricata-sensor-03",
    category: "Brute Force",
    rule_id: 2001219,
    protocol: "SSH",
    action: "Allowed",
    description: "Multiple failed authentication attempts detected against internal SSH bastion host.",
    packet_snippet: "SSH-2.0-OpenSSH_8.9p1\nFailed password for root from 203.0.113.45 port 59102 ssh2",
    notes: "",
  },
  {
    id: "66a8f3b9e7a5c",
    timestamp: "2025-08-06T10:15:33Z",
    display_time: "10:15:33",
    formatted_date: "6 Aug 2025 10:15:33",
    severity: 4,
    status: "Closed",
    source_ip: "172.16.0.2",
    source_port: 0,
    source_country: "Internal",
    source_asn: "AS64512",
    destination_ip: "192.168.1.10",
    destination_port: 0,
    destination_country: "Private",
    destination_asn: "AS64512",
    attack: "ICMP Flood",
    signature: "ET DOS ICMP PING Flood",
    sensor: "suricata-sensor-02",
    category: "Other",
    rule_id: 2000348,
    protocol: "ICMP",
    action: "Closed",
    description: "High volume of ICMP echo request packets exceeding normal rate threshold.",
    packet_snippet: "ICMP Echo Request type 8 code 0 ID=0x1a2b seq=0x0042 payload size 64 bytes",
    notes: "Verified as internal network health monitor automated probe. Closed as benign.",
  },
];

const INITIAL_CASES = [
  {
    id: "CASE-2025-001",
    title: "Apache Struts RCE Exploitation Attempt",
    severity: "Critical",
    status: "In Progress",
    assignee: "Analyst",
    created_at: "2025-08-06 10:45:00",
    alerts_count: 3,
    summary: "Attacker IP 10.0.0.5 attempted directory traversal and OGNL injection targeting webserver 192.168.1.10.",
    artifacts: ["10.0.0.5", "192.168.1.10", "CVE-2017-5638"],
  },
  {
    id: "CASE-2025-002",
    title: "Internal Network Nmap Port Sweep",
    severity: "High",
    status: "Open",
    assignee: "Analyst",
    created_at: "2025-08-06 10:39:10",
    alerts_count: 8,
    summary: "Internal workstation 192.168.1.20 detected running port scans across internal subnet range.",
    artifacts: ["192.168.1.20", "Port 445", "Port 139"],
  },
];

const INITIAL_ASSETS = [
  {
    id: "ast-01",
    ip: "192.168.1.10",
    hostname: "prod-web-01",
    type: "Web Server",
    os: "Ubuntu Linux 22.04 LTS",
    risk_score: 85,
    alerts_count: 6,
    status: "Active",
    last_seen: "Just now",
    sensor: "suricata-sensor-01",
  },
  {
    id: "ast-02",
    ip: "192.168.1.15",
    hostname: "db-cluster-node1",
    type: "Database Server",
    os: "Debian Linux 12 / PostgreSQL",
    risk_score: 65,
    alerts_count: 3,
    status: "Active",
    last_seen: "1 min ago",
    sensor: "suricata-sensor-03",
  },
  {
    id: "ast-03",
    ip: "192.168.1.20",
    hostname: "gateway-edge-01",
    type: "Gateway / Router",
    os: "VyOS Enterprise Router",
    risk_score: 78,
    alerts_count: 5,
    status: "Active",
    last_seen: "Just now",
    sensor: "suricata-sensor-02",
  },
];

const INITIAL_USERS = [
  {
    id: "usr-01",
    name: "Analyst",
    email: "admin@mysiem.local",
    role: "Senior SOC Analyst",
    department: "Security Operations",
    status: "Active",
    last_login: "Today, 10:45 AM",
    two_factor: true,
  },
  {
    id: "usr-02",
    name: "Adiba",
    email: "adiba@mysiem.local",
    role: "Security Engineer & Admin",
    department: "Cybersecurity",
    status: "Active",
    last_login: "Today, 10:12 AM",
    two_factor: true,
  },
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem("mysiem_auth_token"));
  });
  const [currentUserEmail, setCurrentUserEmail] = useState(() => {
    return localStorage.getItem("mysiem_user_email") || "admin@mysiem.local";
  });
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState(INITIAL_CASES);
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [health, setHealth] = useState({ status: "healthy", elasticsearch: "offline" });
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [previousPage, setPreviousPage] = useState("dashboard");

  // Load backend data
  const loadData = async () => {
    try {
      const [alertRes, statRes, healthRes, caseRes, assetRes, userRes] =
        await Promise.allSettled([
          getAlerts({ limit: 50 }),
          getStats(),
          getHealth(),
          getCases(),
          getAssets(),
          getUsers(),
        ]);

      if (alertRes.status === "fulfilled" && alertRes.value?.alerts?.length > 0) {
        setAlerts(alertRes.value.alerts);
      }
      if (statRes.status === "fulfilled" && statRes.value) {
        setStats(statRes.value);
      }
      if (healthRes.status === "fulfilled" && healthRes.value) {
        setHealth(healthRes.value);
      }
      if (caseRes.status === "fulfilled" && caseRes.value?.cases?.length > 0) {
        setCases(caseRes.value.cases);
      }
      if (assetRes.status === "fulfilled" && assetRes.value?.assets?.length > 0) {
        setAssets(assetRes.value.assets);
      }
      if (userRes.status === "fulfilled" && userRes.value?.users?.length > 0) {
        setUsers(userRes.value.users);
      }
    } catch (err) {
      console.warn("Using offline SIEM data fallback:", err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 12000);
    return () => clearInterval(interval);
  }, []);

  // Open Alert Details (Image 2)
  const handleOpenAlert = (alert) => {
    setSelectedAlert(alert);
    setPreviousPage(activePage === "alert-details" ? "alerts" : activePage);
    setActivePage("alert-details");
  };

  // Back from Alert Details
  const handleBackFromAlertDetails = () => {
    setActivePage(previousPage || "alerts");
  };

  // Update Alert Status and Notes
  const handleUpdateAlertStatus = async (alertId, newStatus, newNotes) => {
    // Optimistic state update
    setAlerts((prevAlerts) =>
      prevAlerts.map((a) => {
        if (a.id === alertId) {
          return {
            ...a,
            status: newStatus,
            notes: newNotes !== undefined ? newNotes : a.notes,
          };
        }
        return a;
      })
    );

    if (selectedAlert && selectedAlert.id === alertId) {
      setSelectedAlert((prev) => ({
        ...prev,
        status: newStatus,
        notes: newNotes !== undefined ? newNotes : prev.notes,
      }));
    }

    try {
      await updateAlert(alertId, { status: newStatus, notes: newNotes });
    } catch (e) {
      console.warn("Backend update error:", e);
    }
  };

  // Add Alert Note
  const handleAddAlertNote = async (alertId, noteText) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((a) => {
        if (a.id === alertId) {
          const current = a.notes || "";
          const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const updated = current
            ? `${current}\n[${timestamp}] Analyst: ${noteText}`
            : `[${timestamp}] Analyst: ${noteText}`;
          return { ...a, notes: updated };
        }
        return a;
      })
    );

    if (selectedAlert && selectedAlert.id === alertId) {
      setSelectedAlert((prev) => {
        const current = prev.notes || "";
        const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const updated = current
          ? `${current}\n[${timestamp}] Analyst: ${noteText}`
          : `[${timestamp}] Analyst: ${noteText}`;
        return { ...prev, notes: updated };
      });
    }

    try {
      await addAlertNote(alertId, noteText);
    } catch (e) {
      console.warn("Backend add note error:", e);
    }
  };

  // Compute Page Title for Topbar
  const getPageTitle = () => {
    if (activePage === "alert-details") return "Alert Details";
    const found = NAV_ITEMS.find((n) => n.id === activePage);
    return found ? found.label : "Dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem("mysiem_auth_token");
    localStorage.removeItem("mysiem_user_email");
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = (userData) => {
    if (userData && userData.email) {
      setCurrentUserEmail(userData.email);
    }
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="siem-app-shell">
      {/* Left Sidebar */}
      <Sidebar
        activePage={activePage === "alert-details" ? "alerts" : activePage}
        onNavigate={(page) => {
          setSelectedAlert(null);
          setActivePage(page);
        }}
        isOpen={sidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Workspace Area */}
      <div className={`siem-workspace ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
        {/* Topbar */}
        <Topbar
          pageTitle={getPageTitle()}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          alerts={alerts}
          onOpenAlert={handleOpenAlert}
          onLogout={handleLogout}
        />

        {/* View Port Content */}
        <main className="siem-main-view">
          {activePage === "dashboard" && (
            <Dashboard
              alerts={alerts}
              stats={stats}
              onOpenAlert={handleOpenAlert}
              onNavigate={setActivePage}
            />
          )}

          {activePage === "alerts" && (
            <Alerts
              alerts={alerts}
              onOpenAlert={handleOpenAlert}
              onRefresh={loadData}
            />
          )}

          {activePage === "alert-details" && (
            <AlertDetails
              alert={selectedAlert}
              onBack={handleBackFromAlertDetails}
              onUpdateStatus={handleUpdateAlertStatus}
              onAddNote={handleAddAlertNote}
            />
          )}

          {activePage === "cases" && (
            <Cases
              cases={cases}
              onCaseCreated={(newCase) => setCases([newCase, ...cases])}
            />
          )}

          {activePage === "assets" && (
            <Assets assets={assets} onSelectAsset={handleOpenAlert} />
          )}

          {activePage === "reports" && (
            <Reports alerts={alerts} stats={stats} />
          )}

          {activePage === "users" && (
            <Users
              users={users}
              onUserAdded={(newUser) => setUsers([...users, newUser])}
            />
          )}

          {activePage === "settings" && (
            <Settings health={health} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
