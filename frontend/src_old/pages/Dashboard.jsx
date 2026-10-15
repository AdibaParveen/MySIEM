import { useEffect, useMemo, useState } from "react";
import { getAlerts, getHealth } from "../services/api";
import StatCard from "../components/StatCard";
import AlertTable from "../components/AlertTable";
import SecurityCharts from "../components/SecurityCharts";
import NetworkActivity from "../components/NetworkActivity";
import ThreatMap from "../components/ThreatMap";

function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setError("");

      const [alertData, healthData] = await Promise.all([
        getAlerts(),
        getHealth(),
      ]);

      setAlerts(alertData.alerts || []);
      setHealth(healthData);
    } catch (err) {
      setError("Unable to connect to the SIEM backend.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 15000);

    return () => clearInterval(interval);
  }, []);

  const statistics = useMemo(() => {
    const critical = alerts.filter(
      (alert) => Number(alert.severity) === 1
    ).length;

    const high = alerts.filter(
      (alert) => Number(alert.severity) === 2
    ).length;

    const medium = alerts.filter(
      (alert) => Number(alert.severity) === 3
    ).length;

    return {
      total: alerts.length,
      critical,
      high,
      medium,
    };
  }, [alerts]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        Loading security dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-heading">
        <div>
          <h2>Security Overview</h2>
          <p>Real-time visibility into your Suricata security events.</p>
        </div>

        <div className="system-pill">
          <span className={health?.status === "healthy" ? "online-dot" : "offline-dot"} />
          {health?.status === "healthy" ? "Backend Connected" : "Backend Offline"}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <section className="stats-grid">
        <StatCard
          title="Total Alerts"
          value={statistics.total}
          subtitle="Recent Suricata alerts"
          icon="!"
        />

        <StatCard
          title="Critical"
          value={statistics.critical}
          subtitle="Severity 1"
          icon="⚠"
          danger
        />

        <StatCard
          title="High Severity"
          value={statistics.high}
          subtitle="Severity 2"
          icon="↑"
        />

        <StatCard
          title="Medium Severity"
          value={statistics.medium}
          subtitle="Severity 3"
          icon="•"
        />
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card large">
          <div className="card-heading">
            <div>
              <h3>Threat Activity</h3>
              <span>Recent alert distribution</span>
            </div>
          </div>

          <SecurityCharts alerts={alerts} />
        </div>

        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <h3>Network Activity</h3>
              <span>Observed traffic</span>
            </div>
          </div>

          <NetworkActivity alerts={alerts} />
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card large">
          <div className="card-heading">
            <div>
              <h3>Geographic Threat Map</h3>
              <span>Source locations from observed events</span>
            </div>
          </div>

          <ThreatMap alerts={alerts} />
        </div>

        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <h3>System Status</h3>
              <span>SIEM pipeline health</span>
            </div>
          </div>

          <div className="pipeline-status">
            <PipelineItem name="Suricata" status="Active" />
            <PipelineItem name="Filebeat" status="Active" />
            <PipelineItem name="Elasticsearch" status="Connected" />
            <PipelineItem name="FastAPI" status="Connected" />
          </div>
        </div>
      </section>

      <section className="dashboard-card alerts-card">
        <div className="card-heading">
          <div>
            <h3>Recent Alerts</h3>
            <span>Latest events received from Suricata</span>
          </div>

          <span className="alert-count">{alerts.length} events</span>
        </div>

        <AlertTable alerts={alerts.slice(0, 10)} />
      </section>
    </div>
  );
}

function PipelineItem({ name, status }) {
  return (
    <div className="pipeline-item">
      <div>
        <span className="pipeline-dot" />
        <strong>{name}</strong>
      </div>
      <span>{status}</span>
    </div>
  );
}

export default Dashboard;