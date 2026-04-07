import { useAuth } from "../context/useAuth";

function AdminDashboard({ logout }) {
  const { auth } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="hero-card admin-hero">
        <h1>Admin Dashboard</h1>
        <p>
          Welcome, <strong>{auth.email}</strong>
        </p>
        <p>
          Role: <strong>{auth.role}</strong> | Status: <strong>{auth.status}</strong>
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Manage Users</h2>
          <p>
            View users, update roles, and manage account access across the platform.
          </p>
        </div>

        <div className="dashboard-card">
          <h2>Review Reports</h2>
          <p>
            Inspect reported issues and review flagged activity submitted by users.
          </p>
        </div>

        <div className="dashboard-card">
          <h2>Monitor Platform Activity</h2>
          <p>
            Keep track of registrations, sessions, and general platform usage.
          </p>
        </div>

        <div className="dashboard-card">
          <h2>View All Bookings</h2>
          <p>
            Access and monitor all booking activity taking place on the system.
          </p>
        </div>
      </div>

      <div className="logout-row">
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

export default AdminDashboard;
