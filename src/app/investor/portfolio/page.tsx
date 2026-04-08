"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_INVESTMENTS, MOCK_PORTFOLIO_HISTORY } from "@/lib/mock-data";
import { formatCAD } from "@/lib/calculations";

export default function PortfolioPage() {
  const investments = MOCK_INVESTMENTS;
  const history = MOCK_PORTFOLIO_HISTORY;

  const allTransactions = [
    { date: "Apr 1, 2026", type: "Yield Distribution", amount: 341.10, tranche: "Senior" },
    { date: "Apr 1, 2026", type: "Yield Distribution", amount: 291.78, tranche: "Junior" },
    { date: "Mar 1, 2026", type: "Yield Distribution", amount: 333.33, tranche: "Senior" },
    { date: "Mar 1, 2026", type: "Yield Distribution", amount: 287.67, tranche: "Junior" },
    { date: "Jan 20, 2026", type: "Investment", amount: 25000, tranche: "Junior" },
    { date: "Jan 15, 2026", type: "Investment", amount: 50000, tranche: "Senior" },
  ];

  return (
    <DashboardLayout role="investor" userName="Marcus Chen">
      <h1 style={s.title}>Portfolio Details</h1>
      <p style={s.subtitle}>Detailed view of your investment allocations and transaction history.</p>

      {/* Portfolio chart */}
      <div style={s.chartCard}>
        <h2 style={s.cardTitle}>Portfolio Growth</h2>
        <div style={s.chartArea}>
          {history.map((p, i) => {
            const min = 74000; const max = 79000;
            const h = ((p.value - min) / (max - min)) * 100;
            return (
              <div key={p.date} style={s.chartCol}>
                <div style={s.chartBarWrap}><div style={{ ...s.chartBar, height: `${h}%`, animationDelay: `${i * 0.1}s` }} /></div>
                <span style={s.chartLabel}>{p.date}</span>
                <span style={s.chartValue}>{formatCAD(p.value)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Holdings */}
      <div style={s.section}>
        <h2 style={s.cardTitle}>Current Holdings</h2>
        <div style={s.holdingsGrid}>
          {investments.map((inv) => (
            <div key={inv.id} style={{ ...s.holdingCard, borderTop: `4px solid ${inv.tranche === "senior" ? "#10B981" : "#F59E0B"}` }}>
              <div style={s.holdingHeader}><span style={s.holdingBadge}>{inv.tranche === "senior" ? "🛡️ Senior" : "⚡ Junior"}</span><span style={{ color: inv.tranche === "senior" ? "#10B981" : "#F59E0B", fontWeight: 800, fontSize: "18px" }}>{inv.target_apy}% APY</span></div>
              <div style={s.holdingDetails}>
                <div><span style={s.hdLabel}>Principal</span><span style={s.hdValue}>{formatCAD(inv.principal)}</span></div>
                <div><span style={s.hdLabel}>Yield</span><span style={{ ...s.hdValue, color: "#10B981" }}>+{formatCAD(inv.accrued_yield)}</span></div>
                <div><span style={s.hdLabel}>Total</span><span style={s.hdValue}>{formatCAD(inv.principal + inv.accrued_yield)}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div style={s.section}>
        <h2 style={s.cardTitle}>Transaction History</h2>
        <div style={s.tableCard}>
          <table style={s.table}>
            <thead><tr>{["Date", "Type", "Tranche", "Amount"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {allTransactions.map((tx, i) => (
                <tr key={i}>
                  <td style={s.td}>{tx.date}</td>
                  <td style={s.td}><span style={{ ...s.typeBadge, background: tx.type === "Investment" ? "rgba(59,130,246,0.12)" : "rgba(16,185,129,0.12)", color: tx.type === "Investment" ? "#10B981" : "#10B981" }}>{tx.type}</span></td>
                  <td style={s.td}>{tx.tranche}</td>
                  <td style={{ ...s.td, fontWeight: 600, color: tx.type === "Investment" ? "#111827" : "#10B981" }}>{tx.type === "Investment" ? formatCAD(tx.amount) : `+${formatCAD(tx.amount)}`}</td>
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
  chartCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px", marginBottom: "28px" },
  cardTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "16px" },
  chartArea: { display: "flex", alignItems: "flex-end", gap: "16px", height: "180px" },
  chartCol: { flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "6px", height: "100%" },
  chartBarWrap: { flex: 1, width: "100%", display: "flex", alignItems: "flex-end" },
  chartBar: { width: "100%", background: "linear-gradient(180deg, #0D9488, #14B8A6)", borderRadius: "6px 6px 0 0", minHeight: "6px", animation: "fadeInUp 0.6s ease forwards", opacity: 0 },
  chartLabel: { fontSize: "11px", color: "#6B7280" },
  chartValue: { fontSize: "11px", color: "#6B7280", fontWeight: 600 },
  section: { marginBottom: "28px" },
  holdingsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  holdingCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  holdingHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  holdingBadge: { fontSize: "14px", fontWeight: 700, color: "#F9FAFB" },
  holdingDetails: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" },
  hdLabel: { display: "block", fontSize: "12px", color: "#6B7280", marginBottom: "2px" },
  hdValue: { display: "block", fontSize: "16px", fontWeight: 700, color: "#F9FAFB" },
  tableCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { padding: "14px 16px", fontSize: "12px", fontWeight: 600, color: "#6B7280", textAlign: "left" as const, textTransform: "uppercase" as const, borderBottom: "1px solid rgba(75,85,99,0.2)" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },
  typeBadge: { padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 },
};
