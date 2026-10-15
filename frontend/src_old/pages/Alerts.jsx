import { useEffect, useState } from "react";
import { getAlerts } from "../services/api";
import AlertTable from "../components/AlertTable";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAlerts = async () => {
    try {
      setError("");
      const data = await getAlerts();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load Suricata alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>Security Alerts</h2>
          <p>Live alerts received from the Suricata detection engine.</p>
        </div>
        <div className="system-pill">
          <span className="online-dot" />
          {alerts.length} Alerts
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="dashboard-card alerts-card">
        <div className="card-heading">
          <div>
            <h3>Detected Threats</h3>
            <span>Automatically refreshed every 15 seconds</span>
          </div>
          <span className="alert-count">
            {loading ? "Loading..." : `${alerts.length} alerts`}
          </span>
        </div>

        {!loading && <AlertTable alerts={alerts} />}

        {loading && (
          <div className="page-loading">
            <div className="loading-spinner" />
            Loading alerts...
          </div>
        )}
      </div>
    </div>
  );
}

export default Alerts;
