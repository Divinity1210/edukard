"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_AGENT_REFERRALS } from "@/lib/mock-data";
import { formatCAD } from "@/lib/calculations";

export default function AgentCommissionsPage() {
  const referrals = MOCK_AGENT_REFERRALS.filter(r => r.commission_earned > 0);
  const totalPaid = referrals.filter(r => r.commission_status === "paid").reduce((sum, r) => sum + r.commission_earned, 0);
  const totalPending = referrals.filter(r => r.commission_status === "pending").reduce((sum, r) => sum + r.commission_earned, 0);

  return (
    <DashboardLayout role="agent" userName="Global Ed Partners">
      <div style={s.header}>
        <div><h1 style={s.title}>Commissions & Payouts</h1><p style={s.subtitle}>Track your referral earnings and payout history.</p></div>
        <button style={s.withdrawBtn} disabled={totalPending === 0}>
          Request Payout ({formatCAD(totalPending)})
        </button>
      </div>

      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={s.statLabel}>Total Earned (All Time)</div>
          <div style={{ ...s.statValue, color: "#F9FAFB" }}>{formatCAD(totalPaid + totalPending)}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>Available for Payout</div>
          <div style={{ ...s.statValue, color: "#10B981" }}>{formatCAD(totalPending)}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>Next Payout Date</div>
          <div style={{ ...s.statValue, color: "#F59E0B" }}>May 1, 2026</div>
        </div>
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Student Name</th>
              <th style={s.th}>Date Earned</th>
              <th style={s.th}>Amount</th>
              <th style={s.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((ref) => (
              <tr key={ref.id}>
                <td style={{ ...s.td, fontWeight: 600 }}>{ref.student_name}</td>
                <td style={s.td}>{new Date(ref.referred_at).toLocaleDateString()}</td>
                <td style={{ ...s.td, fontWeight: 700, color: "#EC4899" }}>{formatCAD(ref.commission_earned)}</td>
                <td style={s.td}>
                  <span style={{
                    ...s.badge,
                    background: ref.commission_status === "paid" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                    color: ref.commission_status === "paid" ? "#10B981" : "#F59E0B"
                  }}>
                    {ref.commission_status.toUpperCase()}
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
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" },
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginTop: "4px" },
  withdrawBtn: { padding: "10px 20px", borderRadius: "10px", background: "#10B981", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" },
  statCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  statValue: { fontSize: "28px", fontWeight: 800, marginTop: "8px" },
  statLabel: { fontSize: "13px", color: "#6B7280", fontWeight: 500 },
  card: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { padding: "14px 20px", textAlign: "left" as const, fontSize: "12px", fontWeight: 600, color: "#6B7280", borderBottom: "1px solid rgba(75,85,99,0.2)", textTransform: "uppercase" as const },
  td: { padding: "16px 20px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },
  badge: { padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" },
};
