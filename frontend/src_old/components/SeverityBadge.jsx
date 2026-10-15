function SeverityBadge({ severity }) {
  const level = Number(severity);

  let label = "Unknown";
  let className = "unknown";

  if (level === 1) {
    label = "Critical";
    className = "critical";
  } else if (level === 2) {
    label = "High";
    className = "high";
  } else if (level === 3) {
    label = "Medium";
    className = "medium";
  } else if (level === 4) {
    label = "Low";
    className = "low";
  }

  return <span className={`severity-badge ${className}`}>{label}</span>;
}

export default SeverityBadge;