import DashboardLayout from "@/components/DashboardLayout";
import { getProfile, getDeposits } from "@/lib/data-access";
import { formatCAD, formatDate } from "@/lib/calculations";
import DepositClient from "./DepositClient";

export const dynamic = "force-dynamic";

export default async function DepositPage() {
  const profile = await getProfile();
  const deposits = profile ? await getDeposits(profile.id) : [];

  const totalDeposited = deposits.filter((d) => d.status === "confirmed").reduce((s, d) => s + Number(d.amount), 0);
  const pendingAmount = deposits.filter((d) => d.status === "processing" || d.status === "pending").reduce((s, d) => s + Number(d.amount), 0);

  return (
    <DashboardLayout role="investor" userName={profile?.full_name || "Investor"}>
      <h1 style={s.title}>Deposit Funds</h1>
      <p style={s.subtitle}>Convert fiat to USDC purchasing power in the protocol. We handle the conversion silently.</p>

      <div style={s.balanceGrid}>
        <div style={s.balanceCard}>
          <span style={s.balanceIcon}>💰</span>
          <span style={s.balanceLabel}>Total Deposited</span>
          <span style={{ ...s.balanceValue, color: "#10B981" }}>{formatCAD(totalDeposited)}</span>
          <span style={s.balanceSub}>USDC equivalent: ${totalDeposited.toLocaleString()} USDC</span>
        </div>
        <div style={s.balanceCard}>
          <span style={s.balanceIcon}>⏳</span>
          <span style={s.balanceLabel}>Pending</span>
          <span style={{ ...s.balanceValue, color: "#F59E0B" }}>{formatCAD(pendingAmount)}</span>
          <span style={s.balanceSub}>Processing — typically 1–2 business days</span>
        </div>
        <div style={s.balanceCard}>
          <span style={s.balanceIcon}>⚡</span>
          <span style={s.balanceLabel}>Available to Invest</span>
          <span style={{ ...s.balanceValue, color: "#14B8A6" }}>{formatCAD(totalDeposited)}</span>
          <span style={s.balanceSub}>Ready for tranche allocation</span>
        </div>
      </div>

      <DepositClient />

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Deposit History</h2>
        <div style={s.tableCard}>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Date</th><th style={s.th}>Method</th><th style={s.th}>Amount</th><th style={s.th}>USDC</th><th style={s.th}>Status</th></tr></thead>
            <tbody>
              {deposits.length === 0 && (
                <tr><td style={{ ...s.td, textAlign: "center", color: "#6B7280" }} colSpan={5}>No deposits yet.</td></tr>
              )}
              {deposits.map((d) => (
                <tr key={d.id}>
                  <td style={s.td}>{formatDate(d.initiated_at)}</td>
                  <td style={s.td}><span style={s.methodBadge}>{String(d.method).toUpperCase()}</span></td>
                  <td style={{ ...s.td, fontWeight: 600, color: "#F9FAFB" }}>{formatCAD(Number(d.amount))}</td>
                  <td style={s.td}>${Number(d.usdc_equivalent).toLocaleString()}</td>
                  <td style={s.td}>
                    <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, background: d.status === "confirmed" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", color: d.status === "confirmed" ? "#10B981" : "#F59E0B" }}>
                      {d.status === "confirmed" ? "✓ Confirmed" : d.status === "failed" ? "Failed" : "Processing"}
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
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "28px" },
  balanceGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "28px" },
  balanceCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column" as const, gap: "4px" },
  balanceIcon: { fontSize: "24px" },
  balanceLabel: { fontSize: "12px", color: "#6B7280", fontWeight: 500 },
  balanceValue: { fontSize: "24px", fontWeight: 800 },
  balanceSub: { fontSize: "12px", color: "#6B7280" },
  section: { marginBottom: "28px" },
  sectionTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "14px" },
  tableCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { padding: "14px 16px", fontSize: "12px", fontWeight: 600, color: "#6B7280", textAlign: "left" as const, textTransform: "uppercase" as const, borderBottom: "1px solid rgba(75,85,99,0.2)" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },
  methodBadge: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, background: "rgba(20,184,166,0.12)", color: "#14B8A6", letterSpacing: "0.5px" },
};
