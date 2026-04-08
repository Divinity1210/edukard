"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";

export default function StudentSettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <DashboardLayout role="student" userName="Amara Okafor">
      <h1 style={s.title}>Settings</h1>
      <p style={s.subtitle}>Manage your account preferences and security.</p>

      {/* Profile */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Profile Information</h2>
        <div style={s.formGrid}>
          <div style={s.field}><label style={s.label}>Full Name</label><input style={s.input} defaultValue="Amara Okafor" /></div>
          <div style={s.field}><label style={s.label}>Email</label><input style={s.input} defaultValue="amara.okafor@mail.utoronto.ca" disabled /></div>
          <div style={s.field}><label style={s.label}>Phone</label><input style={s.input} defaultValue="+1 (416) 555-0142" /></div>
          <div style={s.field}><label style={s.label}>Address</label><input style={s.input} defaultValue="245 College St, Toronto, ON M5T 1S5" /></div>
        </div>
        <button style={s.saveBtn}>Save Changes</button>
      </div>

      {/* Security */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Security</h2>
        <div style={s.toggleRow}>
          <div><div style={s.toggleLabel}>Two-Factor Authentication</div><div style={s.toggleDesc}>Add extra security with SMS or authenticator app verification.</div></div>
          <button style={{ ...s.toggle, background: twoFactor ? "#10B981" : "#E5E7EB" }} onClick={() => setTwoFactor(!twoFactor)}>
            <span style={{ ...s.toggleKnob, transform: twoFactor ? "translateX(20px)" : "translateX(2px)" }} />
          </button>
        </div>
        <div style={s.toggleRow}>
          <div><div style={s.toggleLabel}>Email Notifications</div><div style={s.toggleDesc}>Receive payment reminders and account updates by email.</div></div>
          <button style={{ ...s.toggle, background: notifications ? "#10B981" : "#E5E7EB" }} onClick={() => setNotifications(!notifications)}>
            <span style={{ ...s.toggleKnob, transform: notifications ? "translateX(20px)" : "translateX(2px)" }} />
          </button>
        </div>
        <button style={s.changePwBtn}>Change Password</button>
      </div>

      {/* Danger */}
      <div style={{ ...s.card, borderColor: "rgba(239,68,68,0.12)" }}>
        <h2 style={{ ...s.cardTitle, color: "#EF4444" }}>Danger Zone</h2>
        <p style={s.dangerDesc}>Permanently delete your account. This action cannot be undone and will forfeit any active loans.</p>
        <button style={s.deleteBtn}>Delete Account</button>
      </div>
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "28px" },
  card: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px", marginBottom: "20px" },
  cardTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "20px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" },
  field: { display: "flex", flexDirection: "column" as const, gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#D1D5DB" },
  input: { padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", color: "#F9FAFB", fontSize: "14px", outline: "none" },
  saveBtn: { padding: "10px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer" },
  toggleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid rgba(75,85,99,0.2)" },
  toggleLabel: { fontSize: "14px", fontWeight: 600, color: "#F9FAFB" },
  toggleDesc: { fontSize: "13px", color: "#6B7280", marginTop: "2px" },
  toggle: { width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer", position: "relative" as const, flexShrink: 0 },
  toggleKnob: { width: "20px", height: "20px", borderRadius: "50%", background: "rgba(17,24,39,0.6)", position: "absolute" as const, top: "2px", transition: "transform 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" },
  changePwBtn: { marginTop: "16px", padding: "10px 24px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(17,24,39,0.6)", color: "#D1D5DB", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  dangerDesc: { fontSize: "14px", color: "#6B7280", marginBottom: "16px", lineHeight: 1.6 },
  deleteBtn: { padding: "10px 24px", borderRadius: "10px", background: "rgba(239,68,68,0.12)", color: "#EF4444", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer" },
};
