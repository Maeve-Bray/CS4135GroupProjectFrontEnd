import { useState } from "react";
import { useAuth } from "../context/useAuth";
import ReportsPanel from "../components/ReportsPanel";
import BlockedContentPanel from "../components/BlockedContentPanel";
import ReportCharts from "../components/ReportCharts";

const NAV_ITEMS = [
  { key: "overview", label: "Overview",        icon: "📊" },
  { key: "reports",  label: "Reports",         icon: "🚩" },
  { key: "blocked",  label: "Blocked Content",  icon: "🚫" },
];

function AdminDashboard({ logout }) {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="admin-shell">

      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__avatar">
          <div className="admin-avatar-circle">
            {auth.email?.[0]?.toUpperCase() ?? "A"}
          </div>
          <span className="admin-sidebar__email">{auth.email}</span>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`admin-nav-item${activeTab === item.key ? " admin-nav-item--active" : ""}`}
              onClick={() => setActiveTab(item.key)}
            >
              <span className="admin-nav-item__icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button className="admin-sidebar__logout" onClick={logout}>
          Log out
        </button>
      </aside>

      {/* ── Main content ── */}
      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-header__title">ShareCraft</h1>
        </header>

        <div className="admin-content">
          {activeTab === "overview" && (
            <ReportCharts token={auth.token} />
          )}
          {activeTab === "reports" && (
            <ReportsPanel token={auth.token} adminId={auth.userId} />
          )}
          {activeTab === "blocked" && (
            <BlockedContentPanel token={auth.token} adminId={auth.userId} />
          )}
        </div>
      </main>

    </div>
  );
}

export default AdminDashboard;
