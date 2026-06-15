"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatCAD } from "@/lib/calculations";
import { createDeposit } from "@/lib/actions/investor";

export default function DepositClient() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [amount, setAmount] = useState(10000);
  const [method, setMethod] = useState<"wire" | "eft">("eft");
  const [showConfirm, setShowConfirm] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function proceed() {
    setError(null);
    const fd = new FormData();
    fd.set("amount", String(amount));
    fd.set("method", method);
    startTransition(async () => {
      const r = await createDeposit(fd);
      if (r?.error) setError(r.error);
      else { setReference(r.reference ?? "EK-DEP"); router.refresh(); }
    });
  }

  return (
    <div style={s.formCard}>
      <h2 style={s.formTitle}>New Deposit</h2>
      {error && <div style={s.errorBar}>{error}</div>}
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
        {[5000, 10000, 25000, 50000, 100000].map((v) => (
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

      <button style={s.depositBtn} onClick={() => { setReference(null); setShowConfirm(true); }}>{method === "eft" ? "Initiate EFT Deposit" : "I Have Sent the Wire"} →</button>
      <p style={s.disclaimer}>Deposits are processed within 1–2 business days. Funds reflect as USDC purchasing power once confirmed. EduKard handles fiat-to-stablecoin conversion via Circle.</p>

      {showConfirm && (
        <div style={s.overlay} onClick={() => { setShowConfirm(false); setReference(null); }}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            {!reference ? (
              <>
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#F9FAFB", marginBottom: "16px" }}>Confirm Deposit</h2>
                <div style={s.confirmCard}>
                  <div style={s.confirmRow}><span>Method</span><strong style={{ color: "#14B8A6" }}>{method === "eft" ? "🏦 EFT / Direct Deposit" : "📄 Wire Transfer"}</strong></div>
                  <div style={s.confirmRow}><span>Deposit Amount</span><strong style={{ color: "#F9FAFB" }}>{formatCAD(amount)}</strong></div>
                  <div style={s.confirmRow}><span>USDC Credited</span><strong style={{ color: "#14B8A6" }}>${amount.toLocaleString()} USDC</strong></div>
                  <div style={{ ...s.confirmRow, borderTop: "1px solid rgba(75,85,99,0.2)", paddingTop: "10px", marginTop: "4px" }}><span>Expected Clearance</span><strong>{method === "eft" ? "2-3 business days" : "Same day"}</strong></div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button style={{ flex: 1, padding: "14px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "14px", fontWeight: 600, cursor: "pointer" }} onClick={() => setShowConfirm(false)}>Cancel</button>
                  <button disabled={pending} style={{ flex: 1, padding: "14px", borderRadius: "10px", background: "linear-gradient(135deg, #14B8A6, #0D9488)", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer", opacity: pending ? 0.6 : 1 }} onClick={proceed}>{pending ? "Processing..." : "Proceed →"}</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center" as const, padding: "20px 0" }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
                <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#F9FAFB", marginBottom: "8px" }}>{method === "eft" ? "EFT Initiated!" : "Wire Recorded!"}</h2>
                <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.7, margin: "12px 0" }}>
                  {method === "eft" ? "Your EFT deposit is being processed." : "We've recorded your wire transfer. Funds will be credited upon confirmation."}
                </p>
                <div style={{ padding: "14px 20px", borderRadius: "10px", background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.15)", marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px", color: "#6B7280" }}>Tracking Reference</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#14B8A6", fontFamily: "monospace" }}>{reference}</div>
                </div>
                <button style={{ padding: "12px 28px", borderRadius: "10px", background: "linear-gradient(135deg, #14B8A6, #0D9488)", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer" }} onClick={() => { setShowConfirm(false); setReference(null); }}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  errorBar: { padding: "12px 16px", borderRadius: "10px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", fontSize: "14px", marginBottom: "16px" },
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
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "rgba(17,24,39,0.95)", border: "1px solid rgba(75,85,99,0.3)", borderRadius: "16px", padding: "32px", maxWidth: "460px", width: "90%" },
  confirmCard: { padding: "16px", borderRadius: "12px", background: "rgba(31,41,55,0.3)" },
  confirmRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px", color: "#6B7280" },
};
