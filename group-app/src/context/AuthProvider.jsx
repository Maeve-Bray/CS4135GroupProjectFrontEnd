import { useState } from "react";
import { AuthContext } from "./AuthContext";

function parseStoredUserId(raw) {
  if (raw == null || raw === "" || raw === "undefined") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function normalizeAuthPayload(data) {
  const userId = data.userId ?? data.id ?? null;
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

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    const status = localStorage.getItem("status");
    const userId = parseStoredUserId(localStorage.getItem("userId"));

    return token ? { token, email, role, status, userId } : null;
  });

  const login = (data) => {
     const session = normalizeAuthPayload(data);

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