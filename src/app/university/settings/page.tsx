"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";

export default function UniversitySettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    institutionName: "University of Toronto",
    registrarEmail: "bursar@utoronto.ca",
    contactPhone: "+1 (416) 978-2190",
    campusAddress: "27 King's College Circle, Toronto, ON M5S 1A1",
    dliNumber: "O19395309877",
    bankName: "Royal Bank of Canada",
    transitNumber: "00002",
    institutionNumber: "003",
    accountNumber: "****7892",
    invoicePrefix: "UOFT-INV",
    autoReconcile: true,
    emailNotifications: true,
    settlementAlerts: true,
    monthlyReports: true,
  });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const update = (key: string, value: string | boolean) => setForm({ ...form, [key]: value });

  return (
    <DashboardLayout role="university" userName="UofT Bursar">
      <div style={s.header}>
        <div>
          <h1 style={s.title}>University Portal Settings</h1>
          <p style={s.subtitle}>Manage institution profile, banking details, and notification preferences.</p>
        </div>
        <button style={s.saveBtn} onClick={handleSave}>
          {saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      {/* Institution Profile */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>🏛️ Institution Profile</h2>
        <div style={s.card}>
          <div style={s.fieldGrid}>
            <div style={s.field}>
              <label style={s.label}>Institution Name</label>
              <input style={s.input} value={form.institutionName} onChange={(e) => update("institutionName", e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Registrar / Bursar Email</label>
              <input style={s.input} value={form.registrarEmail} onChange={(e) => update("registrarEmail", e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Contact Phone</label>
              <input style={s.input} value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Campus Address</label>
              <input style={s.input} value={form.campusAddress} onChange={(e) => update("campusAddress", e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>DLI Number</label>
              <input style={s.input} value={form.dliNumber} onChange={(e) => update("dliNumber", e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Invoice Prefix</label>
              <input style={s.input} value={form.invoicePrefix} onChange={(e) => update("invoicePrefix", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Banking Details */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>🏦 Settlement Banking</h2>
        <div style={s.card}>
          <div style={s.securityBadge}>🔒 Bank-level encryption — details are stored securely and never shared.</div>
          <div style={s.fieldGrid}>
            <div style={s.field}>
              <label style={s.label}>Bank Name</label>
              <input style={s.input} value={form.bankName} onChange={(e) => update("bankName", e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Transit Number</label>
              <input style={s.input} value={form.transitNumber} onChange={(e) => update("transitNumber", e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Institution Number</label>
              <input style={s.input} value={form.institutionNumber} onChange={(e) => update("institutionNumber", e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Account Number</label>
              <input style={s.input} value={form.accountNumber} disabled />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>🔔 Notification Preferences</h2>
        <div style={s.card}>
          {[
            { key: "autoReconcile", label: "Auto-Reconcile Invoices", desc: "Automatically match incoming EduKard payments to open invoices." },
            { key: "emailNotifications", label: "Email Notifications", desc: "Receive email alerts for new settlements and student enrollments." },
            { key: "settlementAlerts", label: "Settlement Alerts", desc: "Get notified when a new batch settlement is initiated." },
            { key: "monthlyReports", label: "Monthly Reports", desc: "Receive monthly PDF reports of all EduKard transactions." },
          ].map((toggle) => (
            <div key={toggle.key} style={s.toggleRow}>
              <div>
                <div style={s.toggleLabel}>{toggle.label}</div>
                <div style={s.toggleDesc}>{toggle.desc}</div>
              </div>
              <button
                style={{ ...s.toggleBtn, background: form[toggle.key as keyof typeof form] ? "#F59E0B" : "rgba(75,85,99,0.4)" }}
                onClick={() => update(toggle.key, !form[toggle.key as keyof typeof form])}
              >
                {form[toggle.key as keyof typeof form] ? "ON" : "OFF"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div style={s.section}>
        <h2 style={{ ...s.sectionTitle, color: "#EF4444" }}>⚠️ Danger Zone</h2>
        <div style={{ ...s.card, borderColor: "rgba(239,68,68,0.2)" }}>
          <div style={s.toggleRow}>
            <div>
              <div style={s.toggleLabel}>Disconnect from EduKard</div>
              <div style={s.toggleDesc}>This will remove your institution from the EduKard network. Active settlements will be honored.</div>
            </div>
            <button style={s.dangerBtn}>Request Disconnect</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" },
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginTop: "4px" },
  saveBtn: { padding: "12px 28px", borderRadius: "12px", background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(245,158,11,0.2)" },
  section: { marginBottom: "28px" },
  sectionTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "14px" },
  card: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  securityBadge: { padding: "10px 16px", borderRadius: "10px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", color: "#F59E0B", fontSize: "12px", marginBottom: "20px" },
  fieldGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" },
  field: { display: "flex", flexDirection: "column" as const, gap: "6px" },
  label: { fontSize: "12px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase" as const, letterSpacing: "0.5px" },
  input: { padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.4)", background: "rgba(31,41,55,0.6)", color: "#F9FAFB", fontSize: "14px", outline: "none" },
  toggleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid rgba(75,85,99,0.15)", gap: "20px" },
  toggleLabel: { fontSize: "14px", fontWeight: 600, color: "#F9FAFB" },
  toggleDesc: { fontSize: "12px", color: "#6B7280", marginTop: "4px", maxWidth: "450px" },
  toggleBtn: { padding: "8px 20px", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer", minWidth: "60px", letterSpacing: "0.5px" },
  dangerBtn: { padding: "10px 20px", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#EF4444", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
};
