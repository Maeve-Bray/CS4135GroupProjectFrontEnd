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
    <main className="log-in">
      <section className="log-in-modal" aria-label="Login form card">
        <p className="p">Enter your details to log in to</p>
        <h1 className="text-wrapper">ShareCraft</h1>
        

        <form className="log-in-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="email" className="div">
              Email:
            </label>
            <div className="username-button" aria-hidden="true" />
            <input
              id="email"
              type="email"
              className="text-wrapper-3 input-field"
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
            <div className="password-button" aria-hidden="true" />
            <input
              id="password"
              type="password"
              className="text-wrapper-4 input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="JaneDoe123"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="group">
            <button type="submit" className="overlap-group">
              <span className="text-wrapper-6">sign in</span>
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
      </section>
    </main>
  );
}