import { useState } from "react";
import { useAuth } from "../context/useAuth";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import "./App.css";

function App() {
  const { auth, logout } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (auth) {
    return (
      <div className="app-container">
        <div className="auth-card">
          <h1>Welcome</h1>
          <p><strong>Email:</strong> {auth.email}</p>
          <p><strong>Role:</strong> {auth.role}</p>
          <p><strong>Status:</strong> {auth.status}</p>

          <button onClick={logout}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {showRegister ? <RegisterPage /> : <LoginPage />}

      <button
        className="switch-button"
        onClick={() => setShowRegister(!showRegister)}
      >
        {showRegister
          ? "Already have an account? Login"
          : "Need an account? Register"}
      </button>
    </div>
  );
}

export default App;