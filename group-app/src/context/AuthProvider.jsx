import { useState } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {

  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    const status = localStorage.getItem("status");
    const userId = localStorage.getItem("userId");

    return token ? { token, email, role, status, userId } : null;
  });

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("email", data.email);
    localStorage.setItem("role", data.role);
    localStorage.setItem("status", data.status);
    localStorage.setItem("userId",data.id);

    setAuth(data);
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