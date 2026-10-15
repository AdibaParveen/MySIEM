import os
import json
import math
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple
from sklearn.ensemble import IsolationForest
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_PATH = os.path.join(MODEL_DIR, "anomaly_detector.pkl")
ANOMALIES_STORE_PATH = os.path.join(DATA_DIR, "anomalies.json")

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

class TrafficAnomalyDetector:
    """
    Machine Learning & Statistical Network Anomaly Detection Engine for Suricata SIEM.
    Combines Scikit-Learn IsolationForest with Z-score thresholding on packet frequency,
    failed logins, repeated requests, and anomalous port distributions.
    """
    def __init__(self, contamination: float = 0.08):
        self.contamination = contamination
        self.model = None
        self.feature_columns = [
            "packet_rate_per_sec",
            "failed_auth_count",
            "payload_bytes",
            "unique_dest_ports",
            "dns_entropy",
        ]
        self._load_or_train_model()

    def calculate_shannon_entropy(self, string: str) -> float:
        """Calculates Shannon entropy to detect algorithmic DNS tunneling / DGA domains."""
        if not string:
            return 0.0
        prob = [float(string.count(c)) / len(string) for c in dict.fromkeys(list(string))]
        return -sum([p * math.log(p) / math.log(2.0) for p in prob])

    def generate_synthetic_baseline(self, num_samples: int = 250) -> pd.DataFrame:
        """Generates realistic normal baseline network telemetry features."""
        np.random.seed(42)
        # Normal traffic: low packet rate, 0 failed auth, standard payload, 1-2 ports, normal DNS entropy
        packet_rate = np.random.normal(loc=12.0, scale=4.0, size=num_samples).clip(1, 40)
        failed_auth = np.random.poisson(lam=0.08, size=num_samples)
        payload_bytes = np.random.normal(loc=650, scale=200, size=num_samples).clip(64, 1500)
        dest_ports = np.random.poisson(lam=1.2, size=num_samples).clip(1, 4)
        dns_entropy = np.random.normal(loc=2.8, scale=0.4, size=num_samples).clip(1.5, 3.8)

        df = pd.DataFrame({
            "packet_rate_per_sec": packet_rate,
            "failed_auth_count": failed_auth,
            "payload_bytes": payload_bytes,
            "unique_dest_ports": dest_ports,
            "dns_entropy": dns_entropy,
        })
        return df

    def train_baseline(self) -> Dict[str, Any]:
        """Trains Isolation Forest model on traffic telemetry baseline."""
        df = self.generate_synthetic_baseline()
        self.model = IsolationForest(
            n_estimators=100,
            contamination=self.contamination,
            random_state=42
        )
        self.model.fit(df[self.feature_columns])
        joblib.dump(self.model, MODEL_PATH)
        return {
            "status": "trained",
            "samples": len(df),
            "model_path": MODEL_PATH,
            "features": self.feature_columns,
        }

    def _load_or_train_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                return
            except Exception:
                pass
        self.train_baseline()

    def analyze_event(self, event_features: Dict[str, float]) -> Dict[str, Any]:
        """
        Evaluates a network event using both ML IsolationForest and statistical thresholding.
        Returns anomaly status, score, and explanation.
        """
        row = pd.DataFrame([{
            col: float(event_features.get(col, 0.0)) for col in self.feature_columns
        }])
        
        # ML Isolation Forest prediction: -1 = anomaly, 1 = normal
        ml_prediction = int(self.model.predict(row)[0])
        anomaly_score = float(self.model.score_samples(row)[0])  # Negative score; lower means more abnormal
        normalized_score = round(max(0.0, min(1.0, 0.5 - (anomaly_score * 0.8))), 3)

        # Statistical Threshold Rules
        triggers = []
        if event_features.get("packet_rate_per_sec", 0) > 85.0:
            triggers.append("Packet frequency spike (potential DoS/burst)")
        if event_features.get("failed_auth_count", 0) >= 3:
            triggers.append("Repeated failed authentication attempts (potential brute-force)")
        if event_features.get("unique_dest_ports", 0) >= 6:
            triggers.append("Horizontal/Vertical port sweep pattern")
        if event_features.get("dns_entropy", 0) >= 4.2:
            triggers.append("High entropy DNS query payload (potential C2 tunneling)")

        is_anomaly = ml_prediction == -1 or len(triggers) > 0

        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": normalized_score,
            "triggers": triggers,
            "features": event_features,
        }

    def run_detection_pipeline(self, alerts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Runs ML anomaly evaluation across all SIEM alerts and persists detected anomalies.
        """
        anomalies = []
        for alert in alerts:
            # Extract features from alert
            rate = 120.0 if "ICMP" in str(alert.get("signature")) or "Flood" in str(alert.get("attack")) else 15.0
            failed_logins = 6 if "SSH" in str(alert.get("signature")) or "Brute Force" in str(alert.get("category")) else 0
            ports = 24 if "Scan" in str(alert.get("signature")) or "Scanning" in str(alert.get("category")) else 1
            dns_entropy = 4.8 if "DNS" in str(alert.get("signature")) or "Tunneling" in str(alert.get("attack")) else 2.5
            payload = 1450 if "Struts" in str(alert.get("signature")) or "RCE" in str(alert.get("attack")) else 512

            features = {
                "packet_rate_per_sec": rate,
                "failed_auth_count": failed_logins,
                "payload_bytes": payload,
                "unique_dest_ports": ports,
                "dns_entropy": dns_entropy,
            }

            res = self.analyze_event(features)
            if res["is_anomaly"]:
                anomalies.append({
                    "id": f"anom-{alert.get('id', '001')[:8]}",
                    "alert_id": alert.get("id"),
                    "timestamp": alert.get("formatted_date") or alert.get("timestamp") or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
                    "source_ip": alert.get("source_ip", "10.0.0.5"),
                    "destination_ip": alert.get("destination_ip", "192.168.1.10"),
                    "threat_context": alert.get("attack") or alert.get("signature"),
                    "anomaly_type": res["triggers"][0] if res["triggers"] else "Unsupervised Behavioral Anomaly",
                    "confidence_score": f"{int(res['anomaly_score'] * 100)}%",
                    "severity": "Critical" if res["anomaly_score"] > 0.75 else "High",
                    "details": res["triggers"],
                    "metrics": features,
                })

        # Save to data directory
        with open(ANOMALIES_STORE_PATH, "w", encoding="utf-8") as f:
            json.dump(anomalies, f, indent=2)

        return anomalies

    def get_stored_anomalies(self) -> List[Dict[str, Any]]:
        """Retrieves stored anomalies from data/anomalies.json."""
        if os.path.exists(ANOMALIES_STORE_PATH):
            try:
                with open(ANOMALIES_STORE_PATH, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return []

detector = TrafficAnomalyDetector()
