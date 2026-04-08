"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_POOLS } from "@/lib/mock-data";
import { formatCAD, formatPercent } from "@/lib/calculations";
import { useState } from "react";

export default function TreasuryPage() {
  const pools = MOCK_POOLS;
  const [paused, setPaused] = useState(false);
  const totalTVL = pools.reduce((s, p) => s + p.total_capital, 0);
  const totalDeployed = pools.reduce((s, p) => s + p.deployed_capital, 0);
  const overallUtil = Math.round((totalDeployed / totalTVL) * 100);

  return (
    <DashboardLayout role="admin" userName="Admin User">
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
          { icon: "💰", value: formatCAD(totalTVL - totalDeployed), label: "Available Liquidity", color: "#10B981" },
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
        <div style={s.controlCard}>
          <div style={s.controlRow}>
            <div><div style={s.controlTitle}>Pause New Loan Originations</div><div style={s.controlDesc}>When enabled, no new loan applications will be processed. Existing loans are unaffected.</div></div>
            <button onClick={() => setPaused(!paused)} style={{ ...s.toggleBtn, background: paused ? "#EF4444" : "#10B981" }}>{paused ? "PAUSED" : "ACTIVE"}</button>
          </div>
        </div>
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
  controlRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px" },
  controlTitle: { fontSize: "16px", fontWeight: 700, color: "#F9FAFB" },
  controlDesc: { fontSize: "13px", color: "#6B7280", marginTop: "6px", maxWidth: "500px" },
  toggleBtn: { padding: "10px 24px", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 800, border: "none", cursor: "pointer", letterSpacing: "1px", minWidth: "100px" },
};
