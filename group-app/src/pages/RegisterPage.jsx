import { useState } from "react";
import { registerUser } from "../api/authAPI";
import { useAuth } from "../context/useAuth";
import "../styles/style.css";

export default function RegisterPage({ onShowLogin }) {
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "STUDENT",
    adminCode: "",
  });

  const [error, setError] = useState("");
  const [emailExists, setEmailExists] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEmailExists(false);

    try {
      const data = await registerUser(form);
      login(data);
    } catch (err) {
      const message = err.message || "Registration failed";
      setError(message);

      if (
        message.toLowerCase().includes("already exists") ||
        message.toLowerCase().includes("email exists") ||
        message.toLowerCase().includes("duplicate")
      ) {
        setEmailExists(true);
      }
    }
  };

  return (
    <main className="landing-page">
      <div className="landing-visual">
        <div className="landing-visual-content">
          <h1 className="landing-hero-title">Start your journey.</h1>
          <p className="landing-hero-subtitle">
            Create an account to discover new skills or share your expertise with others.
          </p>
        </div>
        <div className="landing-floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
      </div>

      <section className="landing-form-side" aria-label="Register form card">
        <div className="landing-form-card">
          <h2 className="text-wrapper">Create Account</h2>
          <p className="p">Enter your details to register.</p>

          <form className="log-in-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="email" className="div">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="JaneDoe@gmail.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="password" className="text-wrapper-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="field-group">
              <div className="select-wrapper">
                <select
                  id="role"
                  className="input-field select-field"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="STUDENT">Student</option>
                  <option value="TUTOR">Tutor</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <span className="select-arrow" aria-hidden="true">
                  ▼
                </span>
              </div>
            </div>

            {form.role === "ADMIN" && (
              <div className="field-group">
                <label htmlFor="adminCode" className="div">
                  Admin Code
                </label>
                <input
                  id="adminCode"
                  type="password"
                  className="input-field"
                  value={form.adminCode}
                  onChange={(e) => setForm({ ...form, adminCode: e.target.value })}
                  placeholder="Enter admin secret code"
                  required
                />
              </div>
            )}

            <div className="group">
              <button type="submit" className="overlap-group">
                <span className="text-wrapper-6">Register</span>
              </button>
            </div>
          </form>

          {error && <p className="error-text">{error}</p>}

          <p className="no-account-register">
            <span className="span">Already have an account? </span>
            <button
              type="button"
              className="text-wrapper-5 switch-link"
              onClick={onShowLogin}
            >
              Log in instead
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}