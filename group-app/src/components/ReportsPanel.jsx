import { useState, useEffect, useCallback } from "react";
import { getReports, reviewReport, dismissReport, blockContent } from "../api/adminAPI";

const CONTENT_TYPES = ["USER", "MESSAGE", "BOOKING", "TUTOR_PROFILE"];
const REPORT_STATUSES = ["OPEN", "REVIEWED", "DISMISSED"];

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
}

function ReportsPanel({ token, adminId }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [notes, setNotes] = useState({});
  const [actionError, setActionError] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReports(token, {
        status: statusFilter || undefined,
        contentType: typeFilter || undefined,
      });
      setReports(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, typeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  function setNoteFor(id, value) {
    setNotes((prev) => ({ ...prev, [id]: value }));
  }

  async function handleReview(reportId) {
    setActionError(null);
    try {
      const updated = await reviewReport(token, reportId, adminId, notes[reportId] || "");
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (e) {
      setActionError(e.message);
    }
  }

  async function handleDismiss(reportId) {
    setActionError(null);
    try {
      const updated = await dismissReport(token, reportId, adminId, notes[reportId] || "");
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (e) {
      setActionError(e.message);
    }
  }

  async function handleBlock(report) {
    setActionError(null);
    try {
      await blockContent(token, {
        contentType: report.contentType,
        contentId: report.contentId,
        adminId,
        reason: notes[report.id] || `Blocked via report #${report.id}`,
      });
      alert(`Content blocked: ${report.contentType} #${report.contentId}`);
    } catch (e) {
      setActionError(e.message);
    }
  }

  return (
    <div className="admin-panel">
      <h2>Reports</h2>

      <div className="admin-filters">
        <label>
          Status:
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            {REPORT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Content Type:
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All</option>
            {CONTENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <button onClick={fetchReports}>Refresh</button>
      </div>

      {actionError && <p className="admin-error">{actionError}</p>}
      {error && <p className="admin-error">Failed to load reports: {error}</p>}
      {loading && <p>Loading reports...</p>}

      {!loading && reports.length === 0 && !error && (
        <p>No reports found.</p>
      )}

      {reports.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Reported By</th>
              <th>Content Type</th>
              <th>Content ID</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Reported At</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{report.reportedByUserId}</td>
                <td>{report.contentType}</td>
                <td>{report.contentId}</td>
                <td className="report-reason">{report.reason}</td>
                <td>
                  <span className={`status-badge status-${report.status.toLowerCase()}`}>
                    {report.status}
                  </span>
                </td>
                <td>{formatDate(report.createdAt)}</td>
                <td>
                  <input
                    type="text"
                    placeholder="Optional notes..."
                    value={notes[report.id] || ""}
                    onChange={(e) => setNoteFor(report.id, e.target.value)}
                    className="notes-input"
                  />
                </td>
                <td className="action-buttons">
                  <button
                    onClick={() => handleReview(report.id)}
                    disabled={report.status === "REVIEWED"}
                    className="btn-review"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => handleDismiss(report.id)}
                    disabled={report.status === "DISMISSED"}
                    className="btn-dismiss"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleBlock(report)}
                    className="btn-block"
                  >
                    Block Content
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ReportsPanel;
