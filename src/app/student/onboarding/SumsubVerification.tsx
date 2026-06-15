"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { startSumsubVerification, refreshSumsubToken } from "@/lib/actions/sumsub";

const SUMSUB_SCRIPT = "https://static.sumsub.com/idensic/static/sns-websdk-builder.js";

type SnsBuilder = {
  withConf: (c: Record<string, unknown>) => SnsBuilder;
  withOptions: (o: Record<string, unknown>) => SnsBuilder;
  on: (event: string, cb: (...args: unknown[]) => void) => SnsBuilder;
  build: () => { launch: (selector: string) => void };
};
type SnsWebSdk = { init: (token: string, onRefresh: () => Promise<string>) => SnsBuilder };
declare global {
  interface Window {
    snsWebSdk?: SnsWebSdk;
  }
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.snsWebSdk) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SUMSUB_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Sumsub")));
      return;
    }
    const script = document.createElement("script");
    script.src = SUMSUB_SCRIPT;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Sumsub"));
    document.head.appendChild(script);
  });
}

export default function SumsubVerification({ kycStatus }: { kycStatus?: string | null }) {
  const router = useRouter();
  const launched = useRef(false);
  const [state, setState] = useState<"idle" | "loading" | "launched" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const launch = async () => {
    if (launched.current) return;
    setState("loading");
    setError(null);
    try {
      const { token, error } = await startSumsubVerification();
      if (error || !token) throw new Error(error || "Could not start verification");

      await loadScript();
      if (!window.snsWebSdk) throw new Error("Sumsub WebSDK failed to load");

      const sdk = window.snsWebSdk
        .init(token, async () => await refreshSumsubToken())
        .withConf({ lang: "en" })
        .withOptions({ addViewportTag: false, adaptIframeHeight: true })
        .on("idCheck.onApplicantStatusChanged", () => router.refresh())
        .build();

      sdk.launch("#sumsub-websdk-container");
      launched.current = true;
      setState("launched");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
      setState("error");
    }
  };

  if (kycStatus === "approved") {
    return (
      <div style={s.card}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={s.title}>Identity Verified</h2>
        <p style={s.msg}>Your identity has been verified. You can now apply for tuition financing.</p>
        <a href="/student/apply" style={s.cta}>Apply for Financing →</a>
      </div>
    );
  }

  return (
    <>
      <div style={s.banner}>
        <img src="/images/kyc-verification.png" alt="Identity verification" style={s.bannerImg} />
        <div style={s.bannerOverlay} />
        <div style={s.bannerContent}>
          <h1 style={s.pageTitle}>Identity Verification</h1>
          <p style={s.pageSub}>Complete identity verification (ID + liveness) to unlock tuition financing.</p>
        </div>
      </div>

      <div style={s.trustRow}>
        {["🔒 Bank-level Encryption", "🛡️ Sumsub Verified", "📋 PIPEDA Compliant"].map((b) => (
          <span key={b} style={s.trustBadge}>{b}</span>
        ))}
      </div>

      {state !== "launched" && (
        <div style={s.card}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🪪</div>
          <h2 style={s.title}>{kycStatus === "pending" ? "Continue your verification" : "Verify your identity"}</h2>
          <p style={s.msg}>
            You&apos;ll be guided through document upload and a quick liveness check, powered by Sumsub.
            This usually takes 2–3 minutes.
          </p>
          <button onClick={launch} disabled={state === "loading"} style={{ ...s.cta, opacity: state === "loading" ? 0.6 : 1, border: "none", cursor: state === "loading" ? "wait" : "pointer" }}>
            {state === "loading" ? "Starting…" : "Start Verification →"}
          </button>
          {error && <p style={{ fontSize: 13, color: "#EF4444", marginTop: 14 }}>{error}</p>}
        </div>
      )}

      <div id="sumsub-websdk-container" style={{ marginTop: 20, minHeight: state === "launched" ? 600 : 0 }} />
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  banner: { position: "relative", borderRadius: "16px", overflow: "hidden", marginBottom: "20px", height: "160px", display: "flex", alignItems: "flex-end", padding: "24px 28px" },
  bannerImg: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" },
  bannerOverlay: { position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(10,15,30,0.85) 40%, rgba(10,15,30,0.3) 100%)" },
  bannerContent: { position: "relative", zIndex: 1 },
  pageTitle: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB", letterSpacing: "-0.5px" },
  pageSub: { fontSize: "15px", color: "#D1D5DB", marginTop: "4px" },
  trustRow: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  trustBadge: { padding: "6px 14px", borderRadius: "100px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", color: "#10B981", fontSize: "12px", fontWeight: 600 },
  card: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "40px", textAlign: "center", maxWidth: 520, margin: "0 auto" },
  title: { fontSize: "22px", fontWeight: 800, color: "#F9FAFB", marginBottom: "10px" },
  msg: { fontSize: "15px", color: "#6B7280", lineHeight: 1.7, marginBottom: "24px" },
  cta: { display: "inline-block", padding: "14px 32px", borderRadius: "12px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "15px", fontWeight: 600, textDecoration: "none", boxShadow: "0 0 20px rgba(16,185,129,0.2)" },
};
