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
    <main className="log-in">
      <section className="log-in-modal" aria-label="Register form card">
        <p className="p">Enter your details to register for</p>
        <h1 className="text-wrapper">ShareCraft</h1>

        <form className="log-in-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="email" className="div">
              Email:
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
              Password:
            </label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="JaneDoe123"
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
                Admin Code:
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
              <span className="text-wrapper-6">register</span>
            </button>
          </div>
        </form>

        {error && <p className="error-text">{error}</p>}

        {emailExists && (
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
        )}
      </section>
    </main>
  );
}