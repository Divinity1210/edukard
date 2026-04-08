"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_ADMIN_STATS, MOCK_PENDING_APPLICATIONS, MOCK_APPLICANT_NAMES, MOCK_POOLS, MOCK_DELINQUENT_ACCOUNTS } from "@/lib/mock-data";
import { formatCAD, formatPercent } from "@/lib/calculations";

export default function AdminDashboard() {
  const stats = MOCK_ADMIN_STATS;
  const pending = MOCK_PENDING_APPLICATIONS;
  const pools = MOCK_POOLS;
  const delinquent = MOCK_DELINQUENT_ACCOUNTS;
  const riskColors: Record<string, string> = { green: "#10B981", yellow: "#F59E0B", red: "#EF4444" };
  const riskBg: Record<string, string> = { green: "rgba(16,185,129,0.12)", yellow: "rgba(245,158,11,0.12)", red: "rgba(239,68,68,0.12)" };

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <h1 style={s.title}>Operations Dashboard</h1>
      <p style={s.subtitle}>Real-time overview of the EduKard protocol.</p>

      <div style={s.statsGrid}>
        {[
          { label: "Pending Applications", value: stats.pending_applications.toString(), color: "#F59E0B", icon: "📋" },
          { label: "Active Loans", value: stats.active_loans.toString(), color: "#10B981", icon: "✅" },
          { label: "Total Disbursed", value: formatCAD(stats.total_disbursed), color: "#10B981", icon: "💰" },
          { label: "Default Rate", value: formatPercent(stats.default_rate), color: stats.default_rate > 5 ? "#EF4444" : "#10B981", icon: "📊" },
          { label: "Pool Utilization", value: formatPercent(stats.pool_utilization), color: "#0D9488", icon: "🏦" },
          { label: "Total TVL", value: formatCAD(stats.total_tvl), color: "#7C3AED", icon: "💎" },
        ].map((stat) => (
          <div key={stat.label} style={s.statCard}>
            <div style={s.statTop}><span style={{ ...s.statIconBg, background: `${stat.color}10`, color: stat.color }}>{stat.icon}</span><span style={s.statLabel}>{stat.label}</span></div>
            <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={s.section}>
        <div style={s.sectionHeader}><h2 style={s.sectionTitle}>Pending Applications</h2><a href="/admin/underwriting" style={s.viewAll}>View all →</a></div>
        <div style={s.tableCard}>
          <table style={s.table}>
            <thead><tr>{["Applicant", "University", "Amount", "Risk", "Status", "Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {pending.map((app) => (
                <tr key={app.id}>
                  <td style={{ ...s.td, fontWeight: 600, color: "#F9FAFB" }}>{MOCK_APPLICANT_NAMES[app.user_id] || "Unknown"}</td>
                  <td style={s.td}>{app.university_name}</td>
                  <td style={{ ...s.td, fontWeight: 600 }}>{formatCAD(app.loan_amount)}</td>
                  <td style={s.td}><span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, background: riskBg[app.risk_flag], color: riskColors[app.risk_flag] }}>{app.risk_flag === "green" ? "● Low" : app.risk_flag === "yellow" ? "● Medium" : "● High"}</span></td>
                  <td style={s.td}><span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, background: "rgba(16,185,129,0.12)", color: "#10B981", textTransform: "capitalize" as const }}>{app.status.replace("_", " ")}</span></td>
                  <td style={s.td}><div style={s.actionBtns}><button style={s.approveBtn}>Approve</button><button style={s.rejectBtn}>Reject</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.sectionHeader}><h2 style={s.sectionTitle}>⚠️ Delinquent Accounts</h2><a href="/admin/collections" style={s.viewAll}>View all →</a></div>
        <div style={s.dqGrid}>
          {delinquent.map((acc) => {
            const statusColors: Record<string, string> = { "1_30_late": "#F59E0B", "31_60_late": "#f97316", "61_90_late": "#EF4444", "default": "#EF4444" };
            const statusLabels: Record<string, string> = { "1_30_late": "1-30 Days Late", "31_60_late": "31-60 Days Late", "61_90_late": "61-90 Days Late", "default": "DEFAULT" };
            return (
              <div key={acc.loan_id} style={{ ...s.dqCard, borderLeft: `4px solid ${statusColors[acc.status]}` }}>
                <div style={s.dqHeader}><span style={s.dqName}>{acc.borrower}</span><span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, color: statusColors[acc.status], background: `${statusColors[acc.status]}10`, textTransform: "uppercase" as const }}>{statusLabels[acc.status]}</span></div>
                <div style={s.dqDetails}>
                  <div><span style={s.dqLabel}>University</span><span style={s.dqValue}>{acc.university}</span></div>
                  <div><span style={s.dqLabel}>Overdue</span><span style={{ ...s.dqValue, color: statusColors[acc.status] }}>{formatCAD(acc.amount_overdue)}</span></div>
                  <div><span style={s.dqLabel}>Days Late</span><span style={s.dqValue}>{acc.days_late}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "28px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", marginBottom: "28px" },
  statCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "18px" },
  statTop: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" },
  statIconBg: { width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" },
  statLabel: { fontSize: "12px", color: "#6B7280", fontWeight: 500 },
  statValue: { fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px" },
  section: { marginBottom: "28px" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" },
  sectionTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB" },
  viewAll: { fontSize: "13px", color: "#10B981", fontWeight: 600, textDecoration: "none" },
  tableCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" as const, minWidth: "700px" },
  th: { padding: "14px 16px", fontSize: "12px", fontWeight: 600, color: "#6B7280", textAlign: "left" as const, textTransform: "uppercase" as const, borderBottom: "1px solid rgba(75,85,99,0.2)" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },
  actionBtns: { display: "flex", gap: "8px" },
  approveBtn: { padding: "6px 14px", borderRadius: "6px", background: "rgba(16,185,129,0.12)", color: "#10B981", border: "none", fontSize: "12px", fontWeight: 700, cursor: "pointer" },
  rejectBtn: { padding: "6px 14px", borderRadius: "6px", background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "none", fontSize: "12px", fontWeight: 700, cursor: "pointer" },
  dqGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" },
  dqCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "20px" },
  dqHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  dqName: { fontSize: "15px", fontWeight: 700, color: "#F9FAFB" },
  dqDetails: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" },
  dqLabel: { display: "block", fontSize: "11px", color: "#6B7280", marginBottom: "2px" },
  dqValue: { display: "block", fontSize: "14px", fontWeight: 600, color: "#D1D5DB" },
};
