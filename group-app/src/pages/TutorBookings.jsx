import { useEffect, useState } from "react";
import {
  approveBooking,
  getTutorBookings,
  rejectBooking,
} from "../api/bookingAPI";
import MessagingPage from "./MessagingPage";

function ErrorModal({ message, onClose }) {
  if (!message) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>Something went wrong</h3>
        <p style={styles.message}>{message}</p>
        <button style={styles.button} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function TutorBookings({ tutorId }) {
  const [bookings, setBookings] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeChat, setActiveChat] = useState(null);

  const loadBookings = async () => {
    try {
      const response = await getTutorBookings(tutorId);
      setBookings(response.data);
    } catch (error) {
      console.error("Error loading tutor bookings", error);
      setErrorMessage("Unable to load bookings right now.");
    }
  };

  useEffect(() => {
    if (tutorId) {
      loadBookings();
    }
  }, [tutorId]);

  const handleApprove = async (id) => {
  try {
    await approveBooking(id);
    await loadBookings();
  } catch (error) {
    console.error("Error approving booking", error);
    setErrorMessage("Failed to approve booking. Please check this booking doesn't overlap an existing confirmed booking.");
  }
};

  const handleReject = async (id) => {
    try {
      await rejectBooking(id);
      await loadBookings();
    } catch (error) {
      console.error("Error rejecting booking", error);
      setErrorMessage("Failed to reject booking.");
    }
  };

  return (
    <div>
      <h2>Tutor Booking Requests</h2>

      <ErrorModal
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />

      {bookings.length === 0 ? (
        <p>No booking requests found.</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id}>
            <p><strong>Student: </strong> {booking.studentId}</p>
            <p><strong>Skill: </strong> {booking.skill}</p>
            <p><strong>Date: </strong> {booking.sessionDate}</p>
            <p><strong>Time: </strong> {booking.startTime} - {booking.endTime}</p>
            <p><strong>Status: </strong> {booking.status}</p>

            {booking.status === "PENDING" && (
              <>
                <button onClick={() => handleApprove(booking.id)}>Approve</button>
                <button onClick={() => handleReject(booking.id)} style={{marginLeft:"10px"}}>Reject</button>
              </>
            )}
            {booking.status === "CONFIRMED" && (
              <button
                onClick={() => setActiveChat(activeChat?.id === booking.id ? null : booking)}
                style={{marginLeft:"10px"}}
              >
                {activeChat?.id === booking.id ? "Close Chat" : "Message Student"}
              </button>
            )}
            {activeChat?.id === booking.id && (
              <MessagingPage booking={booking} currentUserId={tutorId} />
            )}
            <hr />
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  title: {
    marginBottom: "12px",
    color: "#d32f2f",
  },
  message: {
    marginBottom: "20px",
    color: "#333",
  },
  button: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#d32f2f",
    color: "#fff",
    cursor: "pointer",
  },
};