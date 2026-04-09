import { useState, useEffect, useRef } from "react";
import {
  createThread,
  getThreadByBooking,
  sendMessage,
  getMessages,
} from "../api/messagingAPI";
import { getMyProfile } from "../api/authAPI";
import ReportModal from "../components/ReportModal";
import "../styles/messaging.css";

function toDate(value) {
  if (!value) return null;

  if (Array.isArray(value)) {
    return new Date(
      value[0],
      (value[1] ?? 1) - 1,
      value[2] ?? 1,
      value[3] ?? 0,
      value[4] ?? 0,
      value[5] ?? 0
    );
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  return new Date(value);
}

function formatTime(sentAt) {
  const date = toDate(sentAt);
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDisplayDate(value) {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB");
}

function getInitials(name) {
  if (!name) return "?";
  return String(name).trim().charAt(0).toUpperCase();
}

function resolveName(user) {
  return (
    user?.name ||
    user?.fullName ||
    user?.email?.split("@")[0] ||
    "Your Name"
  );
}

export default function MessagingPage({ booking, currentUserId }) {
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatPartnerName, setChatPartnerName] = useState("");
  const bottomRef = useRef(null);

  const isStudentView =
    String(booking?.studentId) === String(currentUserId);

  const partnerUserId = isStudentView
    ? booking?.tutorId
    : booking?.studentId;

  useEffect(() => {
    async function loadThread() {
      setLoading(true);
      setError("");

      try {
        const existing = await getThreadByBooking(booking.id);
        setThread(existing);

        if (existing?.threadId) {
          const msgs = await getMessages(existing.threadId);
          setMessages(msgs || []);
        } else {
          setMessages([]);
        }
      } catch {
        try {
          const created = await createThread(booking.id);
          setThread(created);
          setMessages([]);
        } catch (err) {
          setError(err.message || "Could not load messages.");
        }
      } finally {
        setLoading(false);
      }
    }

    if (booking?.id) {
      loadThread();
    } else {
      setLoading(false);
    }
  }, [booking?.id]);

  useEffect(() => {
    async function loadPartnerName() {
      if (!partnerUserId) {
        setChatPartnerName(isStudentView ? "Tutor" : "Student");
        return;
      }

      try {
        const res = await getMyProfile(partnerUserId);
        setChatPartnerName(resolveName(res?.data));
      } catch (err) {
        console.error("Error loading chat partner name", err);
        setChatPartnerName(isStudentView ? "Tutor" : "Student");
      }
    }

    if (booking?.id) {
      loadPartnerName();
    }
  }, [booking?.id, partnerUserId, isStudentView]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !thread?.threadId) return;

    setError("");
    try {
      await sendMessage(thread.threadId, currentUserId, newMessage.trim());
      setNewMessage("");
      const updated = await getMessages(thread.threadId);
      setMessages(updated || []);
    } catch (err) {
      setError(err.message || "Failed to send message.");
    }
  };

  const chatPartnerAvatar = isStudentView
    ? booking?.tutorAvatarUrl
    : booking?.studentAvatarUrl;

  const fallbackPartnerName = isStudentView ? "Tutor" : "Student";

  const chatDate = formatDisplayDate(
    messages[0]?.sentAt || booking?.sessionDate || new Date()
  );

  if (loading) {
    return (
      <div className="messaging-page">
        <div className="messaging-shell messaging-shell--loading">
          <p className="messaging-loading">Loading messages…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messaging-page">
      <div className="messaging-shell">
        <header className="messaging-header">
          <div className="messaging-header__profile">
            <div className="messaging-avatar">
              {chatPartnerAvatar ? (
                <img
                  src={chatPartnerAvatar}
                  alt={chatPartnerName || fallbackPartnerName}
                />
              ) : (
                <span>{getInitials(chatPartnerName || fallbackPartnerName)}</span>
              )}
            </div>

            <div className="messaging-header__meta">
              <h2>{chatPartnerName || fallbackPartnerName}</h2>
            </div>
          </div>
        </header>

        <section className="messaging-body">
          {chatDate && <div className="messaging-date">{chatDate}</div>}

          <div className="messaging-scroll">
            <div className="messaging-booking-card">
              <strong>Session request sent:</strong>
              <span>Skill: {booking?.skill || "—"}</span>
              <span>Date: {formatDisplayDate(booking?.sessionDate) || "—"}</span>
              <span>
                Time: {booking?.startTime || "—"}
                {booking?.endTime ? `-${booking.endTime}` : ""}
              </span>
            </div>

            {messages.length === 0 ? (
              <div className="messaging-empty">
                <div className="messaging-empty__brand">ShareCraft</div>
                <p>Start the conversation here.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine =
                  String(msg.senderId) === String(currentUserId);

                return (
                  <div
                    key={msg.messageId}
                    className={`messaging-row ${
                      isMine ? "messaging-row--mine" : "messaging-row--theirs"
                    }`}
                  >
                    <div
                      className={`messaging-bubble ${
                        isMine
                          ? "messaging-bubble--mine"
                          : "messaging-bubble--theirs"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span>{formatTime(msg.sentAt)}</span>
                    </div>

                    {!isMine && (
                      <ReportModal
                        contentType="MESSAGE"
                        contentId={msg.messageId}
                        label="Report"
                      />
                    )}
                  </div>
                );
              })
            )}

            <div ref={bottomRef} />
          </div>
        </section>

        {error && <p className="messaging-error">{error}</p>}

        <form onSubmit={handleSend} className="messaging-composer">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="messaging-composer__input"
          />

          <button type="submit" className="messaging-composer__send">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}