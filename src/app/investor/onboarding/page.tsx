"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

type EntityType = "individual" | "corporation" | "fund" | "trust";

const ENTITIES: { type: EntityType; icon: string; label: string; desc: string }[] = [
  { type: "individual", icon: "👤", label: "Individual", desc: "Personal account — accredited investor" },
  { type: "corporation", icon: "🏢", label: "Corporation", desc: "Business entity — registered company" },
  { type: "fund", icon: "💼", label: "Fund / LP", desc: "Investment fund or limited partnership" },
  { type: "trust", icon: "🏛️", label: "Trust", desc: "Family trust or institutional trust" },
];

export default function InvestorOnboardingPage() {
  const [entityType, setEntityType] = useState<EntityType>("individual");
  const [step, setStep] = useState(1);
  const [accredited, setAccredited] = useState(false);
  const totalSteps = entityType === "individual" ? 3 : 4;

  return (
    <DashboardLayout role="investor" userName="Marcus Chen">
      <h1 style={s.title}>Investor Onboarding</h1>
      <p style={s.subtitle}>Complete KYC/KYB verification to participate in the EduKard RWA protocol.</p>

      <div style={s.trustRow}>
        {["🔒 AML/KYC Compliant", "🏛️ CSA Regulated", "📋 Accredited Investor Check"].map((b) => (
          <span key={b} style={s.trustBadge}>{b}</span>
        ))}
      </div>

      <div style={s.progressOuter}><div style={{ ...s.progressInner, width: `${((step - 1) / totalSteps) * 100}%` }} /></div>
      <div style={s.progressLabel}>Step {step} of {totalSteps}</div>

      <div style={s.card}>
        {step === 1 && (
          <>
            <h2 style={s.stepTitle}>Investor Type</h2>
            <p style={s.stepDesc}>Select the type of entity making this investment.</p>
            <div style={s.entityGrid}>
              {ENTITIES.map((e) => (
                <button key={e.type} onClick={() => setEntityType(e.type)} style={{
                  ...s.entityCard, ...(entityType === e.type ? { borderColor: "rgba(20,184,166,0.4)", background: "rgba(20,184,166,0.06)" } : {}),
                }}>
                  <span style={s.entityIcon}>{e.icon}</span>
                  <div style={{ ...s.entityLabel, color: entityType === e.type ? "#14B8A6" : "#F9FAFB" }}>{e.label}</div>
                  <div style={s.entityDesc}>{e.desc}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={s.stepTitle}>{entityType === "individual" ? "Identity Verification" : "Entity Documentation"}</h2>
            <p style={s.stepDesc}>{entityType === "individual" ? "Upload government ID and proof of accredited investor status." : "Upload business registration and authorized signatory documents."}</p>
            <div style={s.uploadGrid}>
              {entityType === "individual" ? (
                <>
                  <div style={s.uploadBox}><span style={{ fontSize: "28px" }}>🪪</span><div style={s.uploadLabel}>Government ID</div><button style={s.uploadBtn}>Upload</button></div>
                  <div style={s.uploadBox}><span style={{ fontSize: "28px" }}>📄</span><div style={s.uploadLabel}>Proof of Accreditation</div><button style={s.uploadBtn}>Upload</button></div>
                </>
              ) : (
                <>
                  <div style={s.uploadBox}><span style={{ fontSize: "28px" }}>🏢</span><div style={s.uploadLabel}>Certificate of Incorporation</div><button style={s.uploadBtn}>Upload</button></div>
                  <div style={s.uploadBox}><span style={{ fontSize: "28px" }}>👥</span><div style={s.uploadLabel}>Authorized Signatories</div><button style={s.uploadBtn}>Upload</button></div>
                  <div style={s.uploadBox}><span style={{ fontSize: "28px" }}>📋</span><div style={s.uploadLabel}>Board Resolution</div><button style={s.uploadBtn}>Upload</button></div>
                  <div style={s.uploadBox}><span style={{ fontSize: "28px" }}>🪪</span><div style={s.uploadLabel}>Signatory ID</div><button style={s.uploadBtn}>Upload</button></div>
                </>
              )}
            </div>
            <label style={s.attestLabel}>
              <input type="checkbox" checked={accredited} onChange={(e) => setAccredited(e.target.checked)} style={s.checkbox} />
              <span style={s.attestText}>I confirm I am an &quot;accredited investor&quot; as defined under NI 45-106 (Canada). I understand investments in RWA protocols carry risk and are not CDIC insured.</span>
            </label>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={s.stepTitle}>Link Bank Account</h2>
            <p style={s.stepDesc}>Connect your Canadian bank account for deposits and yield withdrawal.</p>
            <div style={s.bankCard}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏦</div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#F9FAFB", marginBottom: "8px" }}>Connect via Plaid</h3>
              <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.6, marginBottom: "16px" }}>Securely link your bank with read-only access. We never store credentials.</p>
              <div style={s.bankTrust}>
                {["🔒 256-bit encrypted", "👁️ Read-only", "🛡️ Bank-level security"].map((b) => (
                  <span key={b} style={s.bankBadge}>{b}</span>
                ))}
              </div>
              <button style={s.connectBtn}>Connect Bank Account</button>
            </div>
            <div style={s.manualFields}>
              <div style={s.field}><label style={s.label}>Institution #</label><input style={s.input} placeholder="e.g. 010" /></div>
              <div style={s.field}><label style={s.label}>Transit #</label><input style={s.input} placeholder="e.g. 12345" /></div>
              <div style={s.field}><label style={s.label}>Account #</label><input style={s.input} placeholder="e.g. 1234567" /></div>
            </div>
          </>
        )}

        {entityType !== "individual" && step === 4 && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🕐</div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#F9FAFB", marginBottom: "10px" }}>Under Review</h2>
            <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.7, maxWidth: "420px", margin: "0 auto" }}>Your entity documentation is being reviewed. This typically takes 1–3 business days.</p>
          </div>
        )}

        <div style={s.actionRow}>
          {step > 1 && <button style={s.backBtn} onClick={() => setStep(step - 1)}>← Back</button>}
          <button style={s.nextBtn} onClick={() => setStep(Math.min(step + 1, totalSteps + 1))}>{step === totalSteps ? "Complete Onboarding" : "Continue →"}</button>
        </div>
      </div>
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "20px" },
  trustRow: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" as const },
  trustBadge: { padding: "6px 14px", borderRadius: "100px", background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.15)", color: "#14B8A6", fontSize: "12px", fontWeight: 600 },
  progressOuter: { height: "6px", borderRadius: "100px", background: "rgba(31,41,55,0.4)", marginBottom: "8px" },
  progressInner: { height: "100%", borderRadius: "100px", background: "linear-gradient(90deg, #14B8A6, #0D9488)", transition: "width 0.5s ease" },
  progressLabel: { fontSize: "13px", color: "#6B7280", marginBottom: "24px" },
  card: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "32px" },
  stepTitle: { fontSize: "20px", fontWeight: 700, color: "#F9FAFB", marginBottom: "8px" },
  stepDesc: { fontSize: "14px", color: "#6B7280", lineHeight: 1.6, marginBottom: "24px" },
  entityGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  entityCard: { border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px", cursor: "pointer", textAlign: "center" as const, background: "rgba(31,41,55,0.2)", transition: "all 0.2s" },
  entityIcon: { fontSize: "32px", display: "block", marginBottom: "10px" },
  entityLabel: { fontSize: "16px", fontWeight: 700, marginBottom: "4px" },
  entityDesc: { fontSize: "12px", color: "#6B7280" },
  uploadGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" },
  uploadBox: { border: "2px dashed rgba(75,85,99,0.3)", borderRadius: "14px", padding: "24px", textAlign: "center" as const, background: "rgba(31,41,55,0.2)" },
  uploadLabel: { fontSize: "14px", fontWeight: 600, color: "#F9FAFB", margin: "8px 0 12px" },
  uploadBtn: { padding: "8px 20px", borderRadius: "8px", background: "rgba(20,184,166,0.12)", color: "#14B8A6", border: "1px solid rgba(20,184,166,0.2)", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
  attestLabel: { display: "flex", gap: "12px", alignItems: "flex-start", cursor: "pointer", padding: "20px", borderRadius: "12px", background: "rgba(31,41,55,0.3)", border: "1px solid rgba(75,85,99,0.2)" },
  checkbox: { marginTop: "4px", accentColor: "#14B8A6", width: "18px", height: "18px", flexShrink: 0 },
  attestText: { fontSize: "13px", color: "#D1D5DB", lineHeight: 1.7 },
  bankCard: { textAlign: "center" as const, padding: "32px", borderRadius: "14px", background: "rgba(31,41,55,0.3)", border: "1px solid rgba(75,85,99,0.2)", marginBottom: "24px" },
  bankTrust: { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" as const },
  bankBadge: { padding: "4px 12px", borderRadius: "6px", background: "rgba(20,184,166,0.08)", fontSize: "12px", color: "#14B8A6" },
  connectBtn: { padding: "14px 32px", borderRadius: "10px", background: "linear-gradient(135deg, #14B8A6, #0D9488)", color: "#fff", fontSize: "15px", fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(20,184,166,0.2)" },
  manualFields: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" },
  field: { display: "flex", flexDirection: "column" as const, gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#D1D5DB" },
  input: { padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.3)", background: "rgba(31,41,55,0.4)", color: "#F9FAFB", fontSize: "14px", outline: "none" },
  actionRow: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "28px", paddingTop: "20px", borderTop: "1px solid rgba(75,85,99,0.15)" },
  backBtn: { padding: "12px 24px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  nextBtn: { padding: "12px 32px", borderRadius: "10px", background: "linear-gradient(135deg, #14B8A6, #0D9488)", color: "#fff", fontSize: "15px", fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(20,184,166,0.2)" },
};
