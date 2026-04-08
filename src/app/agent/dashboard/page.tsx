"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_AGENT_STATS, MOCK_AGENT_REFERRALS } from "@/lib/mock-data";
import { formatCAD } from "@/lib/calculations";

export default function AgentDashboard() {
  const stats = MOCK_AGENT_STATS;
  const referrals = MOCK_AGENT_REFERRALS;
  const [copied, setCopied] = useState(false);
  const referralLink = "https://edukard.ca/signup?ref=GEP-2026-DM";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout role="agent" userName="Global Ed Partners">
      {/* Welcome Banner */}
      <div style={s.banner}>
        <img src="/images/agent-partnership.png" alt="Education partnership" style={s.bannerImg} />
        <div style={s.bannerOverlay} />
        <div style={s.bannerContent}>
          <h1 style={s.bannerTitle}>Partner Dashboard</h1>
          <p style={s.bannerSub}>Track your student referrals and commission payouts.</p>
        </div>
        <button style={{ ...s.copyBtn, ...(copied ? { background: "rgba(16,185,129,0.15)", borderColor: "rgba(16,185,129,0.3)", color: "#10B981" } : {}) }} onClick={handleCopy}>
          {copied ? "✓ Copied!" : "📋 Copy Referral Link"}
        </button>
      </div>

      <div style={s.statsGrid}>
        {[
          { label: "Total Referrals", value: stats.total_referrals, color: "#F9FAFB" },
          { label: "Active Loans", value: stats.active_loans, color: "#10B981" },
          { label: "Total Earned", value: formatCAD(stats.total_commission), color: "#EC4899" },
          { label: "Pending Payout", value: formatCAD(stats.pending_commission), color: "#F59E0B" },
        ].map((stat) => (
          <div key={stat.label} style={s.statCard}>
            <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 style={s.sectionTitle}>Recent Referrals</h2>
      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Student Name</th>
              <th style={s.th}>University Target</th>
              <th style={s.th}>Loan Status</th>
              <th style={s.th}>Commission Status</th>
              <th style={s.th}>Earned</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((ref) => (
              <tr key={ref.id}>
                <td style={{ ...s.td, fontWeight: 600 }}>{ref.student_name}</td>
                <td style={s.td}>{ref.university_target}</td>
                <td style={s.td}>
                  <span style={s.pill}>{ref.loan_status.replace("_", " ").toUpperCase()}</span>
                </td>
                <td style={s.td}>
                  <span style={{ ...s.pill, color: ref.commission_status === "paid" ? "#10B981" : "#F59E0B" }}>
                    {ref.commission_status.toUpperCase()}
                  </span>
                </td>
                <td style={{ ...s.td, fontWeight: 700, color: "#EC4899" }}>{formatCAD(ref.commission_earned)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
  copyBtn: { position: "relative" as const, zIndex: 1, padding: "10px 20px", borderRadius: "10px", background: "rgba(236,72,153,0.15)", color: "#EC4899", border: "1px solid rgba(236,72,153,0.3)", fontSize: "14px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as const, alignSelf: "flex-end" as const },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" },
  statCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  statValue: { fontSize: "28px", fontWeight: 800, marginBottom: "4px" },
  statLabel: { fontSize: "13px", color: "#6B7280", fontWeight: 500 },
  sectionTitle: { fontSize: "18px", fontWeight: 700, color: "#F9FAFB", marginBottom: "16px" },
  card: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { padding: "14px 20px", textAlign: "left" as const, fontSize: "12px", fontWeight: 600, color: "#6B7280", borderBottom: "1px solid rgba(75,85,99,0.2)", textTransform: "uppercase" as const },
  td: { padding: "16px 20px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },
  pill: { fontSize: "11px", fontWeight: 700, padding: "4px 8px", borderRadius: "6px", background: "rgba(31,41,55,0.4)" },
};
