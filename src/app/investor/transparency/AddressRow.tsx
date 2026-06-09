"use client";

import { useState } from "react";

export default function AddressRow({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <code style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", background: "rgba(31,41,55,0.4)", color: "#D1D5DB", fontSize: "13px", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{address}</code>
      <button
        onClick={() => { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", color: "#6B7280", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
      >
        {copied ? "✓ Copied" : "📋 Copy"}
      </button>
    </div>
  );
}
