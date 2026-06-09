"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPlaidLinkToken, exchangePlaidPublicToken } from "@/lib/actions/plaid";

const PLAID_SCRIPT = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";

type PlaidHandler = { open: () => void; exit: () => void; destroy: () => void };
type PlaidMetadata = { institution?: { institution_id?: string; name?: string } | null };
type PlaidCreateOptions = {
  token: string;
  onSuccess: (publicToken: string, metadata: PlaidMetadata) => void;
  onExit?: () => void;
};
declare global {
  interface Window {
    Plaid?: { create: (opts: PlaidCreateOptions) => PlaidHandler };
  }
}

/** Lazy-load the Plaid Link script once. */
function loadPlaidScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Plaid) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PLAID_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Plaid")));
      return;
    }
    const script = document.createElement("script");
    script.src = PLAID_SCRIPT;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Plaid"));
    document.head.appendChild(script);
  });
}

export default function PlaidLinkButton({ enabled, label }: { enabled: boolean; label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handlerRef = useRef<PlaidHandler | null>(null);

  useEffect(() => {
    return () => handlerRef.current?.destroy();
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { link_token, error } = await createPlaidLinkToken();
      if (error || !link_token) throw new Error(error || "Could not start Plaid");

      await loadPlaidScript();
      if (!window.Plaid) throw new Error("Plaid failed to load");

      handlerRef.current = window.Plaid.create({
        token: link_token,
        onSuccess: async (publicToken, metadata) => {
          setLoading(true);
          const res = await exchangePlaidPublicToken({
            publicToken,
            institutionId: metadata.institution?.institution_id ?? null,
            institutionName: metadata.institution?.name ?? null,
          });
          setLoading(false);
          if (res.error) setError(res.error);
          else router.refresh();
        },
        onExit: () => setLoading(false),
      });
      handlerRef.current.open();
      setLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
      setLoading(false);
    }
  }, [router]);

  return (
    <div style={{ maxWidth: 320, margin: "0 auto" }}>
      <button onClick={connect} disabled={!enabled || loading} style={{ ...btn, opacity: enabled && !loading ? 1 : 0.6, cursor: enabled && !loading ? "pointer" : "not-allowed" }}>
        {!enabled ? "Plaid not configured yet" : loading ? "Connecting…" : (label || "Connect with Plaid →")}
      </button>
      {error && <p style={{ fontSize: 12, color: "#EF4444", marginTop: 10 }}>{error}</p>}
      {!enabled && <p style={{ fontSize: 12, color: "#6B7280", marginTop: 10 }}>Add PLAID_CLIENT_ID &amp; PLAID_SECRET to enable the connection flow.</p>}
    </div>
  );
}

const btn: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  background: "linear-gradient(135deg, #10B981, #059669)",
  color: "#fff",
  fontSize: "15px",
  fontWeight: 600,
  border: "none",
  boxShadow: "0 0 20px rgba(16,185,129,0.15)",
};
