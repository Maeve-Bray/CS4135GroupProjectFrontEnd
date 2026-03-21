import { useState } from "react";
import { useAuth } from "../context/useAuth";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import BookSession from "./BookingSession";
import StudentBookings from "./StudentBookings";
import TutorBookings from "./TutorBookings";
import TutorSchedule from "./TutorSchedule";
import "./App.css";

function App() {
  const { auth, logout } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");

  if (auth) {
    const userId = auth.userId ?? 1;
   

    return (
      <div className="app-container">
        <div className="auth-card">
          <h1>Welcome</h1>
          <p><strong>Email:</strong> {auth.email}</p>
          <p><strong>Role:</strong> {auth.role}</p>
          <p><strong>Status:</strong> {auth.status}</p>

          <div style={{ marginTop: "20px", marginBottom: "20px" }}>
            {auth.role === "STUDENT" && (
              <>
                <button onClick={() => setCurrentPage("book")}>Book Session</button>
                <button onClick={() => setCurrentPage("studentBookings")} style={{ marginLeft: "10px" }}>
                  My Bookings
                </button>
              </>
            )}

            {auth.role === "TUTOR" && (
              <>
                <button onClick={() => setCurrentPage("tutorBookings")}>Booking Requests</button>
                <button onClick={() => setCurrentPage("tutorSchedule")} style={{ marginLeft: "10px" }}>
                  My Schedule
                </button>
              </>
            )}
          </div>

          <div style={{ marginTop: "20px" }}>
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

          <button onClick={logout} style={{ marginTop: "20px" }}>
            Logout
          </button>
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