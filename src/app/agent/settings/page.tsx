"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";

export default function AgentSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    companyName: "Global Ed Partners",
    contactName: "Daniel Mensah",
    email: "dmensah@globaledpartners.com",
    phone: "+1 (647) 555-0198",
    territory: "Greater Toronto Area, Ontario",
    referralCode: "GEP-2026-DM",
    payoutMethod: "EFT (Direct Deposit)",
    bankName: "TD Canada Trust",
    transitNumber: "16792",
    accountNumber: "****4561",
    commissionRate: "10%",
    emailNotifications: true,
    smsNotifications: false,
    weeklyDigest: true,
    payoutAlerts: true,
  });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const update = (key: string, value: string | boolean) => setForm({ ...form, [key]: value });

  return (
    <DashboardLayout role="agent" userName="Global Ed Partners">
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Partner Portal Settings</h1>
          <p style={s.subtitle}>Manage your partner profile, payout preferences, and notification settings.</p>
        </div>
        <button style={s.saveBtn} onClick={handleSave}>
          {saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      {/* Partner Profile */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>👤 Partner Profile</h2>
        <div style={s.card}>
          <div style={s.fieldGrid}>
            <div style={s.field}>
              <label style={s.label}>Company / Agency Name</label>
              <input style={s.input} value={form.companyName} onChange={(e) => update("companyName", e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Primary Contact</label>
              <input style={s.input} value={form.contactName} onChange={(e) => update("contactName", e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input style={s.input} value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Phone</label>
              <input style={s.input} value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Territory</label>
              <input style={s.input} value={form.territory} onChange={(e) => update("territory", e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Referral Code</label>
              <div style={s.codeRow}>
                <input style={{ ...s.input, flex: 1, fontFamily: "monospace", letterSpacing: "1px" }} value={form.referralCode} readOnly />
                <button style={s.copyBtn} onClick={() => navigator.clipboard.writeText(form.referralCode)}>📋 Copy</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commission & Payout */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>💰 Commission & Payout</h2>
        <div style={s.card}>
          <div style={s.rateCard}>
            <div>
              <div style={s.rateLabel}>Your Commission Rate</div>
              <div style={s.rateValue}>10%</div>
              <div style={s.rateDesc}>Per successfully funded student loan</div>
            </div>
            <div style={s.rateBadge}>Active Partner</div>
          </div>

          <div style={s.securityBadge}>🔒 Bank details are encrypted and used exclusively for commission payouts.</div>
          <div style={s.fieldGrid}>
            <div style={s.field}>
              <label style={s.label}>Payout Method</label>
              <select style={s.input} value={form.payoutMethod} onChange={(e) => update("payoutMethod", e.target.value)}>
                <option>EFT (Direct Deposit)</option>
                <option>Wire Transfer</option>
                <option>Cheque</option>
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Bank Name</label>
              <input style={s.input} value={form.bankName} onChange={(e) => update("bankName", e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Transit Number</label>
              <input style={s.input} value={form.transitNumber} onChange={(e) => update("transitNumber", e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Account Number</label>
              <input style={s.input} value={form.accountNumber} disabled />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>🔔 Notifications</h2>
        <div style={s.card}>
          {[
            { key: "emailNotifications", label: "Email Notifications", desc: "Receive email alerts when referred students progress through application stages." },
            { key: "smsNotifications", label: "SMS Notifications", desc: "Get text message updates for urgent referral activity." },
            { key: "weeklyDigest", label: "Weekly Performance Digest", desc: "Receive a weekly summary of referral conversions and commission earnings." },
            { key: "payoutAlerts", label: "Payout Alerts", desc: "Get notified when commission payouts are initiated or deposited." },
          ].map((toggle) => (
            <div key={toggle.key} style={s.toggleRow}>
              <div>
                <div style={s.toggleLabel}>{toggle.label}</div>
                <div style={s.toggleDesc}>{toggle.desc}</div>
              </div>
              <button
                style={{ ...s.toggleBtn, background: form[toggle.key as keyof typeof form] ? "#EC4899" : "rgba(75,85,99,0.4)" }}
                onClick={() => update(toggle.key, !form[toggle.key as keyof typeof form])}
              >
                {form[toggle.key as keyof typeof form] ? "ON" : "OFF"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" },
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginTop: "4px" },
  saveBtn: { padding: "12px 28px", borderRadius: "12px", background: "linear-gradient(135deg, #EC4899, #BE185D)", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(236,72,153,0.2)" },
  section: { marginBottom: "28px" },
  sectionTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "14px" },
  card: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  securityBadge: { padding: "10px 16px", borderRadius: "10px", background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.15)", color: "#EC4899", fontSize: "12px", marginBottom: "20px" },
  fieldGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" },
  field: { display: "flex", flexDirection: "column" as const, gap: "6px" },
  label: { fontSize: "12px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase" as const, letterSpacing: "0.5px" },
  input: { padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.4)", background: "rgba(31,41,55,0.6)", color: "#F9FAFB", fontSize: "14px", outline: "none" },
  codeRow: { display: "flex", gap: "8px", alignItems: "center" },
  copyBtn: { padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.4)", background: "rgba(31,41,55,0.6)", color: "#F9FAFB", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" as const },
  rateCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderRadius: "12px", background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.15)", marginBottom: "20px" },
  rateLabel: { fontSize: "12px", color: "#9CA3AF", marginBottom: "4px" },
  rateValue: { fontSize: "32px", fontWeight: 800, color: "#EC4899" },
  rateDesc: { fontSize: "12px", color: "#6B7280", marginTop: "4px" },
  rateBadge: { padding: "6px 14px", borderRadius: "8px", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)", color: "#10B981", fontSize: "12px", fontWeight: 600 },
  toggleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid rgba(75,85,99,0.15)", gap: "20px" },
  toggleLabel: { fontSize: "14px", fontWeight: 600, color: "#F9FAFB" },
  toggleDesc: { fontSize: "12px", color: "#6B7280", marginTop: "4px", maxWidth: "450px" },
  toggleBtn: { padding: "8px 20px", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer", minWidth: "60px", letterSpacing: "0.5px" },
};
