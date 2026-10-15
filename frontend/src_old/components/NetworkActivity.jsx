function NetworkActivity({ alerts = [] }) {
  const sources = new Set(
    alerts
      .map((alert) => alert.source_ip)
      .filter(Boolean)
  );

  const destinations = new Set(
    alerts
      .map((alert) => alert.destination_ip)
      .filter(Boolean)
  );

  return (
    <div className="network-activity">
      <div className="network-number">
        <strong>{alerts.length}</strong>
        <span>security events</span>
      </div>

      <div className="network-stat">
        <span>Unique Sources</span>
        <strong>{sources.size}</strong>
      </div>

      <div className="network-stat">
        <span>Unique Destinations</span>
        <strong>{destinations.size}</strong>
      </div>

      <div className="network-stat">
        <span>Monitored Host</span>
        <strong>kali</strong>
      </div>
    </div>
  );
}

export default NetworkActivity;