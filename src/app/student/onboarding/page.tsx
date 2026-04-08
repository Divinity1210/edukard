"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

const STEPS = [
  { num: 1, title: "Personal Information", icon: "👤", desc: "Provide your legal name, date of birth, and Canadian address." },
  { num: 2, title: "Government ID", icon: "🪪", desc: "Upload your passport, driver's license, or national ID (front & back)." },
  { num: 3, title: "Selfie Verification", icon: "🤳", desc: "Take a live selfie. A liveness check verifies you're a real person." },
  { num: 4, title: "Student Verification", icon: "🎓", desc: "Upload your Student ID or University acceptance letter." },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState<number[]>([]);

  const handleComplete = () => {
    setCompleted((prev) => [...prev, currentStep]);
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const allDone = completed.length === 4;

  return (
    <DashboardLayout role="student" userName="Amara Okafor">
      {/* Banner */}
      <div style={s.banner}>
        <img src="/images/kyc-verification.png" alt="Identity verification" style={s.bannerImg} />
        <div style={s.bannerOverlay} />
        <div style={s.bannerContent}>
          <h1 style={s.pageTitle}>Identity Verification</h1>
          <p style={s.pageSub}>Complete all 4 steps to verify your identity and unlock tuition financing.</p>
        </div>
      </div>

      {/* Trust Badges */}
      <div style={s.trustRow}>
        {["🔒 Bank-level Encryption", "🛡️ Sumsub Verified", "📋 PIPEDA Compliant"].map((b) => (
          <span key={b} style={s.trustBadge}>{b}</span>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={s.progressOuter}>
        <div style={{ ...s.progressInner, width: `${(completed.length / 4) * 100}%` }} />
      </div>
      <div style={s.progressLabel}>Step {Math.min(currentStep, 4)} of 4 — {allDone ? "All steps complete!" : STEPS[currentStep - 1].title}</div>

      {allDone ? (
        <div style={s.successCard}>
          <div style={s.successIcon}>✅</div>
          <h2 style={s.successTitle}>Verification Complete</h2>
          <p style={s.successMsg}>Your identity documents are being reviewed. This typically takes 5–15 minutes. You&apos;ll receive a notification once approved.</p>
          <div style={s.statusPill}>🕐 Under Review</div>
        </div>
      ) : (
        <div style={s.stepsGrid}>
          {/* Step sidebar */}
          <div style={s.stepList}>
            {STEPS.map((step) => {
              const done = completed.includes(step.num);
              const active = step.num === currentStep;
              return (
                <button key={step.num} onClick={() => !done && setCurrentStep(step.num)} style={{
                  ...s.stepItem,
                  ...(active ? s.stepItemActive : {}),
                  ...(done ? s.stepItemDone : {}),
                }}>
                  <span style={{ ...s.stepCircle, ...(done ? s.stepCircleDone : active ? s.stepCircleActive : {}) }}>
                    {done ? "✓" : step.num}
                  </span>
                  <div>
                    <div style={{ ...s.stepTitle, color: active ? "#F9FAFB" : done ? "#10B981" : "#6B7280" }}>{step.title}</div>
                    <div style={s.stepMeta}>{done ? "Completed" : active ? "In Progress" : "Pending"}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Step content */}
          <div style={s.stepContent}>
            <div style={s.stepHeader}>
              <span style={s.stepIcon}>{STEPS[currentStep - 1].icon}</span>
              <div>
                <h2 style={s.stepContentTitle}>{STEPS[currentStep - 1].title}</h2>
                <p style={s.stepContentDesc}>{STEPS[currentStep - 1].desc}</p>
              </div>
            </div>

            {currentStep === 1 && (
              <div style={s.formFields}>
                <div style={s.fieldRow}>
                  <div style={s.field}><label style={s.label}>First Name</label><input style={s.input} placeholder="Amara" defaultValue="Amara" /></div>
                  <div style={s.field}><label style={s.label}>Last Name</label><input style={s.input} placeholder="Okafor" defaultValue="Okafor" /></div>
                </div>
                <div style={s.fieldRow}>
                  <div style={s.field}><label style={s.label}>Date of Birth</label><input style={s.input} type="date" defaultValue="2001-06-15" /></div>
                  <div style={s.field}><label style={s.label}>Nationality</label><input style={s.input} placeholder="Nigerian" defaultValue="Nigerian" /></div>
                </div>
                <div style={s.field}><label style={s.label}>Canadian Address</label><input style={s.input} placeholder="123 College St, Toronto, ON M5T 1R4" defaultValue="456 Bloor St W, Toronto, ON M5S 1X8" /></div>
              </div>
            )}

            {currentStep === 2 && (
              <div style={s.uploadZone}>
                <div style={s.uploadBox}>
                  <div style={s.uploadBoxIcon}>🪪</div>
                  <div style={s.uploadBoxTitle}>Upload Front of ID</div>
                  <div style={s.uploadBoxDesc}>Drag and drop or click to upload. JPG, PNG or PDF up to 10MB.</div>
                  <button style={s.uploadBtn}>Choose File</button>
                </div>
                <div style={s.uploadBox}>
                  <div style={s.uploadBoxIcon}>🔄</div>
                  <div style={s.uploadBoxTitle}>Upload Back of ID</div>
                  <div style={s.uploadBoxDesc}>Drag and drop or click to upload. JPG, PNG or PDF up to 10MB.</div>
                  <button style={s.uploadBtn}>Choose File</button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div style={s.cameraArea}>
                <div style={s.cameraBox}>
                  <div style={s.cameraIcon}>📸</div>
                  <div style={s.cameraTitle}>Position your face in the frame</div>
                  <div style={s.cameraDesc}>Ensure good lighting. The liveness check will detect movement to confirm you&apos;re a real person.</div>
                  <div style={s.cameraFrame}>
                    <div style={s.cameraCircle} />
                  </div>
                  <button style={s.uploadBtn}>Start Camera</button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div style={s.uploadZone}>
                <div style={s.uploadBox}>
                  <div style={s.uploadBoxIcon}>🎓</div>
                  <div style={s.uploadBoxTitle}>Student ID or Acceptance Letter</div>
                  <div style={s.uploadBoxDesc}>Upload your valid Student ID card or official University acceptance letter confirming active enrollment.</div>
                  <button style={s.uploadBtn}>Choose File</button>
                </div>
                <div style={s.uploadBox}>
                  <div style={s.uploadBoxIcon}>📋</div>
                  <div style={s.uploadBoxTitle}>Study Permit (Optional)</div>
                  <div style={s.uploadBoxDesc}>If you&apos;re an international student, upload your valid Canadian Study Permit.</div>
                  <button style={s.uploadBtn}>Choose File</button>
                </div>
              </div>
            )}

            <div style={s.actionRow}>
              {currentStep > 1 && <button style={s.backBtn} onClick={() => setCurrentStep(currentStep - 1)}>← Back</button>}
              <button style={s.nextBtn} onClick={handleComplete}>
                {currentStep === 4 ? "Submit for Review" : "Continue →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  banner: { position: "relative" as const, borderRadius: "16px", overflow: "hidden", marginBottom: "20px", height: "160px", display: "flex", alignItems: "flex-end", padding: "24px 28px" },
  bannerImg: { position: "absolute" as const, top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" as const },
  bannerOverlay: { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(90deg, rgba(10,15,30,0.85) 40%, rgba(10,15,30,0.3) 100%)" },
  bannerContent: { position: "relative" as const, zIndex: 1 },
  pageTitle: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB", letterSpacing: "-0.5px" },
  pageSub: { fontSize: "15px", color: "#D1D5DB", marginTop: "4px" },
  trustRow: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  trustBadge: { padding: "6px 14px", borderRadius: "100px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", color: "#10B981", fontSize: "12px", fontWeight: 600 },
  progressOuter: { height: "6px", borderRadius: "100px", background: "rgba(31,41,55,0.4)", marginBottom: "8px" },
  progressInner: { height: "100%", borderRadius: "100px", background: "linear-gradient(90deg, #10B981, #14B8A6)", transition: "width 0.5s ease" },
  progressLabel: { fontSize: "13px", color: "#6B7280", marginBottom: "24px" },
  stepsGrid: { display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px" },
  stepList: { display: "flex", flexDirection: "column" as const, gap: "4px" },
  stepItem: { display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "12px", border: "1px solid transparent", background: "transparent", cursor: "pointer", textAlign: "left" as const, width: "100%" },
  stepItemActive: { background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" },
  stepItemDone: { opacity: 0.7 },
  stepCircle: { width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, background: "rgba(31,41,55,0.4)", color: "#6B7280", flexShrink: 0 },
  stepCircleActive: { background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff" },
  stepCircleDone: { background: "rgba(16,185,129,0.15)", color: "#10B981" },
  stepTitle: { fontSize: "14px", fontWeight: 600 },
  stepMeta: { fontSize: "12px", color: "#6B7280", marginTop: "2px" },
  stepContent: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "32px" },
  stepHeader: { display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "28px" },
  stepIcon: { fontSize: "36px", flexShrink: 0 },
  stepContentTitle: { fontSize: "20px", fontWeight: 700, color: "#F9FAFB", marginBottom: "6px" },
  stepContentDesc: { fontSize: "14px", color: "#6B7280", lineHeight: 1.6 },
  formFields: { display: "flex", flexDirection: "column" as const, gap: "18px" },
  fieldRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  field: { display: "flex", flexDirection: "column" as const, gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#D1D5DB" },
  input: { padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.3)", background: "rgba(31,41,55,0.4)", color: "#F9FAFB", fontSize: "14px", outline: "none" },
  uploadZone: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  uploadBox: { border: "2px dashed rgba(75,85,99,0.3)", borderRadius: "14px", padding: "32px 24px", textAlign: "center" as const, background: "rgba(31,41,55,0.2)" },
  uploadBoxIcon: { fontSize: "36px", marginBottom: "12px" },
  uploadBoxTitle: { fontSize: "15px", fontWeight: 600, color: "#F9FAFB", marginBottom: "6px" },
  uploadBoxDesc: { fontSize: "13px", color: "#6B7280", lineHeight: 1.6, marginBottom: "16px" },
  uploadBtn: { padding: "10px 24px", borderRadius: "10px", background: "rgba(16,185,129,0.12)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  cameraArea: { display: "flex", justifyContent: "center" },
  cameraBox: { textAlign: "center" as const, maxWidth: "400px" },
  cameraIcon: { fontSize: "48px", marginBottom: "12px" },
  cameraTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "8px" },
  cameraDesc: { fontSize: "14px", color: "#6B7280", lineHeight: 1.6, marginBottom: "24px" },
  cameraFrame: { width: "200px", height: "200px", borderRadius: "50%", border: "3px solid rgba(16,185,129,0.3)", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(31,41,55,0.3)" },
  cameraCircle: { width: "160px", height: "160px", borderRadius: "50%", border: "2px dashed rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.03)" },
  actionRow: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "28px", paddingTop: "20px", borderTop: "1px solid rgba(75,85,99,0.15)" },
  backBtn: { padding: "12px 24px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  nextBtn: { padding: "12px 32px", borderRadius: "10px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "15px", fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(16,185,129,0.2)" },
  successCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "14px", padding: "48px", textAlign: "center" as const, marginTop: "20px" },
  successIcon: { fontSize: "56px", marginBottom: "16px" },
  successTitle: { fontSize: "24px", fontWeight: 800, color: "#F9FAFB", marginBottom: "12px" },
  successMsg: { fontSize: "15px", color: "#6B7280", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto 24px" },
  statusPill: { display: "inline-flex", padding: "8px 20px", borderRadius: "100px", background: "rgba(245,158,11,0.12)", color: "#F59E0B", fontSize: "14px", fontWeight: 700 },
};
