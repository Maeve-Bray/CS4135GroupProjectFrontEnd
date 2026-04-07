import { useState } from "react";
import { useAuth } from "../context/useAuth";
import ReportsPanel from "../components/ReportsPanel";
import BlockedContentPanel from "../components/BlockedContentPanel";

function AdminDashboard({ logout }) {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState("reports");

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

      <div className="admin-tabs">
        <button
          className={activeTab === "reports" ? "tab-active" : ""}
          onClick={() => setActiveTab("reports")}
        >
          Reports
        </button>
        <button
          className={activeTab === "blocked" ? "tab-active" : ""}
          onClick={() => setActiveTab("blocked")}
        >
          Blocked Content
        </button>
      </div>

      {activeTab === "reports" && (
        <ReportsPanel token={auth.token} adminId={auth.userId} />
      )}
      {activeTab === "blocked" && (
        <BlockedContentPanel token={auth.token} adminId={auth.userId} />
      )}

      <div className="logout-row">
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

export default AdminDashboard;
