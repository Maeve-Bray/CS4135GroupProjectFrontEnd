import { useEffect, useState } from "react";
import { getStudentBookings, getTutorBookings } from "../api/bookingAPI";
import { getMyProfile } from "../api/authAPI";
import MessagingPage from "./MessagingPage";
import "../styles/messageInbox.css";

function resolveName(user, defaultName) {
  return (
    user?.name ||
    user?.fullName ||
    user?.email?.split("@")[0] ||
    defaultName
  );
}

export default function MessageInbox({ userId, userRole }) {
  const [bookings, setBookings] = useState([]);
  const [partnerNames, setPartnerNames] = useState({});
  const [activeBooking, setActiveBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const isStudent = userRole === "STUDENT";

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      try {
        const response = isStudent
          ? await getStudentBookings(userId)
          : await getTutorBookings(userId);

        // Only keep CONFIRMED or COMPLETED bookings
        const validBookings = (response.data || []).filter(
          (b) => b.status === "CONFIRMED" || b.status === "COMPLETED"
        );
        
        // Sort by most recent start time or session date
        validBookings.sort((a, b) => {
          const dateA = new Date(`${a.sessionDate}T${a.startTime || "00:00"}`);
          const dateB = new Date(`${b.sessionDate}T${b.startTime || "00:00"}`);
          return dateB - dateA; // descending
        });

        setBookings(validBookings);
      } catch (error) {
        console.error("Error loading bookings for messages:", error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchBookings();
    }
  }, [userId, isStudent]);

  useEffect(() => {
    async function loadNames() {
      const uniquePartnerIds = [
        ...new Set(
          bookings
            .map((b) => (isStudent ? b.tutorId : b.studentId))
            .filter(Boolean)
        ),
      ];

      const missingIds = uniquePartnerIds.filter((id) => !partnerNames[id]);
      if (missingIds.length === 0) return;

      try {
        const results = await Promise.all(
          missingIds.map(async (id) => {
            try {
              const res = await getMyProfile(id);
              return [id, resolveName(res?.data, isStudent ? "Tutor" : "Student")];
            } catch (err) {
              return [id, isStudent ? "Tutor" : "Student"];
            }
          })
        );
        setPartnerNames((prev) => ({
          ...prev,
          ...Object.fromEntries(results),
        }));
      } catch (err) {
        console.error("Error loading partner names for messages", err);
      }
    }

    if (bookings.length > 0) {
      loadNames();
    }
  }, [bookings, partnerNames, isStudent]);

  if (loading) {
    return (
      <div className="inbox-page">
        <div className="inbox-loading">Loading your conversations...</div>
      </div>
    );
  }

  return (
    <div className="inbox-page">
      <div className="inbox-header">
        <h2>Messages</h2>
        <p>Select a booking to view and send messages.</p>
      </div>

      <div className="inbox-layout">
        <aside className={`inbox-sidebar ${activeBooking ? "hidden-on-mobile" : ""}`}>
          {bookings.length === 0 ? (
            <p className="inbox-empty">No active conversations found.</p>
          ) : (
            bookings.map((booking) => {
              const partnerId = isStudent ? booking.tutorId : booking.studentId;
              const name = partnerNames[partnerId] || (isStudent ? "Tutor" : "Student");
              const isActive = activeBooking?.id === booking.id;

              return (
                <button
                  key={booking.id}
                  className={`inbox-conversation-item ${isActive ? "active" : ""}`}
                  onClick={() => setActiveBooking(booking)}
                >
                  <div className="inbox-avatar">
                     {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="inbox-conversation-details">
                    <h4>{name}</h4>
                    <span className="inbox-skill">{booking.skill}</span>
                    <span className="inbox-date">
                      {booking.sessionDate}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </aside>

        <main className={`inbox-main-panel ${activeBooking ? "active" : ""}`}>
          {activeBooking ? (
            <div className="inbox-chat-container">
              <div className="inbox-chat-header">
                 <button className="inbox-back-btn" onClick={() => setActiveBooking(null)}>← Back</button>
                 <h3>{activeBooking.skill}</h3>
              </div>
              <div className="inbox-chat-wrapper">
                 <MessagingPage booking={activeBooking} currentUserId={userId} />
              </div>
            </div>
          ) : (
            <div className="inbox-placeholder">
              <div className="inbox-placeholder-icon">💬</div>
              <p>Select a conversation from the sidebar</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
