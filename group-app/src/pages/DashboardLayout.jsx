import { useState } from "react";
import { useAuth } from "../context/useAuth";
import "../styles/dashboard.css";

function DashboardLayout({ currentPage, setCurrentPage, logout, children }) {
  const { auth } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`portal-layout ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="portal-sidebar">
        

        <div className="sidebar-header">
          <button 
            type="button" 
            className="sidebar-menu-btn" 
            aria-label="Toggle menu"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>
          
          {!isCollapsed && (
            <div className="sidebar-avatar-container">
              <div className="sidebar-avatar-image">
                {(auth.email?.[0] || "U").toUpperCase()}
              </div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-link ${currentPage === "home" ? "active" : ""}`}
            onClick={() => setCurrentPage("home")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="sidebar-text">Home</span>
          </button>

          {auth.role === "STUDENT" && (
            <button
              type="button"
              className={`sidebar-link ${currentPage === "search" ? "active" : ""}`}
              onClick={() => setCurrentPage("search")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span className="sidebar-text">Search</span>
            </button>
          )}

          {auth.role === "TUTOR" && (
            <button
              type="button"
              className={`sidebar-link ${currentPage === "skills" ? "active" : ""}`}
              onClick={() => setCurrentPage("skills")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span className="sidebar-text">Skills</span>
            </button>
          )}

          <button
            type="button"
            className={`sidebar-link ${currentPage === "schedule" ? "active" : ""}`}
            onClick={() => setCurrentPage("schedule")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span className="sidebar-text">Schedule</span>
          </button>

          <button
            type="button"
            className={`sidebar-link ${currentPage === "messages" ? "active" : ""}`}
            onClick={() => setCurrentPage("messages")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span className="sidebar-text">Messages</span>
          </button>
        </nav>

        <button type="button" className="sidebar-logout" onClick={logout}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span className="sidebar-text">Log out</span>
        </button>
      </aside>

      <main className="portal-main">{children}</main>
    </div>
  );
}

export default DashboardLayout;