import { useState } from "react";
import { submitReport } from "../api/adminAPI";
import { useAuth } from "../context/useAuth";

/**
 * Props:
 *  contentType – "USER" | "MESSAGE" | "BOOKING" | "TUTOR_PROFILE"
 *  contentId   – the ID of the thing being reported
 *  label       – text shown on the trigger button (default "Report")
 *  onClose     – optional callback after dismissing the modal
 */
export default function ReportModal({ contentType, contentId, label = "Report", onClose }) {
  const { auth } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleOpen() {
    setOpen(true);
    setReason("");
    setError("");
    setSuccess(false);
  }

  function handleClose() {
    setOpen(false);
    onClose?.();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await submitReport(auth.token, {
        reportedByUserId: auth.userId,
        contentType,
        contentId,
        reason: reason.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button onClick={handleOpen} style={triggerStyle}>
        {label}
      </button>

      {open && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ marginTop: 0, color: "#b91c1c" }}>Submit a Report</h3>

            {success ? (
              <>
                <p style={{ color: "#065f46" }}>Your report has been submitted. Thank you.</p>
                <button onClick={handleClose} style={btnSecondary}>Close</button>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <label style={labelStyle}>
                  Reason:
                  <textarea
                    style={textareaStyle}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe the issue..."
                    rows={4}
                    required
                  />
                </label>
                {error && <p style={{ color: "#b91c1c", fontSize: "13px" }}>{error}</p>}
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button type="submit" disabled={submitting} style={btnDanger}>
                    {submitting ? "Submitting..." : "Submit Report"}
                  </button>
                  <button type="button" onClick={handleClose} style={btnSecondary}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0, left: 0,
  width: "100%", height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#fff",
  padding: "24px",
  borderRadius: "12px",
  width: "90%",
  maxWidth: "420px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  fontSize: "14px",
  fontWeight: "600",
  color: "#374151",
};

const textareaStyle = {
  padding: "8px 10px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  resize: "vertical",
  fontFamily: "inherit",
};

const triggerStyle = {
  background: "none",
  border: "1px solid #fca5a5",
  borderRadius: "7px",
  color: "#b91c1c",
  padding: "5px 10px",
  fontSize: "12px",
  cursor: "pointer",
};

const btnDanger = {
  background: "#b91c1c",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "9px 16px",
  fontSize: "14px",
  cursor: "pointer",
};

const btnSecondary = {
  background: "#e5e7eb",
  color: "#374151",
  border: "none",
  borderRadius: "8px",
  padding: "9px 16px",
  fontSize: "14px",
  cursor: "pointer",
};
