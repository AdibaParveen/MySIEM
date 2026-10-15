function EventChart({ alerts = [] }) {
  const buckets = Array.from({ length: 12 }, (_, index) => ({
    label: `${index + 1}`,
    value: alerts.filter((alert) => {
      if (!alert.timestamp) return false;

      const minute = new Date(alert.timestamp).getMinutes();
      return minute % 12 === index;
    }).length,
  }));

  const max = Math.max(...buckets.map((item) => item.value), 1);

  return (
    <div className="event-chart">
      {buckets.map((bucket) => (
        <div className="event-column" key={bucket.label}>
          <div
            className="event-bar"
            style={{
              height: `${Math.max((bucket.value / max) * 100, 5)}%`,
            }}
          />

          <span>{bucket.label}</span>
        </div>
      ))}
    </div>
  );
}

export default EventChart;