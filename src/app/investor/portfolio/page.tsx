import DashboardLayout from "@/components/DashboardLayout";
import { getProfile, getInvestments } from "@/lib/data-access";
import { formatCAD, calculateAccruedYield } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const profile = await getProfile();

  if (!profile) {
    return <div>Not authenticated</div>;
  }

  const investments = await getInvestments(profile.id);

  // Portfolio growth derived from real holdings (principal + accrued yield at
  // each month-end). Replace with a snapshot cron later for exact point-in-time.
  const history = Array.from({ length: 6 }).map((_, idx) => {
    const snapshot = new Date();
    snapshot.setMonth(snapshot.getMonth() - (5 - idx));
    const snapMs = snapshot.getTime();
    const value = investments.reduce((sum, inv) => {
      const investedMs = new Date(inv.invested_at).getTime();
      if (investedMs > snapMs) return sum;
      const days = Math.max(0, Math.floor((snapMs - investedMs) / 86400000));
      return sum + Number(inv.principal) + calculateAccruedYield(Number(inv.principal), Number(inv.target_apy), days);
    }, 0);
    return { date: snapshot.toLocaleDateString("en-CA", { month: "short" }), value };
  });
  const histValues = history.map((h) => h.value);
  const chartMin = Math.min(...histValues) * 0.98;
  const chartMax = Math.max(...histValues) * 1.02;
  const chartRange = chartMax - chartMin;

  // Transaction history derived from real investments (a full ledger of yield
  // distributions/withdrawals can be added as those events are recorded).
  const allTransactions = investments
    .map((inv) => ({
      date: new Date(inv.invested_at).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" }),
      type: "Investment",
      amount: Number(inv.principal),
      tranche: inv.tranche === "senior" ? "Senior" : "Junior",
      ts: new Date(inv.invested_at).getTime(),
    }))
    .sort((a, b) => b.ts - a.ts);

  return (
    <DashboardLayout role="investor" userName={profile.full_name || "Investor"}>
      <h1 style={s.title}>Portfolio Details</h1>
      <p style={s.subtitle}>Detailed view of your investment allocations and transaction history.</p>

      {/* Portfolio chart */}
      <div style={s.chartCard}>
        <h2 style={s.cardTitle}>Portfolio Growth</h2>
        <div style={s.chartArea}>
          {history.map((p, i) => {
            const h = chartRange > 0 ? ((p.value - chartMin) / chartRange) * 100 : 5;
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
        {investments.length > 0 ? (
          <div style={s.holdingsGrid}>
            {investments.map((inv) => {
              const principal = Number(inv.principal);
              const accruedYield = Number(inv.accrued_yield) || 0;
              return (
                <div key={inv.id} style={{ ...s.holdingCard, borderTop: `4px solid ${inv.tranche === "senior" ? "#10B981" : "#F59E0B"}` }}>
                  <div style={s.holdingHeader}><span style={s.holdingBadge}>{inv.tranche === "senior" ? "🛡️ Senior" : "⚡ Junior"}</span><span style={{ color: inv.tranche === "senior" ? "#10B981" : "#F59E0B", fontWeight: 800, fontSize: "18px" }}>{inv.target_apy}% APY</span></div>
                  <div style={s.holdingDetails}>
                    <div><span style={s.hdLabel}>Principal</span><span style={s.hdValue}>{formatCAD(principal)}</span></div>
                    <div><span style={s.hdLabel}>Yield</span><span style={{ ...s.hdValue, color: "#10B981" }}>+{formatCAD(accruedYield)}</span></div>
                    <div><span style={s.hdLabel}>Total</span><span style={s.hdValue}>{formatCAD(principal + accruedYield)}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={s.holdingCard}>
            <p style={{ color: "#9CA3AF" }}>You do not have any current holdings.</p>
          </div>
        )}
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
