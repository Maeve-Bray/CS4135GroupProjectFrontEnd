import { useEffect, useState, useCallback } from "react";
import {
  PieChart, Pie, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getReports } from "../api/adminAPI";

const STATUS_COLORS = {
  OPEN:      "#e0a0a0",
  CLOSED:    "#8ea88d",
  DISMISSED: "#b8b0c8",
};

const TYPE_COLORS = {
  USER:          "#6d58a8",
  MESSAGE:       "#8ea88d",
  BOOKING:       "#d7c7a2",
  TUTOR_PROFILE: "#a8b8a0",
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

  if (loading) return <p style={{ color: "#4b4260", fontFamily: "Georgia, serif" }}>Loading charts...</p>;
  if (error)   return <p style={{ color: "#a12727", fontFamily: "Georgia, serif" }}>Could not load chart data: {error}</p>;
  if (reports.length === 0) return <p style={{ color: "#4b4260", fontFamily: "Georgia, serif" }}>No report data yet.</p>;

  const statusData = toChartData(tally(reports, "status"), STATUS_COLORS);
  const typeData   = toChartData(tally(reports, "contentType"), TYPE_COLORS);

  return (
    <div className="report-charts">
      <div className="report-chart-card">
        <h3 className="report-chart-title">Reports by Status</h3>
        <ResponsiveContainer width="100%" height={360}>
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
        <ResponsiveContainer width="100%" height={360}>
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
