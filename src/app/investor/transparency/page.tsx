"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_POOLS } from "@/lib/mock-data";
import { formatCAD, formatPercent } from "@/lib/calculations";

const SMART_CONTRACTS = [
  { name: "EduKard Pool Manager", address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", chain: "Base", explorer: "https://basescan.org/address/0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" },
  { name: "Senior Tranche Token", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", chain: "Base", explorer: "https://basescan.org/address/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" },
  { name: "Junior Tranche Token", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", chain: "Base", explorer: "https://basescan.org/address/0x6B175474E89094C44Da98b954EedeAC495271d0F" },
  { name: "USDC Settlement", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", chain: "Base", explorer: "https://basescan.org/address/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
];

export default function TransparencyPage() {
  const pools = MOCK_POOLS;
  const totalTVL = pools.reduce((s, p) => s + p.total_capital, 0);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardLayout role="investor" userName="Marcus Chen">
      <h1 style={s.title}>Proof of Reserve</h1>
      <p style={s.subtitle}>Transparent, anonymized data on the EduKard loan book backing your investment.</p>

      <div style={s.statsGrid}>
        {[
          { label: "Total Value Locked (TVL)", value: formatCAD(totalTVL), icon: "🔒" },
          { label: "Active Loans", value: "847", icon: "📋" },
          { label: "Avg. Student Income", value: formatCAD(3450), icon: "💼" },
          { label: "Default Rate", value: formatPercent(2.1), icon: "📉" },
          { label: "Avg. DTI Ratio", value: formatPercent(28.3), icon: "⚖️" },
          { label: "Avg. EduKard Score", value: "68", icon: "🏆" },
        ].map((stat) => (
          <div key={stat.label} style={s.statCard}>
            <span style={s.statIcon}>{stat.icon}</span>
            <div style={s.statValue}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ON-CHAIN VERIFICATION — US-I2.2.3 */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>On-Chain Verification</h2>
        <p style={s.onchainDesc}>All EduKard protocol reserves are verifiable on-chain. Click any address to view on the block explorer.</p>
        <div style={s.contractsGrid}>
          {SMART_CONTRACTS.map((contract) => (
            <div key={contract.name} style={s.contractCard}>
              <div style={s.contractHeader}>
                <div>
                  <div style={s.contractName}>{contract.name}</div>
                  <div style={s.contractChain}>{contract.chain} Network</div>
                </div>
                <a href={contract.explorer} target="_blank" rel="noopener noreferrer" style={s.verifyLink}>
                  Verify on Basescan ↗
                </a>
              </div>
              <div style={s.addressRow}>
                <code style={s.addressCode}>{contract.address}</code>
                <button
                  onClick={() => handleCopy(contract.address)}
                  style={s.copyBtn}
                >
                  {copied === contract.address ? "✓ Copied" : "📋 Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pool Breakdown */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Pool Breakdown</h2>
        <div style={s.poolGrid}>
          {pools.map((pool) => (
            <div key={pool.id} style={s.poolCard}>
              <div style={s.poolHeader}>
                <h3 style={s.poolName}>{pool.tranche === "senior" ? "🛡️ Senior Pool" : "⚡ Junior Pool"}</h3>
                <a href={pool.tranche === "senior" ? SMART_CONTRACTS[1].explorer : SMART_CONTRACTS[2].explorer} target="_blank" rel="noopener noreferrer" style={s.poolVerify}>
                  View on-chain ↗
                </a>
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

      {/* University Distribution */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Loan Distribution by University</h2>
        <div style={s.distCard}>
          {[
            { name: "University of Toronto", loans: 142, pct: 16.8 },
            { name: "University of British Columbia", loans: 98, pct: 11.6 },
            { name: "McGill University", loans: 87, pct: 10.3 },
            { name: "York University", loans: 76, pct: 9.0 },
            { name: "University of Waterloo", loans: 65, pct: 7.7 },
            { name: "Other Institutions", loans: 379, pct: 44.7 },
          ].map((uni) => (
            <div key={uni.name} style={s.distRow}>
              <div style={s.distInfo}><span style={s.distName}>{uni.name}</span><span style={s.distLoans}>{uni.loans} loans</span></div>
              <div style={s.distBarOuter}><div style={{ ...s.distBarInner, width: `${uni.pct}%` }} /></div>
              <span style={s.distPct}>{uni.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Notice */}
      <div style={s.auditNotice}>
        <strong style={{ color: "#14B8A6" }}>🛡️ Independent Audit</strong>
        <p style={{ fontSize: "13px", color: "#D1D5DB", lineHeight: 1.7, marginTop: "6px" }}>
          EduKard protocol reserves are audited quarterly by an independent third party. Smart contracts have been audited by CertiK and OpenZeppelin.
          All on-chain data is publicly verifiable on the Base network.
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

  /* On-chain */
  section: { marginBottom: "28px" },
  sectionTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "14px" },
  onchainDesc: { fontSize: "14px", color: "#6B7280", lineHeight: 1.6, marginBottom: "16px" },
  contractsGrid: { display: "flex", flexDirection: "column" as const, gap: "12px" },
  contractCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "20px" },
  contractHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap" as const, gap: "10px" },
  contractName: { fontSize: "15px", fontWeight: 700, color: "#F9FAFB" },
  contractChain: { fontSize: "12px", color: "#6B7280", marginTop: "2px" },
  verifyLink: { padding: "6px 14px", borderRadius: "8px", background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)", color: "#14B8A6", fontSize: "13px", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" as const },
  addressRow: { display: "flex", alignItems: "center", gap: "10px" },
  addressCode: { flex: 1, padding: "10px 14px", borderRadius: "8px", background: "rgba(31,41,55,0.4)", color: "#D1D5DB", fontSize: "13px", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  copyBtn: { padding: "8px 14px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", color: "#6B7280", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const },

  /* Pools */
  poolGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "14px" },
  poolCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  poolHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  poolName: { fontSize: "16px", fontWeight: 700, color: "#F9FAFB" },
  poolVerify: { fontSize: "12px", color: "#14B8A6", textDecoration: "none", fontWeight: 600 },
  poolMeter: { marginBottom: "20px" },
  poolMeterRow: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6B7280", marginBottom: "8px" },
  poolTrack: { height: "8px", borderRadius: "100px", background: "rgba(31,41,55,0.4)" },
  poolDetails: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  pdLabel: { display: "block", fontSize: "11px", color: "#6B7280", marginBottom: "2px" },
  pdValue: { display: "block", fontSize: "15px", fontWeight: 700, color: "#F9FAFB" },

  /* Distribution */
  distCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px", display: "flex", flexDirection: "column" as const, gap: "16px" },
  distRow: { display: "flex", alignItems: "center", gap: "16px" },
  distInfo: { minWidth: "220px" },
  distName: { display: "block", fontSize: "14px", fontWeight: 600, color: "#F9FAFB" },
  distLoans: { display: "block", fontSize: "12px", color: "#6B7280" },
  distBarOuter: { flex: 1, height: "8px", borderRadius: "100px", background: "rgba(31,41,55,0.4)" },
  distBarInner: { height: "100%", borderRadius: "100px", background: "linear-gradient(90deg, #0D9488, #14B8A6)", transition: "width 1s ease" },
  distPct: { fontSize: "13px", fontWeight: 700, color: "#0D9488", minWidth: "48px", textAlign: "right" as const },

  /* Audit */
  auditNotice: { padding: "20px 24px", borderRadius: "14px", background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.12)" },
};
