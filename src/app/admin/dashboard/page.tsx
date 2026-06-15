import DashboardLayout from "@/components/DashboardLayout";
import { formatCAD, formatPercent } from "@/lib/calculations";
import { getProfile, getAdminStats, getAdminPendingLoans, getAdminDelinquentLoans } from "@/lib/data-access";

export default async function AdminDashboard() {
  const profile = await getProfile();
  
  if (!profile) {
    return <div>Not authenticated</div>;
  }

  const stats = await getAdminStats();
  const pendingLoans = await getAdminPendingLoans();
  const delinquentLoans = await getAdminDelinquentLoans();

  const pending = pendingLoans.slice(0, 5);
  const delinquent = delinquentLoans.slice(0, 4);

  const riskColors: Record<string, string> = { green: "#10B981", yellow: "#F59E0B", red: "#EF4444" };
  const riskBg: Record<string, string> = { green: "rgba(16,185,129,0.12)", yellow: "rgba(245,158,11,0.12)", red: "rgba(239,68,68,0.12)" };

  // Calculate random risk for mock display since it's not in DB schema directly yet
  const getRisk = (id: string) => {
    const r = id.charCodeAt(id.length - 1) % 3;
    return r === 0 ? "green" : r === 1 ? "yellow" : "red";
  };

  return (
    <DashboardLayout role="admin" userName={profile.full_name || "Admin User"}>
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
              {pending.map((app) => {
                const risk = getRisk(app.id);
                return (
                  <tr key={app.id}>
                    <td style={{ ...s.td, fontWeight: 600, color: "#F9FAFB" }}>{app.profiles?.full_name || "Unknown"}</td>
                    <td style={s.td}>{app.university_id || "Unspecified"}</td>
                    <td style={{ ...s.td, fontWeight: 600 }}>{formatCAD(Number(app.loan_amount))}</td>
                    <td style={s.td}><span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, background: riskBg[risk], color: riskColors[risk] }}>{risk === "green" ? "● Low" : risk === "yellow" ? "● Medium" : "● High"}</span></td>
                    <td style={s.td}><span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, background: "rgba(16,185,129,0.12)", color: "#10B981", textTransform: "capitalize" as const }}>{app.status.replace("_", " ")}</span></td>
                    <td style={s.td}><div style={s.actionBtns}><button style={s.approveBtn}>Approve</button><button style={s.rejectBtn}>Reject</button></div></td>
                  </tr>
                );
              })}
              {pending.length === 0 && (
                <tr><td colSpan={6} style={{...s.td, textAlign: "center"}}>No pending applications</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.sectionHeader}><h2 style={s.sectionTitle}>⚠️ Delinquent Accounts</h2><a href="/admin/collections" style={s.viewAll}>View all →</a></div>
        <div style={s.dqGrid}>
          {delinquent.map((acc) => {
            const statusColor = acc.status === "defaulted" ? "#EF4444" : "#F59E0B";
            return (
              <div key={acc.id} style={{ ...s.dqCard, borderLeft: `4px solid ${statusColor}` }}>
                <div style={s.dqHeader}>
                  <span style={s.dqName}>{acc.profiles?.full_name || "Unknown"}</span>
                  <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, color: statusColor, background: `${statusColor}10`, textTransform: "uppercase" as const }}>
                    {acc.status}
                  </span>
                </div>
                <div style={s.dqDetails}>
                  <div><span style={s.dqLabel}>University</span><span style={s.dqValue}>Unspecified</span></div>
                  <div><span style={s.dqLabel}>Overdue</span><span style={{ ...s.dqValue, color: statusColor }}>{formatCAD(Number(acc.loan_amount))}</span></div>
                  <div><span style={s.dqLabel}>Days Late</span><span style={s.dqValue}>30+</span></div>
                </div>
              </div>
            );
          })}
          {delinquent.length === 0 && (
            <div style={{...s.dqCard, gridColumn: "1 / -1", textAlign: "center", color: "#6B7280"}}>No delinquent accounts</div>
          )}
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
