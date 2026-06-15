"use client";

import { useState } from "react";

/**
 * Origination kill-switch. Visual/local for the pilot; persisting this to a
 * protocol_settings row + enforcing it in the loan submit action is a fast
 * follow (see PRODUCTION.md).
 */
export default function OriginationToggle({ initialPaused = false }: { initialPaused?: boolean }) {
  const [paused, setPaused] = useState(initialPaused);
  return (
    <div style={controlCard}>
      <div style={controlRow}>
        <div>
          <div style={controlTitle}>Pause New Loan Originations</div>
          <div style={controlDesc}>
            When enabled, no new loan applications will be processed. Existing loans are unaffected.
          </div>
        </div>
        <button
          onClick={() => setPaused(!paused)}
          style={{ ...toggleBtn, background: paused ? "#EF4444" : "#10B981" }}
        >
          {paused ? "PAUSED" : "ACTIVE"}
        </button>
      </div>
    </div>
  );
}

const controlCard: React.CSSProperties = { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" };
const controlRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px" };
const controlTitle: React.CSSProperties = { fontSize: "16px", fontWeight: 700, color: "#F9FAFB" };
const controlDesc: React.CSSProperties = { fontSize: "13px", color: "#6B7280", marginTop: "6px", maxWidth: "500px" };
const toggleBtn: React.CSSProperties = { padding: "10px 24px", borderRadius: "10px", color: "#fff", fontSize: "13px", fontWeight: 800, border: "none", cursor: "pointer", letterSpacing: "1px", minWidth: "100px" };
