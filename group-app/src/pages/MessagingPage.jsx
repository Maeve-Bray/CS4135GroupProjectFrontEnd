import { useState, useEffect, useRef } from "react";
import { createThread, getThreadByBooking, sendMessage, getMessages } from "../api/messagingAPI";

function formatTime(sentAt) {
  if (!sentAt) return "";
  const date = Array.isArray(sentAt)
    ? new Date(sentAt[0], sentAt[1] - 1, sentAt[2], sentAt[3] ?? 0, sentAt[4] ?? 0)
    : new Date(sentAt);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessagingPage({ booking, currentUserId }) {
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [messagesUnavailable, setMessagesUnavailable] = useState(false);
  const [sendError, setSendError] = useState("");
  const [unauthorisedError, setUnauthorisedError] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    async function loadThread() {
      setLoading(true);
      setMessagesUnavailable(false);
      setSendError("");
      setUnauthorisedError("");

      try {
        const existing = await getThreadByBooking(booking.id);
        setThread(existing);

        try {
          const msgs = await getMessages(existing.threadId);
          setMessages(msgs);
        } catch {
          setMessagesUnavailable(true);
        }
      } catch {
        try {
          const created = await createThread(booking.id);
          setThread(created);
          setMessages([]);
        } catch (err) {
          setSendError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    if (booking?.id) loadThread();
  }, [booking]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !thread) return;

    setSendError("");
    setUnauthorisedError("");

    try {
      await sendMessage(thread.threadId, currentUserId, newMessage.trim());
      setNewMessage("");

      try {
        const updated = await getMessages(thread.threadId);
        setMessages(updated);
        setMessagesUnavailable(false);
      } catch {
        setMessagesUnavailable(true);
      }
    } catch (err) {
      if (err.isUnauthorised) {
        setUnauthorisedError(err.message || "Unauthorised — you are not a participant of this booking.");
      } else {
        setSendError(err.message || "Failed to send message.");
      }
    }
  };

  if (loading) return <p style={styles.loading}>Loading messages…</p>;

  const inputDisabled = messagesUnavailable || !thread;

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>
        Messages — {booking.skill} on {booking.sessionDate}
      </h3>

      {messagesUnavailable && (
        <div style={styles.fallbackBanner} role="alert">
          ⚠️ Messages unavailable right now. Please try again later.
        </div>
      )}

      {unauthorisedError && (
        <div style={styles.unauthorisedBanner} role="alert">
          🚫 Unauthorised: {unauthorisedError}
        </div>
      )}

      <div style={styles.messageBox}>
        {messages.length === 0 && !messagesUnavailable ? (
          <p style={styles.empty}>No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isMine = String(msg.senderId) === String(currentUserId);
            return (
              <div
                key={msg.messageId}
                style={{
                  ...styles.bubble,
                  alignSelf: isMine ? "flex-end" : "flex-start",
                  backgroundColor: isMine ? "#4f46e5" : "#e5e7eb",
                  color: isMine ? "#fff" : "#111",
                }}
              >
                <p style={styles.bubbleText}>{msg.content}</p>
                <span style={styles.timestamp}>{formatTime(msg.sentAt)}</span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {sendError && <p style={styles.sendError}>{sendError}</p>}

      <form onSubmit={handleSend} style={styles.form}>
        <input
          id="message-input"
          style={{
            ...styles.input,
            opacity: inputDisabled ? 0.5 : 1,
            cursor: inputDisabled ? "not-allowed" : "text",
          }}
          type="text"
          placeholder={messagesUnavailable ? "Messaging unavailable" : "Type a message…"}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={inputDisabled}
        />
        <button
          id="send-btn"
          type="submit"
          style={{
            ...styles.sendBtn,
            opacity: inputDisabled ? 0.5 : 1,
            cursor: inputDisabled ? "not-allowed" : "pointer",
          }}
          disabled={inputDisabled}
        >
          Send
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "16px",
    marginTop: "16px",
    maxWidth: "500px",
  },
  header: {
    marginBottom: "12px",
    fontSize: "16px",
    fontWeight: "600",
  },
  loading: {
    color: "#6b7280",
    fontSize: "14px",
    padding: "16px",
  },
  fallbackBanner: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    border: "1px solid #f59e0b",
    borderRadius: "8px",
    padding: "10px 14px",
    marginBottom: "12px",
    fontSize: "13px",
    fontWeight: "500",
  },
  unauthorisedBanner: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #ef4444",
    borderRadius: "8px",
    padding: "10px 14px",
    marginBottom: "12px",
    fontSize: "13px",
    fontWeight: "600",
  },
  messageBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    height: "300px",
    overflowY: "auto",
    padding: "8px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    marginBottom: "12px",
  },
  bubble: {
    maxWidth: "70%",
    padding: "10px 14px",
    borderRadius: "16px",
  },
  bubbleText: {
    margin: 0,
    fontSize: "14px",
  },
  timestamp: {
    fontSize: "11px",
    opacity: 0.7,
    display: "block",
    marginTop: "4px",
    textAlign: "right",
  },
  empty: {
    color: "#9ca3af",
    textAlign: "center",
    marginTop: "120px",
    fontSize: "14px",
  },
  sendError: {
    color: "#dc2626",
    fontSize: "13px",
    marginBottom: "8px",
  },
  form: {
    display: "flex",
    gap: "8px",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    transition: "opacity 0.2s",
  },
  sendBtn: {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4f46e5",
    color: "#fff",
    fontWeight: "600",
    transition: "opacity 0.2s",
  },
};