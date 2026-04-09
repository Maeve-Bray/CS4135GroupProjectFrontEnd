import { useState, useEffect, useCallback } from "react";
import { getBlockedContent } from "../api/adminAPI";

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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default BlockedContentPanel;
