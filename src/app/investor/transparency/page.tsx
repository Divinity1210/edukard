import DashboardLayout from "@/components/DashboardLayout";
import { getProfile, getTreasuryData, getProtocolStats } from "@/lib/data-access";
import { formatCAD, formatPercent } from "@/lib/calculations";
import AddressRow from "./AddressRow";

export const dynamic = "force-dynamic";

type PoolRow = { id: string; tranche: "senior" | "junior"; target_apy: number };

// On-chain contract references are sourced from env. In the Circle custodial
// pilot no tranche-token contracts are deployed, so this is empty by default;
// populate when/if on-chain contracts ship.
function contractsFromEnv() {
  const raw = process.env.NEXT_PUBLIC_ONCHAIN_CONTRACTS;
  if (!raw) return [] as { name: string; address: string; chain: string; explorer: string }[];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default async function TransparencyPage() {
  const profile = await getProfile();
  const t = await getTreasuryData();
  const stats = await getProtocolStats();
  const contracts = contractsFromEnv();

  const pools = (t.pools as PoolRow[]).map((p) => {
    const capital = p.tranche === "senior" ? t.senior_capital : t.junior_capital;
    const deployed = t.total_capital > 0 ? t.deployed_capital * (capital / t.total_capital) : 0;
    return {
      id: p.id,
      tranche: p.tranche,
      target_apy: p.target_apy,
      total_capital: capital,
      deployed_capital: deployed,
      available_capital: Math.max(0, capital - deployed),
      utilization_ratio: capital > 0 ? Math.round((deployed / capital) * 100) : 0,
    };
  });

  return (
    <DashboardLayout role="investor" userName={profile?.full_name || "Investor"}>
      <h1 style={s.title}>Proof of Reserve</h1>
      <p style={s.subtitle}>Transparent, anonymized data on the EduKard loan book backing your investment.</p>

      <div style={s.statsGrid}>
        {[
          { label: "Total Value Locked (TVL)", value: formatCAD(t.total_capital), icon: "🔒" },
          { label: "Active Loans", value: String(stats.active_loans), icon: "📋" },
          { label: "Avg. Student Income", value: formatCAD(stats.avg_income), icon: "💼" },
          { label: "Default Rate", value: formatPercent(stats.default_rate), icon: "📉" },
          { label: "Avg. DTI Ratio", value: formatPercent(stats.avg_dti), icon: "⚖️" },
          { label: "Avg. EduKard Score", value: String(stats.avg_score), icon: "🏆" },
        ].map((stat) => (
          <div key={stat.label} style={s.statCard}>
            <span style={s.statIcon}>{stat.icon}</span>
            <div style={s.statValue}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={s.section}>
        <h2 style={s.sectionTitle}>On-Chain Verification</h2>
        {contracts.length > 0 ? (
          <>
            <p style={s.onchainDesc}>All EduKard protocol reserves are verifiable on-chain. Click any address to view on the block explorer.</p>
            <div style={s.contractsGrid}>
              {contracts.map((contract: { name: string; address: string; chain: string; explorer: string }) => (
                <div key={contract.name} style={s.contractCard}>
                  <div style={s.contractHeader}>
                    <div>
                      <div style={s.contractName}>{contract.name}</div>
                      <div style={s.contractChain}>{contract.chain} Network</div>
                    </div>
                    <a href={contract.explorer} target="_blank" rel="noopener noreferrer" style={s.verifyLink}>Verify ↗</a>
                  </div>
                  <AddressRow address={contract.address} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={s.contractCard}>
            <p style={{ fontSize: "14px", color: "#9CA3AF", lineHeight: 1.6 }}>
              Settlement runs on <strong style={{ color: "#14B8A6" }}>Circle USDC</strong> custodial wallets for the pilot. On-chain tranche-token
              contracts are not deployed yet; reserve attestations are provided via Circle and the protocol&apos;s periodic audit.
            </p>
          </div>
        )}
      </div>

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Pool Breakdown</h2>
        <div style={s.poolGrid}>
          {pools.map((pool) => (
            <div key={pool.id} style={s.poolCard}>
              <div style={s.poolHeader}>
                <h3 style={s.poolName}>{pool.tranche === "senior" ? "🛡️ Senior Pool" : "⚡ Junior Pool"}</h3>
              </div>
              <div style={s.poolMeter}>
                <div style={s.poolMeterRow}><span>Utilization</span><span style={{ fontWeight: 700, color: pool.utilization_ratio > 90 ? "#EF4444" : "#10B981" }}>{pool.utilization_ratio}%</span></div>
                <div style={s.poolTrack}><div style={{ height: "100%", borderRadius: "100px", width: `${pool.utilization_ratio}%`, background: "linear-gradient(90deg, #059669, #0D9488)", transition: "width 1s ease" }} /></div>
              </div>
              <div style={s.poolDetails}>
                <div><span style={s.pdLabel}>Total Capital</span><span style={s.pdValue}>{formatCAD(pool.total_capital)}</span></div>
                <div><span style={s.pdLabel}>Deployed</span><span style={s.pdValue}>{formatCAD(pool.deployed_capital)}</span></div>
                <div><span style={s.pdLabel}>Available</span><span style={{ ...s.pdValue, color: "#10B981" }}>{formatCAD(pool.available_capital)}</span></div>
                <div><span style={s.pdLabel}>Target APY</span><span style={s.pdValue}>{pool.target_apy}%</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Loan Distribution by University</h2>
        <div style={s.distCard}>
          {stats.distribution.length === 0 && <p style={{ color: "#9CA3AF" }}>No funded loans yet.</p>}
          {stats.distribution.map((uni) => (
            <div key={uni.name} style={s.distRow}>
              <div style={s.distInfo}><span style={s.distName}>{uni.name}</span><span style={s.distLoans}>{uni.loans} loans</span></div>
              <div style={s.distBarOuter}><div style={{ ...s.distBarInner, width: `${uni.pct}%` }} /></div>
              <span style={s.distPct}>{uni.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={s.auditNotice}>
        <strong style={{ color: "#14B8A6" }}>🛡️ Independent Audit</strong>
        <p style={{ fontSize: "13px", color: "#D1D5DB", lineHeight: 1.7, marginTop: "6px" }}>
          EduKard protocol reserves are audited periodically by an independent third party. Aggregate figures above are computed live from the loan book and are anonymized.
        </p>
      </div>
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "28px", maxWidth: "600px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", marginBottom: "28px" },
  statCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "20px", textAlign: "center" as const },
  statIcon: { fontSize: "24px", display: "block", marginBottom: "8px" },
  statValue: { fontSize: "22px", fontWeight: 800, color: "#F9FAFB" },
  statLabel: { fontSize: "12px", color: "#6B7280", marginTop: "4px" },
  section: { marginBottom: "28px" },
  sectionTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "14px" },
  onchainDesc: { fontSize: "14px", color: "#6B7280", lineHeight: 1.6, marginBottom: "16px" },
  contractsGrid: { display: "flex", flexDirection: "column" as const, gap: "12px" },
  contractCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "20px" },
  contractHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap" as const, gap: "10px" },
  contractName: { fontSize: "15px", fontWeight: 700, color: "#F9FAFB" },
  contractChain: { fontSize: "12px", color: "#6B7280", marginTop: "2px" },
  verifyLink: { padding: "6px 14px", borderRadius: "8px", background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)", color: "#14B8A6", fontSize: "13px", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" as const },
  poolGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "14px" },
  poolCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  poolHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  poolName: { fontSize: "16px", fontWeight: 700, color: "#F9FAFB" },
  poolMeter: { marginBottom: "20px" },
  poolMeterRow: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6B7280", marginBottom: "8px" },
  poolTrack: { height: "8px", borderRadius: "100px", background: "rgba(31,41,55,0.4)" },
  poolDetails: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  pdLabel: { display: "block", fontSize: "11px", color: "#6B7280", marginBottom: "2px" },
  pdValue: { display: "block", fontSize: "15px", fontWeight: 700, color: "#F9FAFB" },
  distCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px", display: "flex", flexDirection: "column" as const, gap: "16px" },
  distRow: { display: "flex", alignItems: "center", gap: "16px" },
  distInfo: { minWidth: "220px" },
  distName: { display: "block", fontSize: "14px", fontWeight: 600, color: "#F9FAFB" },
  distLoans: { display: "block", fontSize: "12px", color: "#6B7280" },
  distBarOuter: { flex: 1, height: "8px", borderRadius: "100px", background: "rgba(31,41,55,0.4)" },
  distBarInner: { height: "100%", borderRadius: "100px", background: "linear-gradient(90deg, #0D9488, #14B8A6)", transition: "width 1s ease" },
  distPct: { fontSize: "13px", fontWeight: 700, color: "#0D9488", minWidth: "48px", textAlign: "right" as const },
  auditNotice: { padding: "20px 24px", borderRadius: "14px", background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.12)" },
};
