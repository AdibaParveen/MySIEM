function SecurityCharts({ alerts = [] }) {
  const severityCounts = {
    Critical: alerts.filter((a) => Number(a.severity) === 1).length,
    High: alerts.filter((a) => Number(a.severity) === 2).length,
    Medium: alerts.filter((a) => Number(a.severity) === 3).length,
    Low: alerts.filter((a) => Number(a.severity) === 4).length,
  };

  const max = Math.max(...Object.values(severityCounts), 1);

  return (
    <div className="severity-chart">
      {Object.entries(severityCounts).map(([label, value]) => (
        <div className="chart-row" key={label}>
          <div className="chart-label">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>

          <div className="bar-background">
            <div
              className={`bar-fill ${label.toLowerCase()}`}
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default SecurityCharts;