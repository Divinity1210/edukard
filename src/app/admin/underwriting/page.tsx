"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_PENDING_APPLICATIONS, MOCK_APPLICANT_NAMES } from "@/lib/mock-data";
import { formatCAD, formatDate } from "@/lib/calculations";

export default function UnderwritingPage() {
  const apps = MOCK_PENDING_APPLICATIONS;
  const riskColors: Record<string, string> = { green: "#10B981", yellow: "#F59E0B", red: "#EF4444" };
  const riskBg: Record<string, string> = { green: "rgba(16,185,129,0.12)", yellow: "rgba(245,158,11,0.12)", red: "rgba(239,68,68,0.12)" };

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <h1 style={s.title}>Underwriting Queue</h1>
      <p style={s.subtitle}>Review and action pending loan applications with algorithmic risk scoring.</p>

      <div style={s.filters}>
        <button style={{ ...s.filterBtn, ...s.filterActive }}>All ({apps.length})</button>
        <button style={s.filterBtn}>🟢 Low Risk</button>
        <button style={s.filterBtn}>🟡 Medium Risk</button>
        <button style={s.filterBtn}>🔴 High Risk</button>
      </div>

      <div style={s.appList}>
        {apps.map((app) => (
          <div key={app.id} style={s.appCard}>
            <div style={s.appHeader}>
              <div>
                <div style={s.appName}>{MOCK_APPLICANT_NAMES[app.user_id] || "Unknown"}</div>
                <div style={s.appMeta}>Applied {formatDate(app.created_at)} · {app.university_name}</div>
              </div>
              <span style={{ ...s.riskBadge, background: riskBg[app.risk_flag], color: riskColors[app.risk_flag] }}>
                {app.risk_flag === "green" ? "● LOW RISK" : app.risk_flag === "yellow" ? "● MEDIUM RISK" : "● HIGH RISK"}
              </span>
            </div>
            <div style={s.appDetails}>
              <div><span style={s.detLabel}>Amount</span><span style={s.detValue}>{formatCAD(app.loan_amount)}</span></div>
              <div><span style={s.detLabel}>Term</span><span style={s.detValue}>{app.term_months} months</span></div>
              <div><span style={s.detLabel}>APR</span><span style={s.detValue}>{app.apr}%</span></div>
              <div><span style={s.detLabel}>Monthly</span><span style={s.detValue}>{formatCAD(app.monthly_payment)}</span></div>
            </div>
            <div style={s.appActions}>
              <button style={s.approveBtn}>✓ Approve</button>
              <button style={s.rejectBtn}>✕ Reject</button>
              <a href={`/admin/underwriting/${app.id}`} style={s.reviewBtn}>Review Details →</a>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "24px" },
  filters: { display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" as const },
  filterBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(17,24,39,0.6)", color: "#6B7280", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
  filterActive: { border: "1px solid #7C3AED", background: "rgba(139,92,246,0.12)", color: "#7C3AED" },
  appList: { display: "flex", flexDirection: "column" as const, gap: "16px" },
  appCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  appHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap" as const, gap: "12px" },
  appName: { fontSize: "16px", fontWeight: 700, color: "#F9FAFB" },
  appMeta: { fontSize: "13px", color: "#6B7280", marginTop: "4px" },
  riskBadge: { padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px" },
  appDetails: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "20px" },
  detLabel: { display: "block", fontSize: "12px", color: "#6B7280" },
  detValue: { display: "block", fontSize: "16px", fontWeight: 700, color: "#F9FAFB" },
  appActions: { display: "flex", gap: "10px", paddingTop: "16px", borderTop: "1px solid rgba(75,85,99,0.15)" },
  approveBtn: { padding: "10px 20px", borderRadius: "10px", background: "rgba(16,185,129,0.12)", color: "#10B981", border: "none", fontSize: "14px", fontWeight: 700, cursor: "pointer" },
  rejectBtn: { padding: "10px 20px", borderRadius: "10px", background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "none", fontSize: "14px", fontWeight: 700, cursor: "pointer" },
  reviewBtn: { padding: "10px 20px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(17,24,39,0.6)", color: "#6B7280", fontSize: "14px", fontWeight: 600, cursor: "pointer", marginLeft: "auto" },
};
