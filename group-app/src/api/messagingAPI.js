import { API_BASE_URL } from "./baseURL.js";

const API_BASE = `${API_BASE_URL}/api/messages`;

const getHeaders = () => ({
  "Content-Type": "application/json",
});

const TIMEOUT_MS = 8_000;

function withTimeout(fetchPromise, controller) {
  const timer = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);

  return fetchPromise.finally(() => clearTimeout(timer));
}

const FAILURE_THRESHOLD = 3;
const RESET_TIMEOUT_MS = 30_000;

const circuitBreaker = {
  state: "CLOSED",
  failures: 0,
  openedAt: null,

  isOpen() {
    if (this.state === "OPEN") {
      const elapsed = Date.now() - this.openedAt;
      if (elapsed >= RESET_TIMEOUT_MS) {
        this.state = "HALF_OPEN";
        console.log(`[CircuitBreaker] OPEN → HALF_OPEN after ${elapsed} ms`);
        return false;
      }
      return true;
    }
    return false;
  },

  recordSuccess() {
    if (this.state === "HALF_OPEN") {
      console.log("[CircuitBreaker] HALF_OPEN → CLOSED (probe succeeded)");
    }
    this.state = "CLOSED";
    this.failures = 0;
    this.openedAt = null;
  },

  recordFailure() {
    this.failures += 1;
    console.error(`[CircuitBreaker] Failure count: ${this.failures}`);

    if (this.failures >= FAILURE_THRESHOLD || this.state === "HALF_OPEN") {
      this.state = "OPEN";
      this.openedAt = Date.now();
      console.error(
        `[CircuitBreaker] OPEN — threshold reached after ${this.failures} failure(s)`,
      );
    }
  },
};

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 100;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry(fetchFn) {
  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetchFn();

      if (response.status === 401 || response.status === 403) {
        const err = await response.json().catch(() => ({}));
        const authErr = new Error(err.message || "Unauthorised");
        authErr.isUnauthorised = true;
        throw authErr;
      }

      return response;
    } catch (err) {
      if (err.isUnauthorised) throw err;
      if (err.isCircuitOpen) throw err;

      lastError = err;
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      console.warn(
        `[Retry] Attempt ${attempt + 1}/${MAX_RETRIES} failed. Retrying in ${delay} ms…`,
        err.message,
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

async function resilientFetch(fetchFn, { retry = false } = {}) {
  if (circuitBreaker.isOpen()) {
    const err = new Error(
      "Message service is currently unavailable (circuit OPEN). " +
        "Please try again in a few seconds.",
    );
    err.isCircuitOpen = true;
    throw err;
  }

  const run = async () => {
    const controller = new AbortController();
    const response = await withTimeout(fetchFn(controller.signal), controller);
    return response;
  };

  try {
    const response = retry ? await withRetry(run) : await run();
    circuitBreaker.recordSuccess();
    return response;
  } catch (err) {
    if (!err.isUnauthorised) {
      circuitBreaker.recordFailure();
    }
    throw err;
  }
}

export async function createThread(bookingId) {
  const response = await resilientFetch((signal) =>
    fetch(`${API_BASE}/threads?bookingId=${bookingId}`, {
      method: "POST",
      headers: getHeaders(),
      signal,
    }),
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const error = new Error(err.message || "Failed to create thread");
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function getThreadByBooking(bookingId) {
  const response = await resilientFetch((signal) =>
    fetch(`${API_BASE}/threads/booking/${bookingId}`, {
      headers: getHeaders(),
      signal,
    }),
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const error = new Error(err.message || "Thread not found");
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function sendMessage(threadId, senderId, content) {
  const response = await resilientFetch((signal) =>
    fetch(`${API_BASE}/threads/${threadId}/messages`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ senderId, content }),
      signal,
    }),
  );

  if (response.status === 401 || response.status === 403) {
    const err = await response.json().catch(() => ({}));
    const authErr = new Error(err.message || "Unauthorised");
    authErr.isUnauthorised = true;
    throw authErr;
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const error = new Error(err.message || "Failed to send message");
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function getMessages(threadId) {
  const response = await resilientFetch(
    (signal) =>
      fetch(`${API_BASE}/threads/${threadId}/messages`, {
        headers: getHeaders(),
        signal,
      }),
    { retry: true },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const error = new Error(err.message || "Failed to load messages");
    error.status = response.status;
    throw error;
  }
  return response.json();
}