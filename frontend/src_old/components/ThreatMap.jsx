function ThreatMap({ alerts = [] }) {
  const sources = [
    ...new Set(
      alerts
        .map((alert) => alert.source_ip)
        .filter(Boolean)
    ),
  ];

  return (
    <div className="threat-map">
      <div className="map-grid">
        <div className="map-ring ring-one" />
        <div className="map-ring ring-two" />
        <div className="map-ring ring-three" />

        <div className="map-center">
          <span>LIVE</span>
          <strong>{alerts.length}</strong>
          <small>events</small>
        </div>

        {sources.slice(0, 8).map((ip, index) => (
          <div
            className="map-point"
            key={ip}
            style={{
              left: `${15 + ((index * 19) % 70)}%`,
              top: `${20 + ((index * 31) % 55)}%`,
            }}
            title={ip}
          />
        ))}
      </div>

      <div className="map-footer">
        <span>Observed source addresses</span>
        <strong>{sources.length}</strong>
      </div>
    </div>
  );
}

export default ThreatMap;