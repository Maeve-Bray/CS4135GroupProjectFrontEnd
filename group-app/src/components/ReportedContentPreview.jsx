import { useState } from "react";
import {
  getReportedMessage,
  getReportedUser,
  getReportedBooking,
  getReportedTutorProfile,
} from "../api/adminAPI";

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
}

function MessagePreview({ data }) {
  return (
    <div className="content-preview">
      <p><strong>Message ID:</strong> {data.messageId}</p>
      <p><strong>Sender ID:</strong> {data.senderId}</p>
      <p><strong>Content:</strong> {data.content}</p>
      <p><strong>Sent At:</strong> {formatDate(data.sentAt)}</p>
    </div>
  );
}

function UserPreview({ data }) {
  return (
    <div className="content-preview">
      <p><strong>User ID:</strong> {data.userId}</p>
      <p><strong>Email:</strong> {data.email}</p>
      <p><strong>Role:</strong> {data.role}</p>
      <p><strong>Status:</strong> {data.status}</p>
    </div>
  );
}

function BookingPreview({ data }) {
  return (
    <div className="content-preview">
      <p><strong>Booking ID:</strong> {data.id}</p>
      <p><strong>Student ID:</strong> {data.studentId}</p>
      <p><strong>Tutor ID:</strong> {data.tutorId}</p>
      <p><strong>Skill:</strong> {data.skill}</p>
      <p><strong>Date:</strong> {data.sessionDate}</p>
      <p><strong>Time:</strong> {data.startTime} – {data.endTime}</p>
      <p><strong>Status:</strong> {data.status}</p>
    </div>
  );
}

function TutorProfilePreview({ data }) {
  return (
    <div className="content-preview">
      <p><strong>Tutor ID:</strong> {data.userId}</p>
      <p><strong>Bio:</strong> {data.biography || "-"}</p>
      <p><strong>Verified:</strong> {data.verified ? "Yes" : "No"}</p>
      {data.skills?.length > 0 && (
        <p><strong>Skills:</strong> {data.skills.map(s => s.skillName).join(", ")}</p>
      )}
    </div>
  );
}

export default function ReportedContentPreview({ token, contentType, contentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  async function handleToggle() {
    if (open) {
      setOpen(false);
      return;
    }
    if (data) {
      setOpen(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let result;
      if (contentType === "MESSAGE")       result = await getReportedMessage(token, contentId);
      else if (contentType === "USER")     result = await getReportedUser(token, contentId);
      else if (contentType === "BOOKING")  result = await getReportedBooking(token, contentId);
      else                                 result = await getReportedTutorProfile(token, contentId);
      setData(result);
      setOpen(true);
    } catch (e) {
      setError(e.message);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleToggle} className="btn-view-content" disabled={loading}>
        {loading ? "Loading..." : open ? "Hide Content" : "View Content"}
      </button>
      {open && (
        <div className="content-preview-wrapper">
          {error && <p className="content-preview-error">{error}</p>}
          {data && contentType === "MESSAGE"       && <MessagePreview data={data} />}
          {data && contentType === "USER"          && <UserPreview data={data} />}
          {data && contentType === "BOOKING"       && <BookingPreview data={data} />}
          {data && contentType === "TUTOR_PROFILE" && <TutorProfilePreview data={data} />}
        </div>
      )}
    </div>
  );
}
