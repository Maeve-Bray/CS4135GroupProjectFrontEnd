import { useState } from "react";
import { useAuth } from "../context/useAuth";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import BookSession from "./BookingSession";
import StudentBookings from "./StudentBookings";
import TutorBookings from "./TutorBookings";
import TutorSchedule from "./TutorSchedule";
import TutorProfile from "./TutorProfile";
import StudentProfile from "./StudentProfile";
import AdminDashboard from "./AdminDashboard";
import DashboardLayout from "./DashboardLayout";
import SearchPage from "./SearchPage";

import "./App.css";
import MessagingPage from "./MessagingPage";

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
     <DashboardLayout
  currentPage={currentPage}
  setCurrentPage={setCurrentPage}
  logout={logout}
>
  {currentPage === "home" && auth.role === "STUDENT" && (
  <StudentProfile
  />
)}
{auth.role === "STUDENT" && currentPage === "search" && (
  <SearchPage studentId={userId} />
)}
  {currentPage === "home" && auth.role === "TUTOR" && (
    <TutorProfile tutorId={userId} />
  )}

  {currentPage === "schedule" &&auth.role === "TUTOR" && (
    <TutorBookings tutorId={userId} />
  )}

  {currentPage === "schedule" &&auth.role === "STUDENT" && (
    <StudentBookings studentId={userId} />
  )}

  {currentPage === "messages" && (
    <MessagingPage userId={userId} userRole={auth.role} />
  )}

  {auth.role === "STUDENT" && currentPage === "book" && (
    <BookSession studentId={userId} />
  )}

  {auth.role === "TUTOR" && currentPage === "tutorBookings" && (
    <TutorBookings tutorId={userId} />
  )}
</DashboardLayout>
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