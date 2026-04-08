"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    setTimeout(() => {
      if (email.includes("admin")) router.push("/admin/dashboard");
      else if (email.includes("investor") || email.includes("capital")) router.push("/investor/dashboard");
      else if (email.includes("university") || email.includes("bursar")) router.push("/university/dashboard");
      else if (email.includes("agent") || email.includes("partner")) router.push("/agent/dashboard");
      else router.push("/student/dashboard");
    }, 800);
  };

  return (
    <div style={s.page}>
      <div style={s.glowOrb} />
      <div style={s.container}>
        <div style={s.card}>
          <div style={s.logoRow}><img src="/images/edukard-logo.png" alt="EduKard" style={s.logoImg} /></div>
          <h1 style={s.title}>Welcome back</h1>
          <p style={s.subtitle}>Sign in to your account</p>
          <form onSubmit={handleLogin} style={s.form}>
            <div style={s.field}><label style={s.label}>Email address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.ca" style={s.input} required /></div>
            <div style={s.field}><label style={s.label}>Password</label><input type="password" placeholder="••••••••" style={s.input} defaultValue="demo123" required /></div>
            <button type="submit" style={s.submitBtn} disabled={loading}>{loading ? <span style={s.spinner} /> : "Sign In"}</button>
          </form>
          <div style={s.divider}><span style={s.dividerLine} /><span style={s.dividerText}>or</span><span style={s.dividerLine} /></div>
          <div style={s.socialBtns}>
            <button style={s.socialBtn} onClick={() => router.push("/student/dashboard")}>Google</button>
            <button style={s.socialBtn} onClick={() => router.push("/student/dashboard")}>Apple</button>
          </div>
          <p style={s.footerText}>Don&apos;t have an account? <a href="/signup" style={s.link}>Sign up</a></p>
          <div style={s.demoHint}><strong>Demo:</strong> Use email with &quot;admin&quot;, &quot;investor&quot;, &quot;university&quot;, &quot;agent&quot;, or &quot;student&quot; to access different portals.</div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div style={{ background: "#0A0F1E", minHeight: "100vh" }} />}><LoginForm /></Suspense>;
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#0A0F1E", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" },
  glowOrb: { position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%)", pointerEvents: "none" },
  container: { width: "100%", maxWidth: "440px", padding: "24px", position: "relative" as const, zIndex: 1 },
  card: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "20px", padding: "40px 32px" },
  logoRow: { display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "32px" },
  logoImg: { height: "56px", objectFit: "contain" as const },
  logoText: { fontSize: "22px", fontWeight: 700, color: "#F9FAFB" },
  title: { fontSize: "24px", fontWeight: 700, color: "#F9FAFB", textAlign: "center" as const, marginBottom: "6px" },
  subtitle: { fontSize: "14px", color: "#6B7280", textAlign: "center" as const, marginBottom: "28px" },
  form: { display: "flex", flexDirection: "column" as const, gap: "18px" },
  field: { display: "flex", flexDirection: "column" as const, gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#D1D5DB" },
  input: { padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.4)", background: "rgba(31,41,55,0.6)", color: "#F9FAFB", fontSize: "15px", outline: "none" },
  submitBtn: { padding: "14px", borderRadius: "12px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "16px", fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "4px", boxShadow: "0 0 20px rgba(16,185,129,0.2)" },
  spinner: { width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" },
  divider: { display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" },
  dividerLine: { flex: 1, height: "1px", background: "rgba(75,85,99,0.3)" },
  dividerText: { fontSize: "12px", color: "#6B7280" },
  socialBtns: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  socialBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.3)", background: "rgba(31,41,55,0.3)", color: "#D1D5DB", fontSize: "14px", fontWeight: 500, cursor: "pointer" },
  footerText: { textAlign: "center" as const, fontSize: "14px", color: "#6B7280", marginTop: "24px" },
  link: { color: "#10B981", fontWeight: 600 },
  demoHint: { marginTop: "20px", padding: "12px", borderRadius: "10px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", fontSize: "12px", color: "#10B981", textAlign: "center" as const, lineHeight: 1.5 },
};
