import { useState, useEffect, useRef } from "react";
import { createThread, getThreadByBooking, sendMessage, getMessages } from "../api/messagingAPI";
import ReportModal from "../components/ReportModal";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    async function loadThread() {
      setLoading(true);
      setError("");
      try {
        const existing = await getThreadByBooking(booking.id);
        setThread(existing);
        const msgs = await getMessages(existing.threadId);
        setMessages(msgs);
      } catch {
        try {
          const created = await createThread(booking.id);
          setThread(created);
          setMessages([]);
        } catch (err) {
          setError(err.message);
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
    setError("");
    try {
      await sendMessage(thread.threadId, currentUserId, newMessage.trim());
      setNewMessage("");
      const updated = await getMessages(thread.threadId);
      setMessages(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading messages...</p>;

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>
        Messages — {booking.skill} on {booking.sessionDate}
      </h3>

      <div style={styles.messageBox}>
        {messages.length === 0 ? (
          <p style={styles.empty}>No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isMine = String(msg.senderId) === String(currentUserId);
            return (
              <div
                key={msg.messageId}
                style={{
                  ...styles.bubbleWrapper,
                  alignItems: isMine ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    ...styles.bubble,
                    backgroundColor: isMine ? "#4f46e5" : "#e5e7eb",
                    color: isMine ? "#fff" : "#111",
                  }}
                >
                  <p style={styles.bubbleText}>{msg.content}</p>
                  <span style={styles.timestamp}>{formatTime(msg.sentAt)}</span>
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

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSend} style={styles.form}>
        <input
          style={styles.input}
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" style={styles.sendBtn}>Send</button>
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
  bubbleWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
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
  error: {
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
  },
  sendBtn: {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4f46e5",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
};