import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone
from typing import Dict, Any, Optional

try:
    from dotenv import load_dotenv
    load_dotenv(override=True)
except ImportError:
    pass

class AlertNotifier:
    """
    Automated Email Notification Dispatcher for High and Critical Severity SIEM Alerts.
    Supports standard SMTP (TLS / SSL), Gmail, Outlook, or simulated local delivery.
    """
    def __init__(self):
        self.refresh_config()

    def refresh_config(self):
        try:
            from dotenv import load_dotenv
            load_dotenv(override=True)
        except Exception:
            pass
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_user = os.getenv("SMTP_USER", "").strip()
        self.smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
        self.sender_email = os.getenv("SENDER_EMAIL", self.smtp_user or "alerts@mysiem.local").strip()
        self.default_recipients = os.getenv("ALERT_RECIPIENTS", "soc-analyst@mysiem.local, admin@mysiem.local").strip()

    def format_email_body(self, alert: Dict[str, Any]) -> tuple[str, str]:
        """Generates both Plaintext and Rich HTML email templates for critical alerts."""
        severity_label = {1: "CRITICAL", 2: "HIGH", 3: "MEDIUM", 4: "LOW"}.get(
            int(alert.get("severity", 3)), "INFORMATIONAL"
        )
        timestamp = alert.get("formatted_date") or alert.get("timestamp") or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        
        # Plaintext version
        plain = f"""
=====================================================
[MySIEM SECURITY ALERT] - SEVERITY: {severity_label}
=====================================================
Alert ID:       {alert.get('id', 'N/A')}
Timestamp:      {timestamp}
Threat Name:    {alert.get('attack') or alert.get('signature', 'Suricata Network Threat')}
Signature:      {alert.get('signature', 'N/A')}
Category:       {alert.get('category', 'Network Intrusion')}
Rule ID:        {alert.get('rule_id', 'N/A')}
Protocol:       {alert.get('protocol', 'TCP')}
Sensor ID:      {alert.get('sensor', 'suricata-sensor-01')}

ATTRIBUTION:
  Source IP:      {alert.get('source_ip', 'Unknown')}:{alert.get('source_port', '')} ({alert.get('source_country', 'N/A')})
  Destination IP: {alert.get('destination_ip', 'Unknown')}:{alert.get('destination_port', '')}

PAYLOAD / PACKET SNIPPET:
{alert.get('packet_snippet', 'No payload snippet available')}

RECOMMENDED ACTION:
  Immediate isolation of target host {alert.get('destination_ip', '')} and firewall block on {alert.get('source_ip', '')}.
  Review case in MySIEM SOC Console: http://localhost:5173
=====================================================
Generated automatically by MySIEM Suricata Intelligence Platform
"""

        # HTML version
        html = f"""
<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fb; margin: 0; padding: 20px; }}
    .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden; }}
    .header {{ background: #dc2626; color: #ffffff; padding: 18px 24px; }}
    .header h2 {{ margin: 0; font-size: 18px; }}
    .header span {{ font-size: 12px; opacity: 0.9; }}
    .content {{ padding: 24px; color: #1e293b; }}
    .meta-table {{ width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }}
    .meta-table td {{ padding: 8px 0; border-bottom: 1px solid #f1f5f9; }}
    .meta-table td:first-child {{ color: #64748b; width: 140px; font-weight: 500; }}
    .meta-table td:last-child {{ font-weight: 600; color: #0f172a; }}
    .endpoint-grid {{ display: flex; gap: 12px; margin-bottom: 20px; }}
    .endpoint-card {{ flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 12px; }}
    .endpoint-card h4 {{ margin: 0 0 6px; font-size: 11px; text-transform: uppercase; color: #64748b; }}
    .code-box {{ background: #0f172a; color: #f8fafc; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 11px; overflow-x: auto; white-space: pre-wrap; }}
    .cta-btn {{ display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 13px; margin-top: 15px; }}
    .footer {{ background: #f8fafc; padding: 14px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🚨 MySIEM Security Alert: {severity_label}</h2>
      <span>Incident Time: {timestamp} • Sensor: {alert.get('sensor', 'suricata-sensor-01')}</span>
    </div>
    <div class="content">
      <h3 style="margin-top:0; color:#0f172a;">{alert.get('attack') or alert.get('signature', 'Critical Network Intrusion Detected')}</h3>
      <p style="font-size:13px; color:#475569; line-height:1.5;">{alert.get('description', 'Suricata IDS identified malicious traffic pattern matching active Emerging Threats signature.')}</p>
      
      <table class="meta-table">
        <tr><td>Alert ID</td><td><code>{alert.get('id', 'N/A')}</code></td></tr>
        <tr><td>Rule ID</td><td>{alert.get('rule_id', '2010937')}</td></tr>
        <tr><td>Category</td><td>{alert.get('category', 'Web Attack')}</td></tr>
        <tr><td>Protocol</td><td>{alert.get('protocol', 'HTTP')}</td></tr>
        <tr><td>Action</td><td>{alert.get('action', 'Alert / Allowed')}</td></tr>
      </table>

      <div class="endpoint-grid">
        <div class="endpoint-card">
          <h4>Source (Attacker)</h4>
          <div><strong>IP:</strong> {alert.get('source_ip', '10.0.0.5')}</div>
          <div><strong>Port:</strong> {alert.get('source_port', '52344')}</div>
          <div><strong>Country:</strong> {alert.get('source_country', 'United States')}</div>
        </div>
        <div class="endpoint-card">
          <h4>Destination (Target)</h4>
          <div><strong>IP:</strong> {alert.get('destination_ip', '192.168.1.10')}</div>
          <div><strong>Port:</strong> {alert.get('destination_port', '80')}</div>
          <div><strong>Network:</strong> Internal Asset</div>
        </div>
      </div>

      <div style="font-size:12px; font-weight:600; margin-bottom:6px; color:#334155;">Packet Info / Payload Snippet:</div>
      <div class="code-box">{alert.get('packet_snippet', 'GET /%SC%2e%SC%2e/etc/passwd HTTP/1.1')}</div>

      <center>
        <a href="http://localhost:5173" class="cta-btn">Open Alert in MySIEM Console</a>
      </center>
    </div>
    <div class="footer">
      MySIEM Automated Threat Response • Real-time Suricata Detection
    </div>
  </div>
</body>
</html>
"""
        return plain, html

    def send_alert_email(
        self,
        alert: Dict[str, Any],
        recipient_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Dispatches an email notification. If credentials are not configured,
        logs and validates the generated email structure (simulation mode).
        """
        self.refresh_config()
        recipients_str = recipient_override or self.default_recipients
        recipients = [r.strip() for r in recipients_str.split(",") if r.strip()]
        
        severity_label = {1: "CRITICAL", 2: "HIGH", 3: "MEDIUM", 4: "LOW"}.get(
            int(alert.get("severity", 3)), "INFORMATIONAL"
        )
        subject = f"[{severity_label} ALERT] {alert.get('attack') or alert.get('signature', 'Threat Detected')} - MySIEM"
        
        plain_body, html_body = self.format_email_body(alert)

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = self.sender_email
        msg["To"] = ", ".join(recipients)

        msg.attach(MIMEText(plain_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        # Check if actual SMTP credentials exist
        if self.smtp_user and self.smtp_password:
            try:
                server = smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=8)
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.sender_email, recipients, msg.as_string())
                server.quit()
                return {
                    "success": True,
                    "mode": "live_smtp",
                    "message": f"Alert email delivered to {', '.join(recipients)} via {self.smtp_host}",
                    "recipients": recipients,
                    "subject": subject,
                }
            except Exception as e:
                return {
                    "success": False,
                    "mode": "error",
                    "message": f"SMTP delivery failed: {str(e)}",
                    "recipients": recipients,
                }
        else:
            # Simulated delivery (standard for local SOC lab testing)
            log_entry = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "recipients": recipients,
                "subject": subject,
                "severity": severity_label,
                "alert_id": alert.get("id"),
                "status": "Delivered (Simulated Local Dispatch)",
            }
            return {
                "success": True,
                "mode": "simulated_local",
                "message": f"Simulated email notification dispatched to {', '.join(recipients)}",
                "log": log_entry,
                "subject": subject,
                "recipients": recipients,
            }

    def send_otp_email(self, recipient: str, otp: str) -> Dict[str, Any]:
        """Dispatches an authentic SOC verification OTP email."""
        self.refresh_config()
        subject = f"[MySIEM] 🔐 Your Login Verification Code: {otp}"
        
        plain = f"""MySIEM SOC Security Authentication
Your One-Time Password (OTP) verification code is: {otp}

This code will expire in 5 minutes.
If you did not request this login code, please notify your SOC security administrator immediately.

MySIEM Autonomous Security Operations Platform
"""
        html = f"""<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; margin: 0; padding: 24px; color: #f8fafc; }}
    .card {{ max-width: 480px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
    .badge {{ display: inline-block; background: #2563eb; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 16px; }}
    h2 {{ margin: 0 0 8px; font-size: 20px; color: #ffffff; }}
    p {{ color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 0 0 20px; }}
    .otp-box {{ background: #090d16; border: 2px dashed #3b82f6; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 20px; }}
    .otp-code {{ font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; font-family: monospace; }}
    .expiry {{ font-size: 12px; color: #64748b; margin-top: 6px; }}
    .footer {{ border-top: 1px solid #334155; padding-top: 16px; font-size: 11px; color: #64748b; text-align: center; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Zero-Trust Authentication</div>
    <h2>MySIEM Access Verification</h2>
    <p>A sign-in request was initiated for your Security Operations Center console account (<code>{recipient}</code>).</p>
    
    <div class="otp-box">
      <div class="otp-code">{otp}</div>
      <div class="expiry">Expires in 5 minutes • Single Use</div>
    </div>
    
    <p style="font-size: 12px; color: #64748b;">If you did not request this login code, someone may be attempting to access your SOC console. Please alert the incident response team.</p>
    
    <div class="footer">
      MySIEM Automated Threat Response • Enterprise Security
    </div>
  </div>
</body>
</html>"""

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = self.sender_email
        msg["To"] = recipient

        msg.attach(MIMEText(plain, "plain"))
        msg.attach(MIMEText(html, "html"))

        if self.smtp_user and self.smtp_password:
            try:
                server = smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=10)
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.sender_email, [recipient], msg.as_string())
                server.quit()
                print(f"[LIVE EMAIL DELIVERED] Successfully sent OTP email to {recipient} via {self.smtp_host}")
                return {
                    "success": True,
                    "mode": "live_smtp",
                    "message": f"Verification email delivered directly to {recipient} via {self.smtp_host}",
                    "recipient": recipient
                }
            except Exception as e:
                print(f"[LIVE EMAIL FAILED] Could not send via SMTP: {e}")
                return {
                    "success": False,
                    "mode": "error",
                    "message": f"SMTP Error: {str(e)}",
                    "otp": otp,
                    "recipient": recipient
                }
        else:
            print(f"\n==========================================")
            print(f"[SIMULATED EMAIL DISPATCH]")
            print(f"TO:      {recipient}")
            print(f"OTP:     {otp}")
            print(f"SUBJECT: {subject}")
            print(f"NOTE:    To receive real emails in your inbox, set SMTP_USER and SMTP_PASSWORD in backend/.env")
            print(f"==========================================\n")
            return {
                "success": True,
                "mode": "simulated_local",
                "message": f"Simulated delivery (No SMTP credentials configured in .env)",
                "otp": otp,
                "recipient": recipient
            }

notifier = AlertNotifier()
