@'
import SeverityBadge from "./SeverityBadge";

function AlertRow({ alert }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return "—";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <tr>
      <td>{formatTime(alert.timestamp)}</td>

      <td>
        <SeverityBadge severity={alert.severity} />
      </td>

      <td className="alert-message">
        {alert.message || "Suricata alert"}
      </td>

      <td>{alert.source_ip || "—"}</td>

      <td>{alert.destination_ip || "—"}</td>

      <td>{alert.category || "—"}</td>
    </tr>
  );
}

export default AlertRow;
'@ | Set-Content .\frontend\src\components\AlertRow.jsx -Encoding utf8