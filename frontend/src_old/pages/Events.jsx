function Events() {
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>Security Events</h2>
          <p>Monitor network events detected by the Suricata engine.</p>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-heading">
          <div>
            <h3>Event Activity</h3>
            <span>Suricata event monitoring</span>
          </div>
        </div>

        <div className="empty-state">
          <div>◉</div>
          <strong>Event monitoring ready</strong>
          <span>
            Live Suricata event visualization will appear here.
          </span>
        </div>
      </div>
    </div>
  );
}

export default Events;