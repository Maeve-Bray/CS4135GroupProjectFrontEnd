import { useEffect, useState, useCallback } from "react";
import {
  PieChart, Pie, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getReports } from "../api/adminAPI";

const STATUS_COLORS = {
  OPEN:      "#ef4444",
  CLOSED:    "#22c55e",
  DISMISSED: "#9ca3af",
};

const TYPE_COLORS = {
  USER:          "#7c3aed",
  MESSAGE:       "#3b82f6",
  BOOKING:       "#f59e0b",
  TUTOR_PROFILE: "#10b981",
};

function tally(reports, key) {
  return reports.reduce((acc, r) => {
    const val = r[key];
    acc[val] = (acc[val] ?? 0) + 1;
    return acc;
  }, {});
}

function toChartData(counts, colorMap) {
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    fill: colorMap[name] ?? "#d1d5db",
  }));
}

export default function ReportCharts({ token }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReports(token);
      setReports(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  if (loading) return <p style={{ color: "#6b7280" }}>Loading charts...</p>;
  if (error)   return <p style={{ color: "#b91c1c" }}>Could not load chart data: {error}</p>;
  if (reports.length === 0) return <p style={{ color: "#6b7280" }}>No report data yet.</p>;

  const statusData = toChartData(tally(reports, "status"), STATUS_COLORS);
  const typeData   = toChartData(tally(reports, "contentType"), TYPE_COLORS);

  return (
    <div className="report-charts">
      <div className="report-chart-card">
        <h3 className="report-chart-title">Reports by Status</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              label={({ name, value }) => `${name} (${value})`}
              labelLine={false}
            />
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="report-chart-card">
        <h3 className="report-chart-title">Reports by Content Type</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={typeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              label={({ name, value }) => `${name} (${value})`}
              labelLine={false}
            />
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
