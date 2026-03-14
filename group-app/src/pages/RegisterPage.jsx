import { useState } from "react";
import { registerUser } from "../api/authAPI";
import { useAuth } from "../context/useAuth";

export default function RegisterPage() {
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "STUDENT",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await registerUser(form);
      login(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-card">
      <h2>Register</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="STUDENT">Student</option>
          <option value="TUTOR">Tutor</option>
        </select>

        <button type="submit">Register</button>
      </form>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}