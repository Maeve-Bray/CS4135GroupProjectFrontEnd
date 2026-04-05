import { useState } from "react";
import { AuthContext } from "./AuthContext";

function parseStoredUserId(raw) {
  if (raw == null || raw === "" || raw === "undefined") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** Recover userId from JWT payload when the API omits it in the JSON body. */
function parseUserIdFromJwt(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(padded));
    const id = payload.userId;
    if (id == null || id === "") return null;
    const n = typeof id === "number" ? id : Number(id);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function normalizeAuthPayload(data) {
  const userId = data.userId ?? data.id ?? data.user_id ?? null;
  const numericId =
    userId != null && userId !== "" ? Number(userId) : null;
  return {
    token: data.token,
    email: data.email,
    role: data.role,
    status: data.status,
    userId: Number.isFinite(numericId) ? numericId : null,
  };
}

function resolveSessionUserId(session) {
  if (session.userId != null) return session;
  const fromJwt = parseUserIdFromJwt(session.token);
  if (fromJwt == null) return session;
  return { ...session, userId: fromJwt };
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    const status = localStorage.getItem("status");
    let userId = parseStoredUserId(localStorage.getItem("userId"));
    if (token && userId == null) {
      userId = parseUserIdFromJwt(token);
      if (userId != null) {
        localStorage.setItem("userId", String(userId));
      }
    }

    return token ? { token, email, role, status, userId } : null;
  });

  const login = (data) => {
    const session = resolveSessionUserId(normalizeAuthPayload(data));

    localStorage.setItem("token", session.token);
    localStorage.setItem("email", session.email);
    localStorage.setItem("role", session.role);
    localStorage.setItem("status", session.status);
    if (session.userId != null) {
      localStorage.setItem("userId", String(session.userId));
    } else {
      localStorage.removeItem("userId");
    }

    setAuth(session);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("status");
    localStorage.removeItem("userId");

    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}