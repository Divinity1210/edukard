"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { formatCAD } from "@/lib/calculations";

export default function InvestPage() {
  const [mode, setMode] = useState<"single" | "split">("single");
  const [tranche, setTranche] = useState<"senior" | "junior" | null>(null);
  const [amount, setAmount] = useState(10000);
  const [splitSenior, setSplitSenior] = useState(60);
  const [totalSplitAmount, setTotalSplitAmount] = useState(50000);
  const [agreed, setAgreed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [investSuccess, setInvestSuccess] = useState(false);

  const handleConfirmInvest = () => {
    setInvestSuccess(true);
  };

  const approxYield = tranche === "senior" ? amount * 0.08 : tranche === "junior" ? amount * 0.14 : 0;

  const seniorAmount = Math.round(totalSplitAmount * (splitSenior / 100));
  const juniorAmount = totalSplitAmount - seniorAmount;
  const splitYield = seniorAmount * 0.08 + juniorAmount * 0.14;
  const weightedApy = totalSplitAmount > 0 ? ((seniorAmount * 8 + juniorAmount * 14) / totalSplitAmount) : 0;

  const TRANCHE_DATA = [
    {
      key: "senior" as const,
      icon: "🛡️",
      name: "Senior Tranche",
      apy: 8,
      color: "#10B981",
      lockup: "90-day",
      distribution: "Quarterly",
      features: ["First-in-line repayment priority", "Capital protected from first-loss", "Lower risk profile", "Quarterly distributions"],
    },
    {
      key: "junior" as const,
      icon: "⚡",
      name: "Junior Tranche",
      apy: 14,
      color: "#F59E0B",
      lockup: "180-day",
      distribution: "Monthly",
      features: ["Higher yield potential", "First-loss capital position", "Higher risk / higher reward", "Monthly distributions"],
    },
  ];

  return (
    <DashboardLayout role="investor" userName="Marcus Chen">
      <h1 style={s.title}>Invest in Education</h1>
      <p style={s.subtitle}>Allocate capital to earn real-world asset backed yield from student tuition repayments.</p>

      {/* Mode Toggle */}
      <div style={s.modeRow}>
        <button onClick={() => setMode("single")} style={{ ...s.modeBtn, ...(mode === "single" ? s.modeBtnActive : {}) }}>
          Single Tranche
        </button>
        <button onClick={() => setMode("split")} style={{ ...s.modeBtn, ...(mode === "split" ? s.modeBtnActive : {}) }}>
          Split Allocation
        </button>
      </div>

      {/* Tranche Cards */}
      <div style={s.trancheGrid}>
        {TRANCHE_DATA.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTranche(t.key); setMode("single"); }}
            style={{
              ...s.trancheCard,
              ...(mode === "single" && tranche === t.key ? { borderColor: `${t.color}80`, boxShadow: `0 0 24px ${t.color}15` } : {}),
            }}
          >
            <div style={s.trancheIcon}>{t.icon}</div>
            <h3 style={s.trancheName}>{t.name}</h3>
            <div style={{ ...s.trancheApy, color: t.color }}>{t.apy}% <span style={s.apySub}>Targeted APY</span></div>

            {/* Lock-up period — US-I2.2.1 */}
            <div style={{ ...s.lockupBadge, background: `${t.color}12`, color: t.color, border: `1px solid ${t.color}25` }}>
              🔒 {t.lockup} lock-up period
            </div>

            <ul style={s.features}>
              {t.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>

            <div style={s.trancheFooter}>
              <div style={s.footerItem}>
                <span style={s.footerLabel}>Distribution</span>
                <span style={s.footerValue}>{t.distribution}</span>
              </div>
              <div style={s.footerItem}>
                <span style={s.footerLabel}>Lock-up</span>
                <span style={s.footerValue}>{t.lockup}</span>
              </div>
              <div style={s.footerItem}>
                <span style={s.footerLabel}>Min. Investment</span>
                <span style={s.footerValue}>{formatCAD(1000)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* SPLIT ALLOCATION MODE — US-I2.2.1 */}
      {mode === "split" && (
        <div style={s.splitCard}>
          <h2 style={s.formTitle}>Split Capital Across Both Tranches</h2>
          <p style={s.splitDesc}>Use the slider to allocate your investment across Senior and Junior tranches simultaneously.</p>

          <div style={s.splitAmountRow}>
            <span style={s.currency}>$</span>
            <input
              type="number"
              value={totalSplitAmount}
              onChange={(e) => setTotalSplitAmount(Number(e.target.value))}
              style={s.amountInput}
              min={2000}
              step={1000}
            />
            <span style={s.cadLabel}>CAD</span>
          </div>
          <div style={s.presets}>
            {[10000, 25000, 50000, 100000, 250000].map(v => (
              <button key={v} onClick={() => setTotalSplitAmount(v)} style={{ ...s.presetBtn, ...(totalSplitAmount === v ? s.presetActive : {}) }}>{formatCAD(v)}</button>
            ))}
          </div>

          {/* Split Slider */}
          <div style={s.splitSliderSection}>
            <div style={s.splitLabels}>
              <span style={{ color: "#10B981", fontWeight: 700 }}>🛡️ Senior: {splitSenior}%</span>
              <span style={{ color: "#F59E0B", fontWeight: 700 }}>⚡ Junior: {100 - splitSenior}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={splitSenior}
              onChange={(e) => setSplitSenior(Number(e.target.value))}
              style={s.splitSlider}
            />
            {/* Stacked Visualization Bar */}
            <div style={s.stackedBar}>
              <div style={{ ...s.stackedSenior, width: `${splitSenior}%` }}>
                {splitSenior > 15 && <span style={s.stackedLabel}>{formatCAD(seniorAmount)}</span>}
              </div>
              <div style={{ ...s.stackedJunior, width: `${100 - splitSenior}%` }}>
                {100 - splitSenior > 15 && <span style={s.stackedLabel}>{formatCAD(juniorAmount)}</span>}
              </div>
            </div>
          </div>

          {/* Split Summary */}
          <div style={s.splitSummary}>
            <div style={s.splitSummaryRow}>
              <span>🛡️ Senior ({splitSenior}%)</span>
              <span style={{ color: "#F9FAFB", fontWeight: 700 }}>{formatCAD(seniorAmount)} × 8% APY = <span style={{ color: "#10B981" }}>~{formatCAD(seniorAmount * 0.08)}/yr</span></span>
            </div>
            <div style={s.splitSummaryRow}>
              <span>⚡ Junior ({100 - splitSenior}%)</span>
              <span style={{ color: "#F9FAFB", fontWeight: 700 }}>{formatCAD(juniorAmount)} × 14% APY = <span style={{ color: "#F59E0B" }}>~{formatCAD(juniorAmount * 0.14)}/yr</span></span>
            </div>
            <div style={{ ...s.splitSummaryRow, borderTop: "1px solid rgba(75,85,99,0.2)", paddingTop: "12px", marginTop: "4px" }}>
              <span style={{ fontWeight: 700, color: "#F9FAFB" }}>Blended Yield</span>
              <span style={{ fontWeight: 800, color: "#14B8A6", fontSize: "18px" }}>{weightedApy.toFixed(1)}% APY — ~{formatCAD(splitYield)}/yr</span>
            </div>
          </div>

          <label style={s.lockupConsent}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={s.checkbox} />
            <span style={{ fontSize: "13px", color: "#D1D5DB", lineHeight: 1.7 }}>
              I understand that Senior Tranche has a <strong style={{ color: "#10B981" }}>90-day lock-up</strong> and Junior Tranche has a <strong style={{ color: "#F59E0B" }}>180-day lock-up</strong>. Early withdrawal is not permitted during the lock-up period.
            </span>
          </label>

          <button style={{ ...s.investBtn, opacity: agreed ? 1 : 0.5 }} disabled={!agreed}>Confirm Split Investment →</button>
        </div>
      )}

      {/* Single Tranche Investment Form */}
      {mode === "single" && tranche && (
        <div style={s.investForm}>
          <h2 style={s.formTitle}>Investment Amount — {tranche === "senior" ? "🛡️ Senior" : "⚡ Junior"} Tranche</h2>

          <div style={{ ...s.lockupNotice, background: tranche === "senior" ? "rgba(16,185,129,0.06)" : "rgba(245,158,11,0.06)", borderColor: tranche === "senior" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)" }}>
            <strong style={{ color: tranche === "senior" ? "#10B981" : "#F59E0B" }}>
              🔒 {tranche === "senior" ? "90-day" : "180-day"} lock-up period
            </strong>
            <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px" }}>
              Your capital will be locked for {tranche === "senior" ? "90" : "180"} days after investment. You cannot withdraw during this period.
            </p>
          </div>

          <div style={s.amountRow}>
            <span style={s.currency}>$</span>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} style={s.amountInput} min={1000} step={1000} />
            <span style={s.cadLabel}>CAD</span>
          </div>
          <div style={s.presets}>{[5000, 10000, 25000, 50000, 100000].map(v => (<button key={v} onClick={() => setAmount(v)} style={{ ...s.presetBtn, ...(amount === v ? s.presetActive : {}) }}>{formatCAD(v)}</button>))}</div>
          <div style={s.yieldPreview}>
            <div style={s.yieldRow}><span>Estimated Annual Yield</span><strong style={{ color: "#10B981" }}>~{formatCAD(approxYield)}</strong></div>
            <div style={s.yieldRow}><span>Estimated Monthly</span><strong>~{formatCAD(approxYield / 12)}</strong></div>
            <div style={s.yieldRow}><span>Distribution Frequency</span><strong>{tranche === "senior" ? "Quarterly" : "Monthly"}</strong></div>
            <div style={s.yieldRow}><span>Lock-up Period</span><strong style={{ color: tranche === "senior" ? "#10B981" : "#F59E0B" }}>{tranche === "senior" ? "90 days" : "180 days"}</strong></div>
          </div>
          <button style={s.investBtn} onClick={() => setShowConfirm(true)}>Confirm Investment →</button>
          <p style={s.disclaimer}>Past performance is not indicative of future results. Your capital is at risk. EduKard investments are not covered by CDIC or any deposit insurance program.</p>
        </div>
      )}

      {/* Split investment confirm */}
      {mode === "split" && agreed && (
        <></>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={s.overlay} onClick={() => { setShowConfirm(false); setInvestSuccess(false); }}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            {!investSuccess ? (
              <>
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#F9FAFB", marginBottom: "16px" }}>Confirm Investment</h2>
                <div style={s.confirmCard}>
                  <div style={s.confirmRow}><span>Tranche</span><strong style={{ color: tranche === "senior" ? "#10B981" : "#F59E0B" }}>{tranche === "senior" ? "🛡️ Senior" : "⚡ Junior"}</strong></div>
                  <div style={s.confirmRow}><span>Amount</span><strong style={{ color: "#F9FAFB" }}>{formatCAD(amount)}</strong></div>
                  <div style={s.confirmRow}><span>Targeted APY</span><strong style={{ color: tranche === "senior" ? "#10B981" : "#F59E0B" }}>{tranche === "senior" ? "8%" : "14%"}</strong></div>
                  <div style={s.confirmRow}><span>Est. Annual Yield</span><strong style={{ color: "#10B981" }}>~{formatCAD(approxYield)}</strong></div>
                  <div style={s.confirmRow}><span>Lock-up Period</span><strong>{tranche === "senior" ? "90 days" : "180 days"}</strong></div>
                  <div style={{ ...s.confirmRow, borderTop: "1px solid rgba(75,85,99,0.2)", paddingTop: "10px", marginTop: "4px" }}><span>First Yield Date</span><strong style={{ color: "#14B8A6" }}>{new Date(Date.now() + (tranche === "senior" ? 90 : 30) * 86400000).toLocaleDateString()}</strong></div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button style={{ flex: 1, padding: "14px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "14px", fontWeight: 600, cursor: "pointer" }} onClick={() => setShowConfirm(false)}>Cancel</button>
                  <button style={{ flex: 1, padding: "14px", borderRadius: "10px", background: "linear-gradient(135deg, #14B8A6, #0D9488)", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer" }} onClick={handleConfirmInvest}>Confirm →</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center" as const, padding: "20px 0" }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div>
                <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#F9FAFB", marginBottom: "8px" }}>Investment Confirmed!</h2>
                <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.7, margin: "12px 0" }}>
                  {formatCAD(amount)} has been allocated to the <strong style={{ color: tranche === "senior" ? "#10B981" : "#F59E0B" }}>{tranche === "senior" ? "Senior" : "Junior"} Tranche</strong>.
                </p>
                <div style={{ padding: "14px 20px", borderRadius: "10px", background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.15)", marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px", color: "#6B7280" }}>Investment Reference</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#14B8A6", fontFamily: "monospace" }}>EK-INV-{Date.now().toString().slice(-8)}</div>
                </div>
                <a href="/investor/portfolio" style={{ display: "inline-block", padding: "12px 28px", borderRadius: "10px", background: "linear-gradient(135deg, #14B8A6, #0D9488)", color: "#fff", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}>View Portfolio →</a>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "20px" },
  modeRow: { display: "flex", gap: "8px", marginBottom: "24px" },
  modeBtn: { padding: "10px 20px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(17,24,39,0.6)", color: "#6B7280", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  modeBtnActive: { border: "1px solid rgba(20,184,166,0.3)", background: "rgba(20,184,166,0.08)", color: "#14B8A6" },
  trancheGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginBottom: "28px" },
  trancheCard: { border: "1px solid rgba(75,85,99,0.3)", borderRadius: "14px", padding: "28px", cursor: "pointer", textAlign: "left" as const, background: "rgba(17,24,39,0.6)", transition: "all 0.3s ease" },
  trancheIcon: { fontSize: "32px", marginBottom: "12px" },
  trancheName: { fontSize: "18px", fontWeight: 700, color: "#F9FAFB", marginBottom: "8px" },
  trancheApy: { fontSize: "28px", fontWeight: 800, marginBottom: "12px" },
  apySub: { fontSize: "13px", fontWeight: 500, color: "#6B7280" },
  lockupBadge: { display: "inline-flex", padding: "6px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, marginBottom: "16px" },
  features: { listStyle: "none", padding: 0, display: "flex", flexDirection: "column" as const, gap: "8px", fontSize: "14px", color: "#D1D5DB", marginBottom: "20px" },
  trancheFooter: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", paddingTop: "16px", borderTop: "1px solid rgba(75,85,99,0.15)" },
  footerItem: { display: "flex", flexDirection: "column" as const, gap: "2px" },
  footerLabel: { fontSize: "11px", color: "#6B7280" },
  footerValue: { fontSize: "13px", fontWeight: 700, color: "#F9FAFB" },

  /* Split mode */
  splitCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "32px" },
  splitDesc: { fontSize: "14px", color: "#6B7280", lineHeight: 1.6, marginBottom: "20px" },
  splitAmountRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" },
  splitSliderSection: { marginBottom: "24px" },
  splitLabels: { display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "10px" },
  splitSlider: { width: "100%", accentColor: "#14B8A6", height: "8px", marginBottom: "14px" },
  stackedBar: { display: "flex", height: "40px", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(75,85,99,0.2)" },
  stackedSenior: { background: "linear-gradient(90deg, #059669, #10B981)", display: "flex", alignItems: "center", justifyContent: "center", transition: "width 0.3s ease", minWidth: "4px" },
  stackedJunior: { background: "linear-gradient(90deg, #D97706, #F59E0B)", display: "flex", alignItems: "center", justifyContent: "center", transition: "width 0.3s ease", minWidth: "4px" },
  stackedLabel: { fontSize: "12px", fontWeight: 700, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.3)" },
  splitSummary: { background: "rgba(31,41,55,0.3)", borderRadius: "12px", padding: "20px", marginBottom: "24px" },
  splitSummaryRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px", color: "#6B7280" },
  lockupConsent: { display: "flex", gap: "12px", alignItems: "flex-start", cursor: "pointer", marginBottom: "24px", padding: "16px", borderRadius: "12px", background: "rgba(31,41,55,0.2)", border: "1px solid rgba(75,85,99,0.15)" },
  lockupNotice: { padding: "16px 20px", borderRadius: "12px", border: "1px solid", marginBottom: "20px" },
  checkbox: { marginTop: "4px", accentColor: "#14B8A6", width: "18px", height: "18px", flexShrink: 0 },

  /* Single mode form */
  investForm: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "32px" },
  formTitle: { fontSize: "18px", fontWeight: 700, color: "#F9FAFB", marginBottom: "16px" },
  amountRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" },
  currency: { fontSize: "24px", fontWeight: 700, color: "#6B7280" },
  amountInput: { flex: 1, padding: "14px 16px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", color: "#F9FAFB", fontSize: "24px", fontWeight: 700, outline: "none" },
  cadLabel: { fontSize: "14px", fontWeight: 600, color: "#6B7280" },
  presets: { display: "flex", gap: "8px", flexWrap: "wrap" as const, marginBottom: "24px" },
  presetBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", color: "#6B7280", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
  presetActive: { border: "1px solid #0D9488", background: "rgba(20,184,166,0.12)", color: "#0D9488" },
  yieldPreview: { background: "rgba(31,41,55,0.3)", borderRadius: "12px", padding: "20px", marginBottom: "24px" },
  yieldRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "15px", color: "#6B7280" },
  investBtn: { width: "100%", padding: "16px", borderRadius: "12px", background: "linear-gradient(135deg, #14B8A6, #0D9488)", color: "#fff", fontSize: "16px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(13,148,136,0.25)" },
  disclaimer: { fontSize: "11px", color: "#6B7280", marginTop: "16px", lineHeight: 1.6, textAlign: "center" as const },
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "rgba(17,24,39,0.95)", border: "1px solid rgba(75,85,99,0.3)", borderRadius: "16px", padding: "32px", maxWidth: "460px", width: "90%" },
  confirmCard: { padding: "16px", borderRadius: "12px", background: "rgba(31,41,55,0.3)" },
  confirmRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px", color: "#6B7280" },
};
