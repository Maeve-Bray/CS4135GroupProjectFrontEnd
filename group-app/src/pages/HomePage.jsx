import { useAuth } from "../context/useAuth";

function HomePage({ setCurrentPage }) {
  const { auth } = useAuth();

  return (
    <div className="dashboard-container">
      <div className={`hero-card ${auth.role === "STUDENT" ? "student-hero" : "tutor-hero"}`}>
        <h1>Welcome</h1>
        <p>
          Signed in as <strong>{auth.email}</strong>
        </p>
        <p>
          Role: <strong>{auth.role}</strong> | Status: <strong>{auth.status}</strong>
        </p>
      </div>

      <div className="dashboard-grid">
        {auth.role === "STUDENT" && (
          <>
            <div className="dashboard-card">
              <h2>Book a Session</h2>
              <p>
                Browse available tutors and create a new booking request.
              </p>
              <button onClick={() => setCurrentPage("book")}>
                Make Booking
              </button>
            </div>

            <div className="dashboard-card">
              <h2>My Bookings</h2>
              <p>
                View your current and previous bookings in one place.
              </p>
              <button onClick={() => setCurrentPage("studentBookings")}>
                View Bookings
              </button>
            </div>
          </>
        )}

        {auth.role === "TUTOR" && (
          <>
            <div className="dashboard-card">
              <h2>Booking Requests</h2>
              <p>
                Review incoming requests from students and manage approvals.
              </p>
              <button onClick={() => setCurrentPage("tutorBookings")}>
                View Requests
              </button>
            </div>

            <div className="dashboard-card">
              <h2>My Schedule</h2>
              <p>
                See your planned sessions and upcoming tutoring schedule.
              </p>
              <button onClick={() => setCurrentPage("tutorSchedule")}>
                View Schedule
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HomePage;