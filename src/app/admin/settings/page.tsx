"use client";

import DashboardLayout from "@/components/DashboardLayout";

export default function AdminSettingsPage() {
  return (
    <DashboardLayout role="admin" userName="Admin User">
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#F9FAFB" }}>Admin Settings</h1>
      <p style={{ fontSize: "15px", color: "#6B7280", marginBottom: "28px" }}>Platform configuration and admin preferences.</p>
      <div style={{ background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "20px" }}>Underwriting Parameters</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div><label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#D1D5DB", marginBottom: "6px" }}>Max DTI Ratio (%)</label><input style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", fontSize: "14px" }} defaultValue="40" type="number" /></div>
          <div><label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#D1D5DB", marginBottom: "6px" }}>Min EduKard Score</label><input style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", fontSize: "14px" }} defaultValue="40" type="number" /></div>
          <div><label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#D1D5DB", marginBottom: "6px" }}>Default APR (%)</label><input style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", fontSize: "14px" }} defaultValue="11.5" type="number" step="0.1" /></div>
          <div><label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#D1D5DB", marginBottom: "6px" }}>Max Loan Amount (CAD)</label><input style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", fontSize: "14px" }} defaultValue="50000" type="number" /></div>
        </div>
        <button style={{ padding: "10px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", color: "#fff", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer" }}>Save Parameters</button>
      </div>
    </DashboardLayout>
  );
}
