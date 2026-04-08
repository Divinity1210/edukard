"use client";

import DashboardLayout from "@/components/DashboardLayout";

export default function InvestorSettingsPage() {
  return (
    <DashboardLayout role="investor" userName="Marcus Chen">
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#F9FAFB" }}>Settings</h1>
      <p style={{ fontSize: "15px", color: "#6B7280", marginBottom: "28px" }}>Manage your investor profile and preferences.</p>
      <div style={{ background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "20px" }}>Profile</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div><label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#D1D5DB", marginBottom: "6px" }}>Full Name</label><input style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", fontSize: "14px" }} defaultValue="Marcus Chen" /></div>
          <div><label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#D1D5DB", marginBottom: "6px" }}>Email</label><input style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", fontSize: "14px" }} defaultValue="marcus.chen@nexuscapital.ca" disabled /></div>
          <div><label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#D1D5DB", marginBottom: "6px" }}>Investor Type</label><input style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", fontSize: "14px" }} defaultValue="Individual" disabled /></div>
          <div><label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#D1D5DB", marginBottom: "6px" }}>Phone</label><input style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", fontSize: "14px" }} defaultValue="+1 (604) 555-0198" /></div>
        </div>
        <button style={{ padding: "10px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #14B8A6, #0D9488)", color: "#fff", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer" }}>Save Changes</button>
      </div>
    </DashboardLayout>
  );
}
