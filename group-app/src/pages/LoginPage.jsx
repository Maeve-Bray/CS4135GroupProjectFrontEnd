import { useState } from "react";
import { loginUser } from "../api/authAPI";
import { useAuth } from "../context/useAuth";
import "../styles/style.css";

export default function LoginPage({ onShowRegister }) {
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser(form);
      login(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="landing-page">
      <div className="landing-visual">
        <div className="landing-visual-content">
          <h1 className="landing-hero-title">Unlock your potential.</h1>
          <p className="landing-hero-subtitle">
            Join ShareCraft to connect with expert tutors and learn new skills
            every day.
          </p>
        </div>
        <div className="landing-floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
      </div>

      <section className="landing-form-side" aria-label="Login form card">
        <div className="landing-form-card">
          <h2 className="text-wrapper">Welcome back</h2>
          <p className="p">Enter your details to log in.</p>

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
                autoComplete="current-password"
                required
              />
            </div>

            <div className="group">
              <button type="submit" className="overlap-group">
                <span className="text-wrapper-6">Log in</span>
              </button>
            </div>
          </form>

          {error && <p className="error-text">{error}</p>}

          <p className="no-account-register">
            <span className="span">No account? </span>
            <button
              type="button"
              className="text-wrapper-5 switch-link"
              onClick={onShowRegister}
            >
              Register here
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}