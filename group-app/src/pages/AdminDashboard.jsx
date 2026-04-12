import { useState } from "react";
import { useAuth } from "../context/useAuth";
import ReportsPanel from "../components/ReportsPanel";
import BlockedContentPanel from "../components/BlockedContentPanel";
import ReportCharts from "../components/ReportCharts";
import "../styles/dashboard.css";

const NAV_ITEMS = [
  { key: "overview", label: "Overview" },
  { key: "reports",  label: "Reports" },
  { key: "blocked",  label: "Blocked Content" },
];

function AdminDashboard({ logout }) {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div className="sidebar-avatar">
          {(auth.email?.[0] || "A").toUpperCase()}
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`sidebar-link${activeTab === item.key ? " active" : ""}`}
              onClick={() => setActiveTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button type="button" className="sidebar-logout" onClick={logout}>
          Log out
        </button>
      </aside>

      <main className="portal-main">
        <h1 className="brand-title">ShareCraft</h1>

        {activeTab === "overview" && <ReportCharts token={auth.token} />}
        {activeTab === "reports"  && <ReportsPanel token={auth.token} adminId={auth.userId} />}
        {activeTab === "blocked"  && <BlockedContentPanel token={auth.token} adminId={auth.userId} />}
      </main>
    </div>
  );
}

export default AdminDashboard;
