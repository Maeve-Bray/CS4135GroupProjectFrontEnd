const API_BASE = "http://localhost:8080/api/messages";

const getHeaders = () => ({
  "Content-Type": "application/json",
});

export async function createThread(bookingId) {
  const response = await fetch(`${API_BASE}/threads?bookingId=${bookingId}`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to create thread");
  }
  return response.json();
}

export async function getThreadByBooking(bookingId) {
  const response = await fetch(`${API_BASE}/threads/booking/${bookingId}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Thread not found");
  }
  return response.json();
}

export async function sendMessage(threadId, senderId, content) {
  const response = await fetch(`${API_BASE}/threads/${threadId}/messages`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ senderId, content }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to send message");
  }
  return response.json();
}

export async function getMessages(threadId) {
  const response = await fetch(`${API_BASE}/threads/${threadId}/messages`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to load messages");
  }
  return response.json();
}
