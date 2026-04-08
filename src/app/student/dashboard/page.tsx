"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_STUDENT_STATS, MOCK_LOAN, MOCK_REPAYMENT_SCHEDULE } from "@/lib/mock-data";
import { formatCAD, formatDate } from "@/lib/calculations";

export default function StudentDashboard() {
  const stats = MOCK_STUDENT_STATS;
  const loan = MOCK_LOAN;
  const schedule = MOCK_REPAYMENT_SCHEDULE;

  return (
    <DashboardLayout role="student" userName="Amara Okafor">
      {/* Welcome Banner */}
      <div style={s.banner}>
        <img src="/images/student-studying.png" alt="Student studying" style={s.bannerImg} />
        <div style={s.bannerOverlay} />
        <div style={s.bannerContent}>
          <h1 style={s.bannerTitle}>Welcome back, Amara 👋</h1>
          <p style={s.bannerSub}>Here&apos;s your tuition financing overview.</p>
        </div>
        <a href="/student/apply" style={s.applyBtn}>+ New Application</a>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        {[
          { label: "Total Borrowed", value: formatCAD(stats.total_borrowed), icon: "🎓", color: "#10B981" },
          { label: "Total Paid", value: formatCAD(stats.total_paid), icon: "✅", color: "#10B981" },
          { label: "Remaining Balance", value: formatCAD(stats.remaining_balance), icon: "📊", color: "#F59E0B" },
          { label: "Next Payment", value: formatCAD(stats.next_payment_amount), sub: `Due: ${formatDate(stats.next_payment_date)}`, icon: "📅", color: "#7C3AED" },
        ].map((stat) => (
          <div key={stat.label} style={s.statCard}>
            <div style={s.statHeader}><span style={{ ...s.statIconBg, background: `${stat.color}10`, color: stat.color }}>{stat.icon}</span><span style={s.statLabel}>{stat.label}</span></div>
            <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
            {stat.sub && <div style={s.statSub}>{stat.sub}</div>}
          </div>
        ))}
      </div>

      {/* Active Loan Card */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Active Loan</h2>
        <div style={s.loanCard}>
          <div style={s.loanHeader}>
            <div>
              <div style={s.loanUni}>{loan.university_name}</div>
              <div style={s.loanId}>Loan #{loan.id} · Student ID: {loan.student_id_number}</div>
            </div>
            <span style={s.statusBadge}>● {loan.status.replace("_", " ").toUpperCase()}</span>
          </div>
          <div style={s.loanDetails}>
            {[
              { l: "Loan Amount", v: formatCAD(loan.loan_amount) },
              { l: "APR", v: `${loan.apr}%` },
              { l: "Term", v: `${loan.term_months} months` },
              { l: "Monthly Payment", v: formatCAD(loan.monthly_payment) },
              { l: "Total Cost", v: formatCAD(loan.total_cost) },
            ].map((d) => (
              <div key={d.l} style={s.loanDetail}><span style={s.detailLabel}>{d.l}</span><span style={s.detailValue}>{d.v}</span></div>
            ))}
          </div>
          <div style={s.progressSection}>
            <div style={s.progressHeader}><span>Repayment Progress</span><span style={s.progressPct}>{((stats.total_paid / stats.total_borrowed) * 100).toFixed(1)}%</span></div>
            <div style={s.progressTrack}><div style={{ ...s.progressBar, width: `${(stats.total_paid / stats.total_borrowed) * 100}%` }} /></div>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Payment Schedule</h2>
        <div style={s.tableCard}>
          <table style={s.table}>
            <thead><tr>
              {["#", "Due Date", "Principal", "Interest", "Total", "Balance", "Status"].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.id}>
                  <td style={s.td}>{row.payment_number}</td>
                  <td style={s.td}>{formatDate(row.due_date)}</td>
                  <td style={s.td}>{formatCAD(row.principal)}</td>
                  <td style={s.td}>{formatCAD(row.interest)}</td>
                  <td style={{ ...s.td, fontWeight: 600 }}>{formatCAD(row.total_payment)}</td>
                  <td style={s.td}>{formatCAD(row.remaining_balance)}</td>
                  <td style={s.td}>
                    <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, background: row.status === "completed" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", color: row.status === "completed" ? "#10B981" : "#F59E0B" }}>
                      {row.status === "completed" ? "✓ Paid" : "Upcoming"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  banner: { position: "relative" as const, borderRadius: "16px", overflow: "hidden", marginBottom: "28px", height: "180px", display: "flex", alignItems: "flex-end", padding: "28px 32px" },
  bannerImg: { position: "absolute" as const, top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" as const },
  bannerOverlay: { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(90deg, rgba(10,15,30,0.85) 40%, rgba(10,15,30,0.3) 100%)" },
  bannerContent: { position: "relative" as const, zIndex: 1, flex: 1 },
  bannerTitle: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB", letterSpacing: "-0.5px" },
  bannerSub: { fontSize: "15px", color: "#D1D5DB", marginTop: "4px" },
  applyBtn: { position: "relative" as const, zIndex: 1, display: "inline-flex", padding: "10px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" as const, alignSelf: "flex-end" as const },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" },
  statCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "20px" },
  statHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" },
  statIconBg: { width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" },
  statLabel: { fontSize: "13px", color: "#6B7280", fontWeight: 500 },
  statValue: { fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" },
  statSub: { fontSize: "12px", color: "#6B7280", marginTop: "4px" },
  section: { marginBottom: "28px" },
  sectionTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "14px" },
  loanCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  loanHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  loanUni: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB" },
  loanId: { fontSize: "13px", color: "#6B7280", marginTop: "4px" },
  statusBadge: { padding: "6px 14px", borderRadius: "100px", background: "rgba(16,185,129,0.12)", color: "#10B981", fontSize: "12px", fontWeight: 700 },
  loanDetails: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "20px" },
  loanDetail: { display: "flex", flexDirection: "column" as const, gap: "4px" },
  detailLabel: { fontSize: "12px", color: "#6B7280" },
  detailValue: { fontSize: "16px", fontWeight: 700, color: "#F9FAFB" },
  progressSection: {},
  progressHeader: { display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", color: "#6B7280" },
  progressPct: { fontWeight: 700, color: "#10B981" },
  progressTrack: { height: "8px", borderRadius: "100px", background: "rgba(31,41,55,0.4)" },
  progressBar: { height: "100%", borderRadius: "100px", background: "linear-gradient(90deg, #10B981, #3B82F6)", transition: "width 1s ease" },
  tableCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" as const, minWidth: "650px" },
  th: { padding: "14px 16px", fontSize: "12px", fontWeight: 600, color: "#6B7280", textAlign: "left" as const, textTransform: "uppercase" as const, letterSpacing: "0.5px", borderBottom: "1px solid rgba(75,85,99,0.2)" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },
};
