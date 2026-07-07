import DashboardLayout from "@/components/DashboardLayout";
import { getProfile, getTreasuryData, getOriginationsPaused } from "@/lib/data-access";
import { formatCAD, formatPercent } from "@/lib/calculations";
import OriginationToggle from "./OriginationToggle";

export const dynamic = "force-dynamic";

type PoolRow = { id: string; tranche: "senior" | "junior"; target_apy: number };

export default async function TreasuryPage() {
  const profile = await getProfile();
  const t = await getTreasuryData();
  const originationsPaused = await getOriginationsPaused();

  const totalTVL = t.total_capital;
  const totalDeployed = t.deployed_capital;
  const overallUtil = totalTVL > 0 ? Math.round((totalDeployed / totalTVL) * 100) : 0;

  // Deployment isn't tracked per-tranche yet, so allocate the live deployed
  // total proportionally to each pool's capital (reasonable pilot approximation).
  const pools = (t.pools as PoolRow[]).map((p) => {
    const capital = p.tranche === "senior" ? t.senior_capital : t.junior_capital;
    const deployed = totalTVL > 0 ? totalDeployed * (capital / totalTVL) : 0;
    const available = Math.max(0, capital - deployed);
    const utilization_ratio = capital > 0 ? Math.round((deployed / capital) * 100) : 0;
    return { id: p.id, tranche: p.tranche, target_apy: p.target_apy, total_capital: capital, deployed_capital: deployed, available_capital: available, utilization_ratio };
  });

  return (
    <DashboardLayout role="admin" userName={profile?.full_name || "Admin User"}>
      <h1 style={s.title}>Treasury & Liquidity</h1>
      <p style={s.subtitle}>Monitor protocol liquidity, pool utilization, and manage origination controls.</p>

      {overallUtil > 80 && (
        <div style={s.alert}>⚠️ <strong>Utilization Warning:</strong> Overall pool utilization is at {overallUtil}%. Consider monitoring incoming deposits before approving new originations.</div>
      )}

      <div style={s.statsGrid}>
        {[
          { icon: "🔒", value: formatCAD(totalTVL), label: "Total TVL" },
          { icon: "📤", value: formatCAD(totalDeployed), label: "Deployed Capital" },
          { icon: "📊", value: formatPercent(overallUtil), label: "Overall Utilization", color: overallUtil > 90 ? "#EF4444" : "#10B981" },
          { icon: "💰", value: formatCAD(t.available_capital), label: "Available Liquidity", color: "#10B981" },
        ].map((stat) => (
          <div key={stat.label} style={s.statCard}>
            <span style={s.statIcon}>{stat.icon}</span>
            <span style={{ ...s.statValue, color: stat.color || "#F9FAFB" }}>{stat.value}</span>
            <span style={s.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Pool Details</h2>
        {pools.length === 0 && (
          <div style={s.controlCard}><p style={{ color: "#9CA3AF" }}>No liquidity pools configured. Run supabase/seed.sql.</p></div>
        )}
        <div style={s.poolGrid}>
          {pools.map((pool) => (
            <div key={pool.id} style={s.poolCard}>
              <h3 style={s.poolName}>{pool.tranche === "senior" ? "🛡️ Senior Pool" : "⚡ Junior Pool"}</h3>
              <div style={s.meter}>
                <div style={s.meterRow}><span>Utilization</span><span style={{ fontWeight: 700, color: pool.utilization_ratio > 90 ? "#EF4444" : "#10B981" }}>{pool.utilization_ratio}%</span></div>
                <div style={s.track}><div style={{ height: "100%", borderRadius: "100px", width: `${pool.utilization_ratio}%`, background: pool.utilization_ratio > 90 ? "#EF4444" : pool.utilization_ratio > 75 ? "#F59E0B" : "#10B981" }} /></div>
              </div>
              <div style={s.poolDetails}>
                <div><span style={s.pdLabel}>Total</span><span style={s.pdValue}>{formatCAD(pool.total_capital)}</span></div>
                <div><span style={s.pdLabel}>Deployed</span><span style={s.pdValue}>{formatCAD(pool.deployed_capital)}</span></div>
                <div><span style={s.pdLabel}>Available</span><span style={{ ...s.pdValue, color: "#10B981" }}>{formatCAD(pool.available_capital)}</span></div>
                <div><span style={s.pdLabel}>Target APY</span><span style={s.pdValue}>{pool.target_apy}%</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Origination Controls</h2>
        <OriginationToggle initialPaused={originationsPaused} />
      </div>
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "24px" },
  alert: { padding: "14px 20px", borderRadius: "12px", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B", fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "28px" },
  statCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "20px", textAlign: "center" as const },
  statIcon: { fontSize: "24px", display: "block", marginBottom: "8px" },
  statValue: { display: "block", fontSize: "24px", fontWeight: 800, color: "#F9FAFB" },
  statLabel: { display: "block", fontSize: "12px", color: "#6B7280", marginTop: "4px" },
  section: { marginBottom: "28px" },
  sectionTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "14px" },
  poolGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "14px" },
  poolCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  poolName: { fontSize: "16px", fontWeight: 700, color: "#F9FAFB", marginBottom: "16px" },
  meter: { marginBottom: "20px" },
  meterRow: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6B7280", marginBottom: "8px" },
  track: { height: "8px", borderRadius: "100px", background: "rgba(31,41,55,0.4)" },
  poolDetails: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  pdLabel: { display: "block", fontSize: "11px", color: "#6B7280", marginBottom: "2px" },
  pdValue: { display: "block", fontSize: "15px", fontWeight: 700, color: "#F9FAFB" },
  controlCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
};
