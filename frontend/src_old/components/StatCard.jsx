function StatCard({
  title,
  value,
  subtitle,
  icon,
  danger = false,
}) {
  return (
    <div className={`stat-card ${danger ? "danger" : ""}`}>
      <div className="stat-icon">
        {icon}
      </div>

      <div className="stat-content">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{subtitle}</small>
      </div>
    </div>
  );
}

export default StatCard;