"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "student";
  const [role, setRole] = useState<"student" | "investor">(defaultRole as "student" | "investor");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [agreed, setAgreed] = useState(false); const [loading, setLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setTimeout(() => { router.push(role === "investor" ? "/investor/dashboard" : "/student/dashboard"); }, 800); };

  return (
    <div style={s.page}>
      <div style={s.glowOrb} />
      <div style={s.container}>
        <div style={s.card}>
          <div style={s.logoRow}><div style={s.logoIcon}>E</div><span style={s.logoText}>EduKard</span></div>
          <h1 style={s.title}>Create your account</h1>
          <p style={s.subtitle}>Start your journey to fair tuition financing</p>
          <div style={s.roleSelector}>
            <button style={{ ...s.roleBtn, ...(role === "student" ? s.roleBtnActive : {}) }} onClick={() => setRole("student")} type="button">🎓 I&apos;m a Student</button>
            <button style={{ ...s.roleBtn, ...(role === "investor" ? s.roleBtnActiveInv : {}) }} onClick={() => setRole("investor")} type="button">📈 I&apos;m an Investor</button>
          </div>
          <form onSubmit={handleSignup} style={s.form}>
            <div style={s.field}><label style={s.label}>Full legal name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="As shown on your ID" style={s.input} required /></div>
            <div style={s.field}><label style={s.label}>Email address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={role === "student" ? "you@university.ca" : "you@company.ca"} style={s.input} required /></div>
            <div style={s.field}><label style={s.label}>Create password</label><input type="password" placeholder="Min. 8 characters" style={s.input} required minLength={8} /></div>
            <label style={s.consent}><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={s.checkbox} /><span style={s.consentText}>I consent to EduKard collecting my personal information per the <a href="/privacy" style={s.link}>Privacy Policy</a> and PIPEDA.</span></label>
            <button type="submit" style={{ ...s.submitBtn, opacity: agreed ? 1 : 0.5 }} disabled={loading || !agreed}>{loading ? <span style={s.spinner} /> : `Create ${role === "student" ? "Student" : "Investor"} Account`}</button>
          </form>
          <p style={s.footerText}>Already have an account? <a href="/login" style={s.link}>Sign in</a></p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return <Suspense fallback={<div style={{ background: "#0A0F1E", minHeight: "100vh" }} />}><SignupForm /></Suspense>;
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#0A0F1E", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" },
  glowOrb: { position: "absolute", top: "10%", right: "20%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.05), transparent 70%)", pointerEvents: "none" },
  container: { width: "100%", maxWidth: "480px", position: "relative" as const, zIndex: 1 },
  card: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "20px", padding: "40px 32px" },
  logoRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px", justifyContent: "center" },
  logoIcon: { width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #10B981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "18px", color: "#fff", boxShadow: "0 0 20px rgba(16,185,129,0.3)" },
  logoText: { fontSize: "22px", fontWeight: 700, color: "#F9FAFB" },
  title: { fontSize: "24px", fontWeight: 700, color: "#F9FAFB", textAlign: "center" as const, marginBottom: "6px" },
  subtitle: { fontSize: "14px", color: "#6B7280", textAlign: "center" as const, marginBottom: "24px" },
  roleSelector: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" },
  roleBtn: { padding: "14px", borderRadius: "12px", border: "1px solid rgba(75,85,99,0.3)", background: "rgba(31,41,55,0.3)", color: "#6B7280", fontSize: "14px", fontWeight: 600, cursor: "pointer", textAlign: "center" as const },
  roleBtnActive: { border: "1px solid rgba(16,185,129,0.4)", background: "rgba(16,185,129,0.08)", color: "#10B981" },
  roleBtnActiveInv: { border: "1px solid rgba(20,184,166,0.4)", background: "rgba(20,184,166,0.08)", color: "#14B8A6" },
  form: { display: "flex", flexDirection: "column" as const, gap: "18px" },
  field: { display: "flex", flexDirection: "column" as const, gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#D1D5DB" },
  input: { padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.4)", background: "rgba(31,41,55,0.6)", color: "#F9FAFB", fontSize: "15px", outline: "none" },
  consent: { display: "flex", gap: "10px", alignItems: "flex-start", cursor: "pointer" },
  checkbox: { marginTop: "3px", accentColor: "#10B981", width: "16px", height: "16px", flexShrink: 0 },
  consentText: { fontSize: "12px", color: "#6B7280", lineHeight: 1.6 },
  link: { color: "#10B981", fontWeight: 600, textDecoration: "none" },
  submitBtn: { padding: "14px", borderRadius: "12px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "16px", fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(16,185,129,0.2)" },
  spinner: { width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" },
  footerText: { textAlign: "center" as const, fontSize: "14px", color: "#6B7280", marginTop: "24px" },
};
