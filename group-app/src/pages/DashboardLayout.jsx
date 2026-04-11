import { useAuth } from "../context/useAuth";
import "../styles/dashboard.css";

function DashboardLayout({ currentPage, setCurrentPage, logout, children }) {
  const { auth } = useAuth();

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        

        <div className="sidebar-avatar">
          {(auth.email?.[0] || "U").toUpperCase()}
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-link ${currentPage === "home" ? "active" : ""}`}
            onClick={() => setCurrentPage("home")}
          >
            Home
          </button>

          {auth.role === "STUDENT" && (
            <button
              type="button"
              className={`sidebar-link ${currentPage === "search" ? "active" : ""}`}
              onClick={() => setCurrentPage("search")}
            >
              Search
            </button>
          )}

          <button
            type="button"
            className={`sidebar-link ${currentPage === "schedule" ? "active" : ""}`}
            onClick={() => setCurrentPage("schedule")}
          >
            Schedule
          </button>

         
        </nav>

        <button type="button" className="sidebar-logout" onClick={logout}>
          Log out
        </button>
      </aside>

      <main className="portal-main">{children}</main>
    </div>
  );
}

export default DashboardLayout;