"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_UNIVERSITY_SETTLEMENTS } from "@/lib/mock-data";
import { formatCAD } from "@/lib/calculations";

export default function UniversitySettlementsPage() {
  const settlements = MOCK_UNIVERSITY_SETTLEMENTS;

  return (
    <DashboardLayout role="university" userName="UofT Bursar">
      <div style={s.header}>
        <div><h1 style={s.title}>Incoming Settlements</h1><p style={s.subtitle}>Track batch wire transfers and crypto settlements.</p></div>
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Date</th>
              <th style={s.th}>Amount</th>
              <th style={s.th}>Students Funded</th>
              <th style={s.th}>Transaction Ref</th>
              <th style={s.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {settlements.map((set) => (
              <tr key={set.id}>
                <td style={s.td}>{new Date(set.date).toLocaleDateString()}</td>
                <td style={{ ...s.td, fontWeight: 700, color: "#10B981" }}>{formatCAD(set.amount)} {set.currency}</td>
                <td style={s.td}>{set.student_count} students</td>
                <td style={s.td}><code style={s.code}>{set.transaction_hash || "Pending..."}</code></td>
                <td style={s.td}>
                  <span style={{
                    ...s.badge,
                    background: set.status === "completed" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                    color: set.status === "completed" ? "#10B981" : "#F59E0B"
                  }}>
                    {set.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  header: { marginBottom: "28px" },
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginTop: "4px" },
  card: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { padding: "14px 20px", textAlign: "left" as const, fontSize: "12px", fontWeight: 600, color: "#6B7280", borderBottom: "1px solid rgba(75,85,99,0.2)", textTransform: "uppercase" as const },
  td: { padding: "16px 20px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },
  badge: { padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" },
  code: { background: "rgba(31,41,55,0.6)", padding: "4px 8px", borderRadius: "6px", fontFamily: "monospace", color: "#9CA3AF" },
};
