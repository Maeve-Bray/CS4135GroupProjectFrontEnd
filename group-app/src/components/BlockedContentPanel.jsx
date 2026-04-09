import { useState, useEffect, useCallback } from "react";
import { getBlockedContent, unblockContent } from "../api/adminAPI";

const CONTENT_TYPES = ["USER", "MESSAGE", "BOOKING", "TUTOR_PROFILE"];

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
}

function BlockedContentPanel({ token, adminId }) {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [actionError, setActionError] = useState(null);

  const fetchBlocked = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBlockedContent(token, typeFilter || undefined);
      setBlocked(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, typeFilter]);

  useEffect(() => {
    fetchBlocked();
  }, [fetchBlocked]);

  async function handleUnblock(item) {
    setActionError(null);
    try {
      await unblockContent(token, {
        contentType: item.contentType,
        contentId: item.contentId,
        adminId,
        reason: "Unblocked by admin",
      });
      setBlocked((prev) => prev.filter((b) => b.id !== item.id));
    } catch (e) {
      setActionError(e.message);
    }
  }

  return (
    <div className="admin-panel">
      <h2>Blocked Content</h2>

      <div className="admin-filters">
        <label>
          Content Type:
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All</option>
            {CONTENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <button onClick={fetchBlocked}>Refresh</button>
      </div>

      {actionError && <p className="admin-error">{actionError}</p>}
      {error && <p className="admin-error">Failed to load blocked content: {error}</p>}
      {loading && <p>Loading blocked content...</p>}

      {!loading && blocked.length === 0 && !error && (
        <p>No blocked content found.</p>
      )}

      {blocked.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Content Type</th>
              <th>Content ID</th>
              <th>Blocked By (Admin ID)</th>
              <th>Reason</th>
              <th>Blocked At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blocked.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.contentType}</td>
                <td>{item.contentId}</td>
                <td>{item.blockedByAdminId}</td>
                <td>{item.reason}</td>
                <td>{formatDate(item.blockedAt)}</td>
                <td>
                  <button onClick={() => handleUnblock(item)} className="btn-unblock">
                    Unblock
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

export default BlockedContentPanel;
