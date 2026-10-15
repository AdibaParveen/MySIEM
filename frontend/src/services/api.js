const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.detail || data?.error || `Request failed: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.warn(`API call ${path} failed, falling back to local state:`, error.message);
    throw error;
  }
}

export function getHealth() {
  return request("/api/health");
}

export function getStats() {
  return request("/api/stats");
}

export function getAlerts(params = {}) {
  const query = new URLSearchParams();
  if (params.severity) query.append("severity", params.severity);
  if (params.status) query.append("status", params.status);
  if (params.category) query.append("category", params.category);
  if (params.search) query.append("search", params.search);
  if (params.limit) query.append("limit", params.limit);

  const queryString = query.toString();
  return request(`/api/alerts${queryString ? `?${queryString}` : ""}`);
}

export function getAlertDetail(alertId) {
  return request(`/api/alerts/${encodeURIComponent(alertId)}`);
}

export function updateAlert(alertId, payload) {
  return request(`/api/alerts/${encodeURIComponent(alertId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function addAlertNote(alertId, note) {
  return request(`/api/alerts/${encodeURIComponent(alertId)}/notes`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
}

export function getCases() {
  return request("/api/cases");
}

export function createCase(payload) {
  return request("/api/cases", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAssets() {
  return request("/api/assets");
}

export function getUsers() {
  return request("/api/users");
}

export function addUser(payload) {
  return request("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getSettings() {
  return request("/api/settings");
}

export function updateSettings(payload) {
  return request("/api/settings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getRules() {
  return request("/api/rules");
}

export function toggleRule(ruleId) {
  return request(`/api/rules/${encodeURIComponent(ruleId)}/toggle`, {
    method: "POST",
  });
}

export function testConnection(payload) {
  return request("/api/test-connection", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAnomalies() {
  return request("/api/anomalies");
}

export function runAnomalyDetection() {
  return request("/api/anomalies/run", {
    method: "POST",
  });
}

export function sendTestEmail(recipient) {
  return request("/api/notifications/test-email", {
    method: "POST",
    body: JSON.stringify({ recipient }),
  });
}

export function getPerformanceReport() {
  return request("/api/performance");
}

export function requestOtp(email) {
  return request("/api/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function verifyOtp(email, otp) {
  return request("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export function sendTestSms(phone) {
  return request("/api/notifications/test-sms", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export function dispatchAlertNotification(payload) {
  return request("/api/notifications/dispatch", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function requestSmsOtp(phone) {
  return request("/api/sms/request-sms-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export function verifySmsOtp(phone, otp) {
  return request("/api/sms/verify-sms-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otp }),
  });
}

export function getNotificationConfig() {
  return request("/api/notifications/config");
}

export function updateNotificationConfig(payload) {
  return request("/api/notifications/config", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

