import DashboardLayout from "@/components/DashboardLayout";
import { getProfile, getInvestorStats, getInvestments, getLiquidityPools } from "@/lib/data-access";
import { formatCAD, formatPercent, calculateAccruedYield } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function InvestorDashboard() {
  const profile = await getProfile();
  
  if (!profile) {
    return <div>Not authenticated</div>;
  }

  const stats = await getInvestorStats(profile.id);
  const investments = await getInvestments(profile.id);
  const pools = await getLiquidityPools();
  
  // Portfolio growth is derived from real holdings: for each of the last 6
  // month-ends we sum principal + yield accrued to that date across all
  // investments. (A daily snapshot cron can later replace this with point-in-time
  // values; until then this reflects actual positions rather than mock figures.)
  const history = Array.from({ length: 6 }).map((_, idx) => {
    const snapshot = new Date();
    snapshot.setMonth(snapshot.getMonth() - (5 - idx));
    const snapMs = snapshot.getTime();
    const value = investments.reduce((sum, inv) => {
      const investedMs = new Date(inv.invested_at).getTime();
      if (investedMs > snapMs) return sum;
      const days = Math.max(0, Math.floor((snapMs - investedMs) / 86400000));
      return (
        sum +
        Number(inv.principal) +
        calculateAccruedYield(Number(inv.principal), Number(inv.target_apy), days)
      );
    }, 0);
    return { date: snapshot.toLocaleDateString("en-CA", { month: "short" }), value };
  });
  const histValues = history.map((h) => h.value);
  const chartMin = Math.min(...histValues) * 0.98;
  const chartMax = Math.max(...histValues) * 1.02;
  const chartRange = chartMax - chartMin;

  const firstName = profile.full_name?.split(" ")[0] || "Investor";

  // Calculate days since investment for daily accrual
  const getDaysSince = (dateStr: string) => Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);

  return (
    <DashboardLayout role="investor" userName={profile.full_name || "Investor"}>
      {/* Welcome Banner */}
      <div style={s.banner}>
        <img src="/images/investor-growth.png" alt="Investment growth" style={s.bannerImg} />
        <div style={s.bannerOverlay} />
        <div style={s.bannerContent}>
          <h1 style={s.title}>Portfolio Overview</h1>
          <p style={s.subtitle}>Your real-world asset backed investment portfolio.</p>
        </div>
        <a href="/investor/invest" style={s.investBtn}>+ New Investment</a>
      </div>

      <div style={s.statsGrid}>
        {[
          { label: "Portfolio Value", value: formatCAD(stats?.portfolio_value || 0), color: "#0D9488", icon: "💎" },
          { label: "Total Invested", value: formatCAD(stats?.total_invested || 0), color: "#10B981", icon: "💰" },
          { label: "Total Yield Earned", value: formatCAD(stats?.total_yield || 0), color: "#10B981", icon: "📈" },
          { label: "Weighted APY", value: formatPercent(stats?.weighted_apy || 0), color: "#F59E0B", icon: "⚡" },
        ].map((stat) => (
          <div key={stat.label} style={s.statCard}>
            <div style={s.statHeader}><span style={{ ...s.statIconBg, background: `${stat.color}10`, color: stat.color }}>{stat.icon}</span><span style={s.statLabel}>{stat.label}</span></div>
            <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* UPCOMING DISTRIBUTIONS */}
      {investments.length > 0 && (
        <div style={s.distSection}>
          <h2 style={s.sectionTitle}>Upcoming Distributions</h2>
          <div style={s.distGrid}>
            {investments.map((inv) => {
              const days = getDaysSince(inv.invested_at);
              const dailyAccrual = calculateAccruedYield(Number(inv.principal), Number(inv.target_apy), 1);
              const nextPayout = inv.tranche === "senior"
                ? "2026-07-01"  // Quarterly
                : "2026-05-01"; // Monthly
              const nextPayoutLabel = inv.tranche === "senior" ? "Quarterly" : "Monthly";
              const estimatedPayout = inv.tranche === "senior"
                ? calculateAccruedYield(Number(inv.principal), Number(inv.target_apy), 90)
                : calculateAccruedYield(Number(inv.principal), Number(inv.target_apy), 30);

              return (
                <div key={inv.id} style={{ ...s.distCard, borderLeft: `4px solid ${inv.tranche === "senior" ? "#10B981" : "#F59E0B"}` }}>
                  <div style={s.distHeader}>
                    <span style={{ fontSize: "20px" }}>{inv.tranche === "senior" ? "🛡️" : "⚡"}</span>
                    <span style={s.distTrancheLabel}>{inv.tranche === "senior" ? "Senior Tranche" : "Junior Tranche"}</span>
                    <span style={{ ...s.distFreq, color: inv.tranche === "senior" ? "#10B981" : "#F59E0B" }}>{nextPayoutLabel}</span>
                  </div>
                  <div style={s.distDetails}>
                    <div>
                      <span style={s.distLabel}>Next Payout Date</span>
                      <span style={s.distValue}>{new Date(nextPayout).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <div>
                      <span style={s.distLabel}>Estimated Amount</span>
                      <span style={{ ...s.distValue, color: "#10B981" }}>~{formatCAD(estimatedPayout)}</span>
                    </div>
                    <div>
                      <span style={s.distLabel}>Today&apos;s Accrual</span>
                      <span style={{ ...s.distValue, color: "#14B8A6" }}>+{formatCAD(dailyAccrual)}/day</span>
                    </div>
                    <div>
                      <span style={s.distLabel}>Days Invested</span>
                      <span style={s.distValue}>{days} days</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Portfolio Growth Chart */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Portfolio Growth</h2>
        <div style={s.chartCard}>
          <div style={s.chartArea}>
            {history.map((point, i) => {
              const height = chartRange > 0 ? ((point.value - chartMin) / chartRange) * 100 : 5;
              return (
                <div key={point.date} style={s.chartCol}>
                  <div style={s.chartBarWrap}><div style={{ ...s.chartBar, height: `${height}%`, animationDelay: `${i * 0.1}s` }} /></div>
                  <span style={s.chartLabel}>{point.date}</span>
                  <span style={s.chartValue}>{formatCAD(point.value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Your Investments */}
      {investments.length > 0 ? (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Your Investments</h2>
          <div style={s.trancheGrid}>
            {investments.map((inv) => {
              const days = getDaysSince(inv.invested_at);
              const dailyAccrual = calculateAccruedYield(Number(inv.principal), Number(inv.target_apy), 1);
              const principal = Number(inv.principal);
              const accruedYield = Number(inv.accrued_yield) || 0;

              return (
                <div key={inv.id} style={{ ...s.trancheCard, borderTop: `4px solid ${inv.tranche === "senior" ? "#10B981" : "#F59E0B"}` }}>
                  <div style={s.trancheHeader}>
                    <span style={{ ...s.trancheBadge, background: inv.tranche === "senior" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", color: inv.tranche === "senior" ? "#10B981" : "#F59E0B" }}>
                      {inv.tranche === "senior" ? "🛡️ Senior Tranche" : "⚡ Junior Tranche"}
                    </span>
                    <span style={{ fontSize: "18px", fontWeight: 800, color: inv.tranche === "senior" ? "#10B981" : "#F59E0B" }}>{inv.target_apy}% APY</span>
                  </div>
                  <div style={s.trancheDetails}>
                    <div><span style={s.tLabel}>Principal</span><span style={s.tValue}>{formatCAD(principal)}</span></div>
                    <div><span style={s.tLabel}>Accrued Yield</span><span style={{ ...s.tValue, color: "#10B981" }}>+{formatCAD(accruedYield)}</span></div>
                    <div><span style={s.tLabel}>Current Value</span><span style={s.tValue}>{formatCAD(principal + accruedYield)}</span></div>
                  </div>

                  <div style={s.accrualRow}>
                    <div style={s.accrualItem}>
                      <span style={s.accrualIcon}>📊</span>
                      <span style={s.accrualLabel}>Daily Accrual</span>
                      <span style={{ ...s.accrualValue, color: "#14B8A6" }}>+{formatCAD(dailyAccrual)}/day</span>
                    </div>
                    <div style={s.accrualItem}>
                      <span style={s.accrualIcon}>📅</span>
                      <span style={s.accrualLabel}>Days Invested</span>
                      <span style={s.accrualValue}>{days} days</span>
                    </div>
                    <div style={s.accrualItem}>
                      <span style={s.accrualIcon}>🔒</span>
                      <span style={s.accrualLabel}>Lock-up</span>
                      <span style={s.accrualValue}>{inv.tranche === "senior" ? "90 days" : "180 days"}</span>
                    </div>
                  </div>

                  <div style={s.trancheFooter}>
                    <span style={s.tDate}>Since {new Date(inv.invested_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <button style={s.withdrawBtn}>Withdraw</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Your Investments</h2>
          <div style={s.chartCard}>
            <p style={{ color: "#9CA3AF" }}>You do not have any active investments.</p>
          </div>
        </div>
      )}

      {/* Pool Health */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Pool Health</h2>
        <div style={s.poolGrid}>
          {pools.map((pool) => {
            const utilization = Number(pool.utilization_ratio) || 0;
            return (
              <div key={pool.id} style={s.poolCard}>
                <div style={s.poolHeader}><span style={s.poolName}>{pool.tranche === "senior" ? "🛡️ Senior Pool" : "⚡ Junior Pool"}</span><span style={s.poolApy}>{pool.target_apy}% APY</span></div>
                <div style={s.poolMeter}>
                  <div style={s.poolMeterHeader}><span>Utilization</span><span style={{ color: utilization > 90 ? "#EF4444" : "#10B981", fontWeight: 700 }}>{utilization}%</span></div>
                  <div style={s.poolTrack}><div style={{ height: "100%", borderRadius: "100px", width: `${utilization}%`, background: utilization > 90 ? "#EF4444" : utilization > 75 ? "#F59E0B" : "#10B981", transition: "width 1s ease" }} /></div>
                </div>
                <div style={s.poolStats}>
                  <div><span style={s.psLabel}>Total</span><span style={s.psValue}>{formatCAD(Number(pool.total_capital))}</span></div>
                  <div><span style={s.psLabel}>Deployed</span><span style={s.psValue}>{formatCAD(Number(pool.deployed_capital))}</span></div>
                  <div><span style={s.psLabel}>Available</span><span style={{ ...s.psValue, color: "#10B981" }}>{formatCAD(Number(pool.available_capital))}</span></div>
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
  banner: { position: "relative" as const, borderRadius: "16px", overflow: "hidden", marginBottom: "28px", height: "180px", display: "flex", alignItems: "flex-end", padding: "28px 32px" },
  bannerImg: { position: "absolute" as const, top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" as const },
  bannerOverlay: { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(90deg, rgba(10,15,30,0.85) 40%, rgba(10,15,30,0.3) 100%)" },
  bannerContent: { position: "relative" as const, zIndex: 1, flex: 1 },
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "15px", color: "#D1D5DB", marginTop: "4px" },
  investBtn: { position: "relative" as const, zIndex: 1, display: "inline-flex", padding: "10px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #14B8A6, #0D9488)", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" as const, alignSelf: "flex-end" as const },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" },
  statCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "20px" },
  statHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" },
  statIconBg: { width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" },
  statLabel: { fontSize: "13px", color: "#6B7280", fontWeight: 500 },
  statValue: { fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" },

  /* Upcoming Distributions */
  distSection: { marginBottom: "28px" },
  sectionTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "14px" },
  distGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "14px" },
  distCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "22px" },
  distHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" },
  distTrancheLabel: { fontSize: "15px", fontWeight: 700, color: "#F9FAFB", flex: 1 },
  distFreq: { fontSize: "12px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", background: "rgba(31,41,55,0.4)" },
  distDetails: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  distLabel: { display: "block", fontSize: "11px", color: "#6B7280", marginBottom: "2px" },
  distValue: { display: "block", fontSize: "15px", fontWeight: 700, color: "#F9FAFB" },

  /* Chart */
  section: { marginBottom: "28px" },
  chartCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  chartArea: { display: "flex", alignItems: "flex-end", gap: "16px", height: "180px" },
  chartCol: { flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "6px", height: "100%" },
  chartBarWrap: { flex: 1, width: "100%", display: "flex", alignItems: "flex-end" },
  chartBar: { width: "100%", background: "linear-gradient(180deg, #0D9488, #14B8A6)", borderRadius: "6px 6px 0 0", minHeight: "6px", animation: "fadeInUp 0.6s ease forwards", opacity: 0 },
  chartLabel: { fontSize: "11px", color: "#6B7280" },
  chartValue: { fontSize: "11px", color: "#6B7280", fontWeight: 600 },

  /* Investments */
  trancheGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" },
  trancheCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  trancheHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  trancheBadge: { padding: "6px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 700 },
  trancheDetails: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" },
  tLabel: { display: "block", fontSize: "12px", color: "#6B7280" },
  tValue: { display: "block", fontSize: "16px", fontWeight: 700, color: "#F9FAFB" },

  /* Daily Accrual Row */
  accrualRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", padding: "14px 16px", borderRadius: "10px", background: "rgba(31,41,55,0.3)", marginBottom: "16px" },
  accrualItem: { display: "flex", flexDirection: "column" as const, gap: "2px" },
  accrualIcon: { fontSize: "14px" },
  accrualLabel: { fontSize: "11px", color: "#6B7280" },
  accrualValue: { fontSize: "13px", fontWeight: 700, color: "#F9FAFB" },

  trancheFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid rgba(75,85,99,0.15)" },
  tDate: { fontSize: "12px", color: "#6B7280" },
  withdrawBtn: { padding: "8px 20px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(17,24,39,0.6)", color: "#6B7280", fontSize: "13px", fontWeight: 600, cursor: "pointer" },

  /* Pool Health */
  poolGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" },
  poolCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  poolHeader: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
  poolName: { fontSize: "16px", fontWeight: 700, color: "#F9FAFB" },
  poolApy: { fontSize: "14px", fontWeight: 700, color: "#10B981" },
  poolMeter: { marginBottom: "20px" },
  poolMeterHeader: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6B7280", marginBottom: "8px" },
  poolTrack: { height: "8px", borderRadius: "100px", background: "rgba(31,41,55,0.4)" },
  poolStats: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" },
  psLabel: { display: "block", fontSize: "11px", color: "#6B7280", marginBottom: "4px" },
  psValue: { display: "block", fontSize: "14px", fontWeight: 700, color: "#F9FAFB" },
};
