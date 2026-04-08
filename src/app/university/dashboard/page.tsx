"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_UNIVERSITY_STATS, MOCK_UNIVERSITY_INVOICES, MOCK_UNIVERSITY_SETTLEMENTS } from "@/lib/mock-data";
import { formatCAD } from "@/lib/calculations";

export default function UniversityDashboard() {
  const stats = MOCK_UNIVERSITY_STATS;
  const invoices = MOCK_UNIVERSITY_INVOICES.slice(0, 5);
  const settlements = MOCK_UNIVERSITY_SETTLEMENTS.slice(0, 3);

  return (
    <DashboardLayout role="university" userName="UofT Bursar">
      {/* Welcome Banner */}
      <div style={s.banner}>
        <img src="/images/university-campus.png" alt="University campus" style={s.bannerImg} />
        <div style={s.bannerOverlay} />
        <div style={s.bannerContent}>
          <h1 style={s.bannerTitle}>Institution Dashboard</h1>
          <p style={s.bannerSub}>Overview of EduKard tuition disbursements and pending invoices.</p>
        </div>
      </div>

      <div style={s.statsGrid}>
        {[
          { label: "Total Students Funded", value: stats.total_students, color: "#10B981" },
          { label: "Total Disbursed (YTD)", value: formatCAD(stats.total_disbursed), color: "#F59E0B" },
          { label: "Pending Invoices", value: stats.pending_invoices, color: "#EF4444" },
          { label: "Incoming Settlements", value: stats.settlements_processing, color: "#3B82F6" },
        ].map((stat) => (
          <div key={stat.label} style={s.statCard}>
            <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={s.grid}>
        <div style={s.card}>
          <div style={s.headerRow}>
            <h2 style={s.sectionTitle}>Recent Invoices</h2>
            <a href="/university/invoices" style={s.link}>View All</a>
          </div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Student</th>
                <th style={s.th}>Program</th>
                <th style={s.th}>Amount</th>
                <th style={s.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td style={s.td}><div>{inv.student_name}</div><div style={s.subText}>{inv.student_id}</div></td>
                  <td style={s.td}>{inv.program_name}</td>
                  <td style={s.td}>{formatCAD(inv.tuition_amount)}</td>
                  <td style={s.td}>
                    <span style={{
                      ...s.badge,
                      background: inv.status === "settled" ? "rgba(16,185,129,0.12)" : inv.status === "matched" ? "rgba(59,130,246,0.12)" : "rgba(245,158,11,0.12)",
                      color: inv.status === "settled" ? "#10B981" : inv.status === "matched" ? "#3B82F6" : "#F59E0B"
                    }}>
                      {inv.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={s.card}>
          <div style={s.headerRow}>
            <h2 style={s.sectionTitle}>Recent Settlements</h2>
            <a href="/university/settlements" style={s.link}>View All</a>
          </div>
          <div style={s.list}>
            {settlements.map((set) => (
              <div key={set.id} style={s.listItem}>
                <div>
                  <div style={s.itemTitle}>{formatCAD(set.amount)} {set.currency}</div>
                  <div style={s.itemDesc}>{set.student_count} students • {new Date(set.date).toLocaleDateString()}</div>
                </div>
                <span style={{
                  ...s.badge,
                  background: set.status === "completed" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                  color: set.status === "completed" ? "#10B981" : "#F59E0B"
                }}>
                  {set.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
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
  bannerTitle: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  bannerSub: { fontSize: "15px", color: "#D1D5DB", marginTop: "4px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" },
  statCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  statValue: { fontSize: "28px", fontWeight: 800, marginBottom: "4px" },
  statLabel: { fontSize: "13px", color: "#6B7280", fontWeight: 500 },
  grid: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" },
  card: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  sectionTitle: { fontSize: "16px", fontWeight: 700, color: "#F9FAFB" },
  link: { fontSize: "13px", color: "#F59E0B", textDecoration: "none", fontWeight: 600 },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { padding: "12px 16px", textAlign: "left" as const, fontSize: "12px", fontWeight: 600, color: "#6B7280", borderBottom: "1px solid rgba(75,85,99,0.2)" },
  td: { padding: "16px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },
  subText: { fontSize: "11px", color: "#6B7280", marginTop: "2px" },
  badge: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" },
  list: { display: "flex", flexDirection: "column" as const, gap: "12px" },
  listItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", borderRadius: "10px", background: "rgba(31,41,55,0.4)" },
  itemTitle: { fontSize: "15px", fontWeight: 700, color: "#F9FAFB" },
  itemDesc: { fontSize: "12px", color: "#6B7280", marginTop: "4px" },
};
