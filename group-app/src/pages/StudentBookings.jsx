import { useEffect, useMemo, useState } from "react";
import { cancelBooking, getStudentBookings } from "../api/bookingAPI";
import { getMyProfile } from "../api/authAPI";
import MessagingPage from "./MessagingPage";
import ReportModal from "../components/ReportModal";
import "../styles/tutorBookings.css";

function ErrorModal({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="tb-overlay">
      <div className="tb-modal">
        <h3 className="tb-modal-title">Something went wrong</h3>
        <p className="tb-modal-message">{message}</p>
        <button className="tb-modal-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function parseSessionDate(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(a, b) {
  return getDateKey(a) === getDateKey(b);
}

function isSameMonth(a, b) {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
  );
}

function getCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const mondayBasedOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayBasedOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

function formatMonthYear(date) {
  return date.toLocaleDateString("en-IE", {
    month: "long",
    year: "numeric",
  });
}

function formatSelectedDate(date) {
  return date.toLocaleDateString("en-IE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getStatusClass(status) {
  switch (status) {
    case "CONFIRMED":
    case "APPROVED":
      return "tb-status-badge tb-status-confirmed";
    case "PENDING":
      return "tb-status-badge tb-status-pending";
    case "REJECTED":
    case "CANCELLED":
    case "CANCELED":
      return "tb-status-badge tb-status-rejected";
    default:
      return "tb-status-badge tb-status-default";
  }
}

function resolveName(user) {
  return (
    user?.name ||
    user?.fullName ||
    user?.email?.split("@")[0] ||
    "Tutor"
  );
}

export default function StudentBookings({ studentId }) {
  const [bookings, setBookings] = useState([]);
  const [tutorNames, setTutorNames] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarInitialized, setCalendarInitialized] = useState(false);

  const loadBookings = async () => {
    try {
      const response = await getStudentBookings(studentId);
      setBookings(response.data || []);
    } catch (error) {
      console.error("Error loading bookings", error);
      console.error("Response data:", error.response?.data);
      setErrorMessage("Unable to load bookings right now.");
    }
  };

  useEffect(() => {
    if (studentId) {
      loadBookings();
    }
  }, [studentId]);

  useEffect(() => {
    async function loadTutorNames() {
      const uniqueTutorIds = [
        ...new Set(bookings.map((booking) => booking.tutorId).filter(Boolean)),
      ];

      const missingIds = uniqueTutorIds.filter(
        (tutorId) => !tutorNames[tutorId]
      );

      if (missingIds.length === 0) return;

      try {
        const results = await Promise.all(
          missingIds.map(async (tutorId) => {
            try {
              const res = await getMyProfile(tutorId);
              return [tutorId, resolveName(res?.data)];
            } catch (err) {
              console.error(`Error loading tutor name for ${tutorId}`, err);
              return [tutorId, "Tutor"];
            }
          })
        );

        setTutorNames((prev) => ({
          ...prev,
          ...Object.fromEntries(results),
        }));
      } catch (error) {
        console.error("Error loading tutor names", error);
      }
    }

    if (bookings.length > 0) {
      loadTutorNames();
    }
  }, [bookings, tutorNames]);

  const bookingsByDate = useMemo(() => {
    const grouped = {};

    bookings.forEach((booking) => {
      const parsedDate = parseSessionDate(booking.sessionDate);
      if (!parsedDate) return;

      const key = getDateKey(parsedDate);

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(booking);
    });

    Object.values(grouped).forEach((dayBookings) => {
      dayBookings.sort((a, b) => {
        return (
          new Date(`${a.sessionDate}T${a.startTime || "00:00"}`) -
          new Date(`${b.sessionDate}T${b.startTime || "00:00"}`)
        );
      });
    });

    return grouped;
  }, [bookings]);

  useEffect(() => {
    if (calendarInitialized || bookings.length === 0) return;

    const sortedBookings = [...bookings].sort((a, b) => {
      const aDate = new Date(`${a.sessionDate}T${a.startTime || "00:00"}`);
      const bDate = new Date(`${b.sessionDate}T${b.startTime || "00:00"}`);
      return aDate - bDate;
    });

    const firstBookingDate = parseSessionDate(sortedBookings[0]?.sessionDate);

    if (firstBookingDate) {
      setSelectedDate(firstBookingDate);
      setCurrentMonth(firstBookingDate);
      setCalendarInitialized(true);
    }
  }, [bookings, calendarInitialized]);

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  const selectedDateKey = getDateKey(selectedDate);
  const selectedDayBookings = bookingsByDate[selectedDateKey] || [];

  const handleCancel = async (id) => {
    try {
      await cancelBooking(id);
      await loadBookings();
    } catch (error) {
      console.error("Error cancelling booking", error);
      setErrorMessage("Failed to cancel booking. Please try again.");
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="tb-page">
      <ErrorModal
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />

      <div className="tb-header-row">
        <div>
          <h2 className="tb-heading">My Bookings</h2>
          <p className="tb-subheading">
            Click a date to view that day&apos;s sessions.
          </p>
        </div>

        <h1 className="brand-title">ShareCraft</h1>

        <div className="tb-month-controls">
          <button className="tb-month-button" onClick={goToPreviousMonth}>
            ←
          </button>
          <div className="tb-month-label">{formatMonthYear(currentMonth)}</div>
          <button className="tb-month-button" onClick={goToNextMonth}>
            →
          </button>
        </div>
      </div>

      <div className="tb-layout">
        <div className="tb-calendar-card">
          {activeChat ? (
            <>
              <div className="tb-chat-header">
                <div>
                  <h3 className="tb-chat-title">
                    Message {tutorNames[activeChat.tutorId] || "Tutor"}
                  </h3>
                  <p className="tb-chat-subtitle">
                    Booking on {activeChat.sessionDate} • {activeChat.startTime} -{" "}
                    {activeChat.endTime}
                  </p>
                </div>

                <button
                  className="tb-close-chat-top-button"
                  onClick={() => setActiveChat(null)}
                >
                  Back to Calendar
                </button>
              </div>

              <div className="tb-full-panel-chat">
                <MessagingPage booking={activeChat} currentUserId={studentId} />
              </div>
            </>
          ) : (
            <>
              <div className="tb-week-header-row">
                {weekDays.map((day) => (
                  <div key={day} className="tb-week-header-cell">
                    {day}
                  </div>
                ))}
              </div>

              <div className="tb-calendar-grid">
                {calendarDays.map((day) => {
                  const key = getDateKey(day);
                  const dayBookings = bookingsByDate[key] || [];
                  const pendingCount = dayBookings.filter(
                    (booking) => booking.status === "PENDING"
                  ).length;
                  const confirmedCount = dayBookings.filter(
                    (booking) =>
                      booking.status === "CONFIRMED" ||
                      booking.status === "APPROVED"
                  ).length;

                  const isSelected = isSameDay(day, selectedDate);
                  const inCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());

                  const dayCellClass = [
                    "tb-day-cell",
                    isSelected ? "tb-day-cell-selected" : "",
                    !inCurrentMonth ? "tb-day-cell-outside-month" : "",
                    isToday ? "tb-day-cell-today" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  const dayNumberClass = [
                    "tb-day-number",
                    isToday || isSelected ? "tb-day-number-active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <button
                      key={key}
                      className={dayCellClass}
                      onClick={() => {
                        setSelectedDate(day);
                        if (!isSameMonth(day, currentMonth)) {
                          setCurrentMonth(
                            new Date(day.getFullYear(), day.getMonth(), 1)
                          );
                        }
                      }}
                    >
                      <div className="tb-day-cell-top-row">
                        <span className={dayNumberClass}>{day.getDate()}</span>
                      </div>

                      {dayBookings.length > 0 && (
                        <div className="tb-day-info">
                          <span className="tb-session-count">
                            {dayBookings.length} session
                            {dayBookings.length > 1 ? "s" : ""}
                          </span>

                          <div className="tb-badge-stack">
                            {confirmedCount > 0 && (
                              <span className="tb-confirmed-mini-badge">
                                {confirmedCount} confirmed
                              </span>
                            )}
                            {pendingCount > 0 && (
                              <span className="tb-pending-mini-badge">
                                {pendingCount} pending
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="tb-details-card">
          <h3 className="tb-details-title">{formatSelectedDate(selectedDate)}</h3>

          {selectedDayBookings.length === 0 ? (
            <p className="tb-empty-text">No sessions for this day.</p>
          ) : (
            selectedDayBookings.map((booking) => (
              <div key={booking.id} className="tb-booking-card">
                <div className="tb-booking-header">
                  <div>
                    {booking.tutorId && (
                      <p className="tb-booking-line">
                        <strong>Tutor:</strong>{" "}
                        {tutorNames[booking.tutorId] || "Tutor"}
                      </p>
                    )}
                    <p className="tb-booking-line">
                      <strong>Skill:</strong> {booking.skill}
                    </p>
                    <p className="tb-booking-line">
                      <strong>Time:</strong> {booking.startTime} - {booking.endTime}
                    </p>
                  </div>

                  <span className={getStatusClass(booking.status)}>
                    {booking.status}
                  </span>
                </div>

                {(booking.status === "PENDING" ||
                  booking.status === "APPROVED" ||
                  booking.status === "CONFIRMED") && (
                  <div className="tb-action-row">
                    <button
                      className="tb-reject-button"
                      onClick={() => handleCancel(booking.id)}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {booking.status === "CONFIRMED" && (
                  <div className="tb-action-row">
                    <button
                      className="tb-message-button"
                      onClick={() => setActiveChat(booking)}
                    >
                      {activeChat?.id === booking.id ? "Open Chat" : "Message Tutor"}
                    </button>
                  </div>
                )}

                <div className="tb-action-row">
                  <ReportModal
                    contentType="BOOKING"
                    contentId={booking.id}
                    label="Report Booking"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}