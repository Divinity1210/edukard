"use client";

import { useState, useTransition } from "react";
import { setOriginationsPaused } from "@/lib/actions/admin";

/**
 * Origination kill-switch. Persisted in protocol_settings and enforced
 * server-side in submitLoanApplication.
 */
export default function OriginationToggle({ initialPaused = false }: { initialPaused?: boolean }) {
  const [paused, setPaused] = useState(initialPaused);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = !paused;
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("paused", String(next));
      const res = await setOriginationsPaused(fd);
      if (res?.error) setError(res.error);
      else setPaused(next);
    });
  };

  return (
    <div style={controlCard}>
      <div style={controlRow}>
        <div>
          <div style={controlTitle}>Pause New Loan Originations</div>
          <div style={controlDesc}>
            When enabled, no new loan applications will be processed. Existing loans are unaffected.
          </div>
          {error && <div style={errorText}>{error}</div>}
        </div>
        <button
          onClick={toggle}
          disabled={isPending}
          style={{ ...toggleBtn, background: paused ? "#EF4444" : "#10B981", opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? "…" : paused ? "PAUSED" : "ACTIVE"}
        </button>
      </div>
    </div>
  );
}

const controlCard: React.CSSProperties = { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" };
const controlRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px" };
const controlTitle: React.CSSProperties = { fontSize: "16px", fontWeight: 700, color: "#F9FAFB" };
const controlDesc: React.CSSProperties = { fontSize: "13px", color: "#6B7280", marginTop: "6px", maxWidth: "500px" };
const errorText: React.CSSProperties = { fontSize: "12px", color: "#F87171", marginTop: "8px" };
const toggleBtn: React.CSSProperties = { padding: "10px 24px", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 800, border: "none", cursor: "pointer", letterSpacing: "1px", minWidth: "100px" };
