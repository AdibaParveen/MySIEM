@'
import AlertRow from "./AlertRow";

function AlertTable({ alerts = [] }) {
  if (alerts.length === 0) {
    return (
      <div className="empty-state">
        <div>✓</div>
        <strong>No alerts detected</strong>
        <span>Suricata has not reported any alerts yet.</span>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="alert-table">
        <thead>
          <tr>
            <th>TIME</th>
            <th>SEVERITY</th>
            <th>MESSAGE</th>
            <th>SOURCE IP</th>
            <th>DESTINATION IP</th>
            <th>CATEGORY</th>
          </tr>
        </thead>

        <tbody>
          {alerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AlertTable;
'@ | Set-Content .\frontend\src\components\AlertTable.jsx -Encoding utf8