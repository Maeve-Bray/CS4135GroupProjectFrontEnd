import { useState } from "react";
import { useAuth } from "../context/useAuth";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import BookSession from "./BookingSession";
import StudentBookings from "./StudentBookings";
import TutorBookings from "./TutorBookings";
import TutorSchedule from "./TutorSchedule";
import TutorProfile from "./TutorProfile";
import HomePage from "./HomePage";
import AdminDashboard from "./AdminDashboard";

import "./App.css";

function App() {
  const { auth, logout } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");

  if (auth) {
    const userId = auth.userId;
    const needsUserId = auth.role === "STUDENT" || auth.role === "TUTOR";
    if (needsUserId && (userId == null || !Number.isFinite(userId))) {
      return (
        <div className="app-shell">
          <div className="content-section">
            <p className="error-text">
              Your session does not include your account ID. Log out and log in
              again (or re-register). Saving your profile or booking as another
              user was prevented.
            </p>
            <button type="button" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      );
    }

    if (auth.role === "ADMIN") {
      return <AdminDashboard logout={logout} />;
    }

    return (
      <div className="app-shell">
        <HomePage setCurrentPage={setCurrentPage} />

        <div className="content-section">
          {auth.role === "STUDENT" && currentPage === "book" && (
            <BookSession studentId={userId} />
          )}

          {auth.role === "STUDENT" && currentPage === "studentBookings" && (
            <StudentBookings studentId={userId} />
          )}

          {auth.role === "TUTOR" && currentPage === "tutorBookings" && (
            <TutorBookings tutorId={userId} />
          )}

          {auth.role === "TUTOR" && currentPage === "tutorSchedule" && (
            <TutorSchedule tutorId={userId} />
          )}
          
          {auth.role === "TUTOR" && currentPage === "tutorProfile" && (
            <TutorProfile tutorId={userId} />
          )}
        </div>

        <div className="logout-row">
          <button type="button" onClick={logout}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {showRegister ? (
  <RegisterPage onShowLogin={() => setShowRegister(false)} />
) : (
  <LoginPage onShowRegister={() => setShowRegister(true)} />
)}
    </div>
  );
}

export default App;