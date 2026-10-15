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
      setError("Unable to load alerts from the SIEM backend.");
      console.error(err);
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
          <p>Alerts detected and reported by Suricata.</p>
        </div>

        <button className="refresh-button" onClick={loadAlerts}>
          ↻ Refresh
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="dashboard-card alerts-card">
        <div className="card-heading">
          <div>
            <h3>Detected Alerts</h3>
            <span>
              {loading ? "Loading..." : `${alerts.length} alerts received`}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="page-loading small">
            <div className="loading-spinner" />
            Loading alerts...
          </div>
        ) : (
          <AlertTable alerts={alerts} />
        )}
      </div>
    </div>
  );
}

export default Alerts;