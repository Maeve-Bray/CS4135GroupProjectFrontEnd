import { useState } from "react";
import { useAuth } from "../context/useAuth";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import BookSession from "./BookingSession";
import StudentBookings from "./StudentBookings";
import TutorBookings from "./TutorBookings";
import TutorSchedule from "./TutorSchedule";
import HomePage from "./Homepage";
import AdminDashboard from "./AdminDashboard";
import "./App.css";

function App() {
  const { auth, logout } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");

  if (auth) {
    const userId = auth.userId ?? 1;

    if (auth.role === "ADMIN") {
      return (
        <div className="app-shell">
          <AdminDashboard logout={logout} />
        </div>
      );
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
        </div>

        <div className="logout-row">
          <button onClick={logout}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {showRegister ? <RegisterPage /> : <LoginPage />}

      <button
        className="switch-button"
        onClick={() => setShowRegister(!showRegister)}
      >
        {showRegister
          ? "Already have an account? Login"
          : "Need an account? Register"}
      </button>
    </div>
  );
}

export default App;