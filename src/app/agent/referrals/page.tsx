"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_AGENT_REFERRALS } from "@/lib/mock-data";
import { formatCAD } from "@/lib/calculations";
import { UNIVERSITIES } from "@/lib/constants";

export default function AgentReferralsPage() {
  const [referrals, setReferrals] = useState(MOCK_AGENT_REFERRALS);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", university: "", note: "" });
  const [inviteSent, setInviteSent] = useState(false);
  const referralCode = "GEP-2026-DM";
  const referralLink = `https://edukard.ca/signup?ref=${referralCode}`;

  const handleSendInvite = () => {
    if (!inviteForm.name || !inviteForm.email) return;
    const uniName = UNIVERSITIES.find(u => u.id === inviteForm.university)?.name || "Not specified";
    setReferrals([
      { id: `ref-${Date.now()}`, student_name: inviteForm.name, university_target: uniName, loan_status: "draft" as const, commission_earned: 0, commission_status: "pending" as const, referred_at: new Date().toISOString() },
      ...referrals,
    ]);
    setInviteSent(true);
  };

  const handleCloseInvite = () => {
    setShowInvite(false);
    setInviteSent(false);
    setInviteForm({ name: "", email: "", university: "", note: "" });
  };

  const statusColor = (s: string) => {
    if (s === "repaying" || s === "disbursed" || s === "paid_off") return "#10B981";
    if (s === "under_review" || s === "submitted" || s === "draft") return "#F59E0B";
    if (s === "rejected" || s === "defaulted") return "#EF4444";
    return "#6B7280";
  };

  return (
    <DashboardLayout role="agent" userName="Global Ed Partners">
      <div style={s.header}>
        <div><h1 style={s.title}>My Referrals</h1><p style={s.subtitle}>Detailed view of student progress and loan status.</p></div>
        <button style={s.linkBtn} onClick={() => setShowInvite(true)}>+ Invite Student</button>
      </div>

      {/* Referral Code Banner */}
      <div style={s.codeBanner}>
        <div>
          <div style={s.codeBannerLabel}>Your Referral Code</div>
          <div style={s.codeBannerValue}>{referralCode}</div>
        </div>
        <div style={s.codeBannerLink}>
          <span style={s.linkText}>{referralLink}</span>
          <button style={s.copyBtn} onClick={() => { navigator.clipboard.writeText(referralLink); }}>📋 Copy</button>
        </div>
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Student Name</th>
              <th style={s.th}>Referral Date</th>
              <th style={s.th}>Target University</th>
              <th style={s.th}>Loan Status</th>
              <th style={s.th}>Approved Amount</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((ref) => (
              <tr key={ref.id}>
                <td style={{ ...s.td, fontWeight: 600, color: "#F9FAFB" }}>{ref.student_name}</td>
                <td style={s.td}>{new Date(ref.referred_at).toLocaleDateString()}</td>
                <td style={s.td}>{ref.university_target}</td>
                <td style={s.td}>
                  <span style={{ ...s.pill, color: statusColor(ref.loan_status), background: `${statusColor(ref.loan_status)}18` }}>{ref.loan_status.replace("_", " ").toUpperCase()}</span>
                </td>
                <td style={{ ...s.td, color: "#10B981" }}>{ref.loan_amount ? formatCAD(ref.loan_amount) : "---"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div style={s.overlay} onClick={handleCloseInvite}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            {!inviteSent ? (
              <>
                <div style={s.modalHeader}>
                  <h2 style={s.modalTitle}>Invite a Student</h2>
                  <button style={s.closeBtn} onClick={handleCloseInvite}>✕</button>
                </div>
                <p style={s.modalDesc}>Send a personalized referral invitation to a prospective student. They&apos;ll receive a signup link with your referral code automatically attached.</p>

                <div style={s.formFields}>
                  <div style={s.field}><label style={s.label}>Student Name *</label><input style={s.input} placeholder="Full name" value={inviteForm.name} onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })} /></div>
                  <div style={s.field}><label style={s.label}>Email Address *</label><input style={s.input} type="email" placeholder="student@email.com" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} /></div>
                  <div style={s.field}>
                    <label style={s.label}>Target University</label>
                    <select style={s.input} value={inviteForm.university} onChange={e => setInviteForm({ ...inviteForm, university: e.target.value })}>
                      <option value="">Select university...</option>
                      {UNIVERSITIES.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div style={s.field}><label style={s.label}>Personal Note (optional)</label><textarea style={{ ...s.input, minHeight: "80px", resize: "vertical" as const }} placeholder="Hi! I'd like to tell you about EduKard..." value={inviteForm.note} onChange={e => setInviteForm({ ...inviteForm, note: e.target.value })} /></div>
                </div>

                <div style={s.referralPreview}>
                  <span style={s.previewLabel}>Referral Link:</span>
                  <span style={s.previewCode}>{referralLink}</span>
                </div>

                <div style={s.modalActions}>
                  <button style={s.cancelBtn} onClick={handleCloseInvite}>Cancel</button>
                  <button style={{ ...s.sendBtn, opacity: inviteForm.name && inviteForm.email ? 1 : 0.5 }} disabled={!inviteForm.name || !inviteForm.email} onClick={handleSendInvite}>📩 Send Invitation</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center" as const, padding: "20px 0" }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
                <h2 style={s.modalTitle}>Invitation Sent!</h2>
                <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.7, margin: "12px 0 8px" }}>
                  An email has been sent to <strong style={{ color: "#F9FAFB" }}>{inviteForm.email}</strong> with your referral link.
                </p>
                <div style={s.referralPreview}>
                  <span style={s.previewLabel}>Referral Code:</span>
                  <span style={s.previewCode}>{referralCode}</span>
                </div>
                <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "12px" }}>Once they sign up and their loan is funded, you&apos;ll earn a 10% commission.</p>
                <button style={{ ...s.sendBtn, marginTop: "20px" }} onClick={handleCloseInvite}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginTop: "4px" },
  linkBtn: { padding: "10px 20px", borderRadius: "10px", background: "#EC4899", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer" },

  codeBanner: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderRadius: "14px", background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.15)", marginBottom: "24px", flexWrap: "wrap" as const, gap: "16px" },
  codeBannerLabel: { fontSize: "12px", color: "#6B7280", fontWeight: 600 },
  codeBannerValue: { fontSize: "22px", fontWeight: 800, color: "#EC4899", fontFamily: "monospace", letterSpacing: "1px" },
  codeBannerLink: { display: "flex", alignItems: "center", gap: "10px" },
  linkText: { fontSize: "13px", color: "#6B7280", fontFamily: "monospace" },
  copyBtn: { padding: "6px 14px", borderRadius: "8px", border: "1px solid rgba(236,72,153,0.2)", background: "rgba(236,72,153,0.08)", color: "#EC4899", fontSize: "12px", fontWeight: 700, cursor: "pointer" },

  card: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { padding: "14px 20px", textAlign: "left" as const, fontSize: "12px", fontWeight: 600, color: "#6B7280", borderBottom: "1px solid rgba(75,85,99,0.2)", textTransform: "uppercase" as const },
  td: { padding: "16px 20px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },
  pill: { fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px" },

  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "rgba(17,24,39,0.95)", border: "1px solid rgba(75,85,99,0.3)", borderRadius: "16px", padding: "32px", maxWidth: "520px", width: "90%", maxHeight: "90vh", overflowY: "auto" as const },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  modalTitle: { fontSize: "20px", fontWeight: 700, color: "#F9FAFB" },
  closeBtn: { width: "32px", height: "32px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  modalDesc: { fontSize: "14px", color: "#6B7280", lineHeight: 1.7, marginBottom: "24px" },

  formFields: { display: "flex", flexDirection: "column" as const, gap: "16px" },
  field: { display: "flex", flexDirection: "column" as const, gap: "6px" },
  label: { fontSize: "12px", fontWeight: 600, color: "#D1D5DB" },
  input: { padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.3)", background: "rgba(31,41,55,0.4)", color: "#F9FAFB", fontSize: "14px", outline: "none" },

  referralPreview: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "10px", background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.15)", marginTop: "16px" },
  previewLabel: { fontSize: "12px", color: "#6B7280" },
  previewCode: { fontSize: "13px", fontWeight: 700, color: "#EC4899", fontFamily: "monospace" },

  modalActions: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(75,85,99,0.15)" },
  cancelBtn: { padding: "10px 24px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  sendBtn: { padding: "10px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #EC4899, #DB2777)", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer" },
};
