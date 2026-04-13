function normalizeBaseUrl(raw) {
  const s = (raw || "").trim() || "http://localhost:8080";
  return s.replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);