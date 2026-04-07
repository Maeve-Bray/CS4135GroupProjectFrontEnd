const API_BASE = "http://localhost:8080/api/admin";

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data;
}

// --- Reports ---

export async function getReports(token, { status, contentType } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (contentType) params.set("contentType", contentType);
  const query = params.toString() ? `?${params}` : "";
  const res = await fetch(`${API_BASE}/reports${query}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function reviewReport(token, reportId, adminId, notes = "") {
  const params = new URLSearchParams({ adminId, notes });
  const res = await fetch(`${API_BASE}/reports/${reportId}/review?${params}`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function dismissReport(token, reportId, adminId, notes = "") {
  const params = new URLSearchParams({ adminId, notes });
  const res = await fetch(`${API_BASE}/reports/${reportId}/dismiss?${params}`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// --- Blocked Content ---

export async function blockContent(token, { contentType, contentId, adminId, reason = "" }) {
  const params = new URLSearchParams({ contentType, contentId, adminId, reason });
  const res = await fetch(`${API_BASE}/block?${params}`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function unblockContent(token, { contentType, contentId, adminId, reason = "" }) {
  const params = new URLSearchParams({ contentType, contentId, adminId, reason });
  const res = await fetch(`${API_BASE}/block?${params}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function getBlockedContent(token, contentType) {
  const params = contentType ? `?contentType=${contentType}` : "";
  const res = await fetch(`${API_BASE}/blocked${params}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}
