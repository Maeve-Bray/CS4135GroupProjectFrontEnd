import { useEffect, useMemo, useState } from "react";
import {
  approveBooking,
  getTutorBookings,
  rejectBooking,
} from "../api/bookingAPI";
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
      return "tb-status-badge tb-status-confirmed";
    case "PENDING":
      return "tb-status-badge tb-status-pending";
    case "COMPLETED":
      return "tb-status-badge tb-status-completed";
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
    "Student"
  );
}

export default function TutorBookings({ tutorId }) {
  const [bookings, setBookings] = useState([]);
  const [studentNames, setStudentNames] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarInitialized, setCalendarInitialized] = useState(false);

  const loadBookings = async () => {
    try {
      const response = await getTutorBookings(tutorId);
      setBookings(response.data || []);
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

  useEffect(() => {
    async function loadStudentNames() {
      const uniqueStudentIds = [
        ...new Set(
          bookings
            .map((booking) => booking.studentId)
            .filter(Boolean)
        ),
      ];

      const missingIds = uniqueStudentIds.filter(
        (studentId) => !studentNames[studentId]
      );

      if (missingIds.length === 0) return;

      try {
        const results = await Promise.all(
          missingIds.map(async (studentId) => {
            try {
              const res = await getMyProfile(studentId);
              return [studentId, resolveName(res?.data)];
            } catch (err) {
              console.error(`Error loading student name for ${studentId}`, err);
              return [studentId, "Student"];
            }
          })
        );

        setStudentNames((prev) => ({
          ...prev,
          ...Object.fromEntries(results),
        }));
      } catch (error) {
        console.error("Error loading student names", error);
      }
    }

    if (bookings.length > 0) {
      loadStudentNames();
    }
  }, [bookings, studentNames]);

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

  const handleApprove = async (id) => {
    try {
      await approveBooking(id);
      await loadBookings();
    } catch (error) {
      console.error("Error approving booking", error);
      setErrorMessage(
        "Failed to approve booking. Please check this booking doesn't overlap an existing confirmed booking."
      );
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
          <h2 className="tb-heading">Tutor Schedule</h2>
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
                    Message {studentNames[activeChat.studentId] || "Student"}
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
                <MessagingPage
                  booking={activeChat}
                  currentUserId={tutorId}
                />
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
                    (booking) => booking.status === "CONFIRMED"
                  ).length;
                  const completedCount = dayBookings.filter(
                    (booking) => booking.status === "COMPLETED"
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
                            {completedCount > 0 && (
                              <span className="tb-completed-mini-badge">
                                {completedCount} completed
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
                    <p className="tb-booking-line">
                      <strong>Student:</strong>{" "}
                      {studentNames[booking.studentId] || "Student"}
                    </p>
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

                {booking.status === "COMPLETED" && (
                  <div className="tb-completed-banner">
                    This booking has been completed.
                  </div>
                )}

                {booking.status === "PENDING" && (
                  <div className="tb-action-row">
                    <button
                      className="tb-approve-button"
                      onClick={() => handleApprove(booking.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="tb-reject-button"
                      onClick={() => handleReject(booking.id)}
                    >
                      Reject
                    </button>
                  </div>
                )}

                {(booking.status === "CONFIRMED" ||
                  booking.status === "COMPLETED") && (
                  <div className="tb-action-row">
                    <button
                      className="tb-message-button"
                      onClick={() => setActiveChat(booking)}
                    >
                      {booking.status === "COMPLETED"
                        ? "View Messages"
                        : "Message Student"}
                    </button>
                  </div>
                )}

                <div className="tb-action-row">
                  <ReportModal
                    contentType="USER"
                    contentId={booking.studentId}
                    label="Report Student"
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