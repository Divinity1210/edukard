"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_DEPOSITS } from "@/lib/mock-data";
import { formatCAD, formatDate } from "@/lib/calculations";

export default function DepositPage() {
  const deposits = MOCK_DEPOSITS;
  const [amount, setAmount] = useState(10000);
  const [method, setMethod] = useState<"wire" | "eft">("eft");
  const [showConfirm, setShowConfirm] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const totalDeposited = deposits.filter(d => d.status === "confirmed").reduce((s, d) => s + d.amount, 0);
  const pendingAmount = deposits.filter(d => d.status === "processing").reduce((s, d) => s + d.amount, 0);

  const handleConfirmDeposit = () => {
    setDepositSuccess(true);
  };

  return (
    <DashboardLayout role="investor" userName="Marcus Chen">
      <h1 style={s.title}>Deposit Funds</h1>
      <p style={s.subtitle}>Convert fiat to USDC purchasing power in the protocol. We handle the conversion silently.</p>

      {/* Balance Cards */}
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

      {/* New Deposit Form */}
      <div style={s.formCard}>
        <h2 style={s.formTitle}>New Deposit</h2>
        <div style={s.methodRow}>
          <button onClick={() => setMethod("eft")} style={{ ...s.methodBtn, ...(method === "eft" ? s.methodActive : {}) }}>🏦 EFT / Direct Deposit</button>
          <button onClick={() => setMethod("wire")} style={{ ...s.methodBtn, ...(method === "wire" ? s.methodActive : {}) }}>📄 Wire Transfer</button>
        </div>
        <div style={s.amountRow}>
          <span style={s.currency}>$</span>
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} style={s.amountInput} min={1000} step={1000} />
          <span style={s.cadLabel}>CAD</span>
        </div>
        <div style={s.presets}>
          {[5000, 10000, 25000, 50000, 100000].map(v => (
            <button key={v} onClick={() => setAmount(v)} style={{ ...s.presetBtn, ...(amount === v ? s.presetActive : {}) }}>{formatCAD(v)}</button>
          ))}
        </div>

        <div style={s.conversionBox}>
          <div style={s.convRow}><span>Deposit Amount</span><strong style={{ color: "#F9FAFB" }}>{formatCAD(amount)}</strong></div>
          <div style={s.convRow}><span>Conversion Rate</span><strong>1.00 CAD = 1.00 USDC</strong></div>
          <div style={s.convRow}><span>Protocol Fee</span><strong style={{ color: "#10B981" }}>$0.00</strong></div>
          <div style={{ ...s.convRow, borderTop: "1px solid rgba(75,85,99,0.15)", paddingTop: "12px" }}><span>USDC Credited</span><strong style={{ color: "#14B8A6", fontSize: "18px" }}>${amount.toLocaleString()} USDC</strong></div>
        </div>

        {method === "wire" && (
          <div style={s.instrCard}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#F9FAFB", marginBottom: "12px" }}>Wire Transfer Instructions</h3>
            <div style={s.instrGrid}>
              <div><span style={s.instrLabel}>Bank</span><span style={s.instrValue}>Royal Bank of Canada</span></div>
              <div><span style={s.instrLabel}>Account Name</span><span style={s.instrValue}>EduKard Protocol Inc.</span></div>
              <div><span style={s.instrLabel}>Transit #</span><span style={s.instrValue}>04512</span></div>
              <div><span style={s.instrLabel}>Account #</span><span style={s.instrValue}>5129384</span></div>
              <div><span style={s.instrLabel}>Reference</span><span style={s.instrValue}>EK-INV-001</span></div>
              <div><span style={s.instrLabel}>SWIFT</span><span style={s.instrValue}>ROYCCAT2</span></div>
            </div>
          </div>
        )}

        <button style={s.depositBtn} onClick={() => setShowConfirm(true)}>{method === "eft" ? "Initiate EFT Deposit" : "I Have Sent the Wire"} →</button>
        <p style={s.disclaimer}>Deposits are processed within 1–2 business days. Funds will be reflected as USDC purchasing power once confirmed. EduKard handles all fiat-to-stablecoin conversion via Circle Mint API.</p>
      </div>

      {/* Deposit History */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Deposit History</h2>
        <div style={s.tableCard}>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Date</th><th style={s.th}>Method</th><th style={s.th}>Amount</th><th style={s.th}>USDC</th><th style={s.th}>Status</th></tr></thead>
            <tbody>
              {deposits.map((d) => (
                <tr key={d.id}>
                  <td style={s.td}>{formatDate(d.initiated_at)}</td>
                  <td style={s.td}><span style={s.methodBadge}>{d.method.toUpperCase()}</span></td>
                  <td style={{ ...s.td, fontWeight: 600, color: "#F9FAFB" }}>{formatCAD(d.amount)}</td>
                  <td style={s.td}>${d.usdc_equivalent.toLocaleString()}</td>
                  <td style={s.td}>
                    <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, background: d.status === "confirmed" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", color: d.status === "confirmed" ? "#10B981" : "#F59E0B" }}>
                      {d.status === "confirmed" ? "✓ Confirmed" : "Processing"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit Confirmation Modal */}
      {showConfirm && (
        <div style={s.overlay} onClick={() => { setShowConfirm(false); setDepositSuccess(false); }}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            {!depositSuccess ? (
              <>
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#F9FAFB", marginBottom: "16px" }}>Confirm Deposit</h2>
                <div style={s.confirmCard}>
                  <div style={s.confirmRow}><span>Method</span><strong style={{ color: "#14B8A6" }}>{method === "eft" ? "🏦 EFT / Direct Deposit" : "📄 Wire Transfer"}</strong></div>
                  <div style={s.confirmRow}><span>Deposit Amount</span><strong style={{ color: "#F9FAFB" }}>{formatCAD(amount)}</strong></div>
                  <div style={s.confirmRow}><span>USDC Credited</span><strong style={{ color: "#14B8A6" }}>${amount.toLocaleString()} USDC</strong></div>
                  <div style={s.confirmRow}><span>Protocol Fee</span><strong style={{ color: "#10B981" }}>$0.00</strong></div>
                  <div style={{ ...s.confirmRow, borderTop: "1px solid rgba(75,85,99,0.2)", paddingTop: "10px", marginTop: "4px" }}><span>Expected Clearance</span><strong>{method === "eft" ? "2-3 business days" : "Same day"}</strong></div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button style={{ flex: 1, padding: "14px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "14px", fontWeight: 600, cursor: "pointer" }} onClick={() => setShowConfirm(false)}>Cancel</button>
                  <button style={{ flex: 1, padding: "14px", borderRadius: "10px", background: "linear-gradient(135deg, #14B8A6, #0D9488)", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer" }} onClick={handleConfirmDeposit}>Proceed →</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center" as const, padding: "20px 0" }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
                <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#F9FAFB", marginBottom: "8px" }}>{method === "eft" ? "EFT Initiated!" : "Wire Recorded!"}</h2>
                <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.7, margin: "12px 0" }}>
                  {method === "eft" ? "Your EFT deposit is being processed." : "We've recorded your wire transfer. Funds will be credited upon confirmation."}
                </p>
                <div style={{ padding: "14px 20px", borderRadius: "10px", background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.15)", marginBottom: "8px" }}>
                  <div style={{ fontSize: "12px", color: "#6B7280" }}>Tracking Reference</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#14B8A6", fontFamily: "monospace" }}>EK-DEP-{Date.now().toString().slice(-8)}</div>
                </div>
                <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px" }}>Expected: <strong style={{ color: "#F9FAFB" }}>{method === "eft" ? `${new Date(Date.now() + 3 * 86400000).toLocaleDateString()}` : "Today"}</strong></div>
                <button style={{ padding: "12px 28px", borderRadius: "10px", background: "linear-gradient(135deg, #14B8A6, #0D9488)", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer" }} onClick={() => { setShowConfirm(false); setDepositSuccess(false); }}>Done</button>
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
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "28px" },
  balanceGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "28px" },
  balanceCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column" as const, gap: "4px" },
  balanceIcon: { fontSize: "24px" },
  balanceLabel: { fontSize: "12px", color: "#6B7280", fontWeight: 500 },
  balanceValue: { fontSize: "24px", fontWeight: 800 },
  balanceSub: { fontSize: "12px", color: "#6B7280" },
  formCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "32px", marginBottom: "28px" },
  formTitle: { fontSize: "18px", fontWeight: 700, color: "#F9FAFB", marginBottom: "20px" },
  methodRow: { display: "flex", gap: "10px", marginBottom: "20px" },
  methodBtn: { flex: 1, padding: "14px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", color: "#6B7280", fontSize: "14px", fontWeight: 600, cursor: "pointer", textAlign: "center" as const },
  methodActive: { borderColor: "rgba(20,184,166,0.4)", background: "rgba(20,184,166,0.06)", color: "#14B8A6" },
  amountRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" },
  currency: { fontSize: "24px", fontWeight: 700, color: "#6B7280" },
  amountInput: { flex: 1, padding: "14px 16px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", color: "#F9FAFB", fontSize: "24px", fontWeight: 700, outline: "none" },
  cadLabel: { fontSize: "14px", fontWeight: 600, color: "#6B7280" },
  presets: { display: "flex", gap: "8px", flexWrap: "wrap" as const, marginBottom: "24px" },
  presetBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", color: "#6B7280", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
  presetActive: { border: "1px solid #0D9488", background: "rgba(20,184,166,0.12)", color: "#0D9488" },
  conversionBox: { background: "rgba(31,41,55,0.3)", borderRadius: "12px", padding: "20px", marginBottom: "24px" },
  convRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px", color: "#6B7280" },
  instrCard: { background: "rgba(31,41,55,0.3)", borderRadius: "12px", padding: "20px", marginBottom: "24px", border: "1px solid rgba(75,85,99,0.15)" },
  instrGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" },
  instrLabel: { display: "block", fontSize: "11px", color: "#6B7280", marginBottom: "2px" },
  instrValue: { display: "block", fontSize: "14px", fontWeight: 600, color: "#F9FAFB", fontFamily: "monospace" },
  depositBtn: { width: "100%", padding: "16px", borderRadius: "12px", background: "linear-gradient(135deg, #14B8A6, #0D9488)", color: "#fff", fontSize: "16px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(13,148,136,0.25)" },
  disclaimer: { fontSize: "11px", color: "#6B7280", marginTop: "16px", lineHeight: 1.6, textAlign: "center" as const },
  section: { marginBottom: "28px" },
  sectionTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "14px" },
  tableCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { padding: "14px 16px", fontSize: "12px", fontWeight: 600, color: "#6B7280", textAlign: "left" as const, textTransform: "uppercase" as const, borderBottom: "1px solid rgba(75,85,99,0.2)" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },
  methodBadge: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, background: "rgba(20,184,166,0.12)", color: "#14B8A6", letterSpacing: "0.5px" },
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "rgba(17,24,39,0.95)", border: "1px solid rgba(75,85,99,0.3)", borderRadius: "16px", padding: "32px", maxWidth: "460px", width: "90%" },
  confirmCard: { padding: "16px", borderRadius: "12px", background: "rgba(31,41,55,0.3)" },
  confirmRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px", color: "#6B7280" },
};
