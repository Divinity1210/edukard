"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_DELINQUENT_ACCOUNTS, MOCK_COMMUNICATION_LOG } from "@/lib/mock-data";
import { formatCAD, formatDate } from "@/lib/calculations";

export default function CollectionsPage() {
  const accounts = MOCK_DELINQUENT_ACCOUNTS;
  const commsLog = MOCK_COMMUNICATION_LOG;
  const [expanded, setExpanded] = useState<string | null>(null);
  const [defaultModal, setDefaultModal] = useState<string | null>(null);
  const [defaultReason, setDefaultReason] = useState("");
  const [defaultNotes, setDefaultNotes] = useState("");

  const statusColors: Record<string, string> = { "1_30_late": "#F59E0B", "31_60_late": "#f97316", "61_90_late": "#EF4444", "default": "#EF4444" };
  const statusLabels: Record<string, string> = { "1_30_late": "1-30 Days Late", "31_60_late": "31-60 Days Late", "61_90_late": "61-90 Days Late", "default": "DEFAULT" };
  const channelIcons: Record<string, string> = { email: "📧", sms: "📱", phone: "📞", letter: "✉️" };

  const DEFAULT_REASONS = [
    "Repeated failure to make scheduled payments",
    "No response to collection communications (30+ days)",
    "Borrower unable to make payments — voluntary default",
    "Employment terminated — unable to service debt",
    "Fraudulent application discovered",
    "Other (specify in notes)",
  ];

  const modalAccount = accounts.find(a => a.loan_id === defaultModal);

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <h1 style={s.title}>Collections Dashboard</h1>
      <p style={s.subtitle}>Monitor missed payments, manage communication, and track audit trail.</p>

      <div style={s.summaryGrid}>
        <div style={s.summaryCard}><span style={{ ...s.summaryValue, color: "#F59E0B" }}>{accounts.length}</span><span style={s.summaryLabel}>Delinquent Accounts</span></div>
        <div style={s.summaryCard}><span style={{ ...s.summaryValue, color: "#EF4444" }}>{formatCAD(accounts.reduce((sum, a) => sum + a.amount_overdue, 0))}</span><span style={s.summaryLabel}>Total Overdue</span></div>
        <div style={s.summaryCard}><span style={{ ...s.summaryValue, color: "#EF4444" }}>{accounts.filter(a => a.status === "default").length}</span><span style={s.summaryLabel}>In Default</span></div>
        <div style={s.summaryCard}><span style={{ ...s.summaryValue, color: "#6B7280" }}>{commsLog.length}</span><span style={s.summaryLabel}>Communications Sent</span></div>
      </div>

      <div style={s.list}>
        {accounts.map((acc) => {
          const isExpanded = expanded === acc.loan_id;
          const accComms = commsLog.filter(c => c.loan_id === acc.loan_id);
          const lateFee = acc.days_late > 30 ? Math.max(25, acc.amount_overdue * 0.03) : 0;

          return (
            <div key={acc.loan_id} style={{ ...s.card, borderLeft: `4px solid ${statusColors[acc.status]}` }}>
              <div style={s.cardHeader}>
                <div><div style={s.borrower}>{acc.borrower}</div><div style={s.university}>{acc.university}</div></div>
                <span style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, color: statusColors[acc.status], background: `${statusColors[acc.status]}10`, textTransform: "uppercase" as const }}>{statusLabels[acc.status]}</span>
              </div>
              <div style={s.detailsGrid}>
                <div><span style={s.dLabel}>Amount Overdue</span><span style={{ ...s.dValue, color: statusColors[acc.status] }}>{formatCAD(acc.amount_overdue)}</span></div>
                <div><span style={s.dLabel}>Days Late</span><span style={s.dValue}>{acc.days_late}</span></div>
                <div><span style={s.dLabel}>Last Contact</span><span style={s.dValue}>{acc.last_contact}</span></div>
                {lateFee > 0 && <div><span style={s.dLabel}>Late Fee Accrued</span><span style={{ ...s.dValue, color: "#EF4444" }}>{formatCAD(Math.round(lateFee * 100) / 100)}</span></div>}
                {lateFee > 0 && <div><span style={s.dLabel}>Total Owed</span><span style={{ ...s.dValue, color: "#EF4444", fontWeight: 800 }}>{formatCAD(Math.round((acc.amount_overdue + lateFee) * 100) / 100)}</span></div>}
              </div>
              <div style={s.actions}>
                <button style={s.actionBtn}>📧 Send Reminder</button>
                <button style={s.actionBtn}>📞 Log Call</button>
                <button
                  onClick={() => {
                    setDefaultModal(acc.loan_id);
                    setDefaultReason("");
                    setDefaultNotes("");
                  }}
                  style={{ ...s.actionBtn, color: "#EF4444", borderColor: "rgba(239,68,68,0.12)" }}
                >
                  ⚠️ Issue Default Notice
                </button>
                <button onClick={() => setExpanded(isExpanded ? null : acc.loan_id)} style={{ ...s.actionBtn, marginLeft: "auto", color: "#14B8A6", borderColor: "rgba(20,184,166,0.2)" }}>
                  {isExpanded ? "Hide" : "View"} Audit Log ({accComms.length})
                </button>
              </div>

              {/* Expandable Communication Audit Log */}
              {isExpanded && accComms.length > 0 && (
                <div style={s.auditSection}>
                  <h3 style={s.auditTitle}>Communication Audit Log</h3>
                  <div style={s.auditList}>
                    {accComms.map((comm) => (
                      <div key={comm.id} style={s.auditItem}>
                        <div style={s.auditIcon}>{channelIcons[comm.channel]}</div>
                        <div style={s.auditContent}>
                          <div style={s.auditHeader}>
                            <span style={s.auditSubject}>{comm.subject}</span>
                            <span style={s.auditChannel}>{comm.channel.toUpperCase()}</span>
                          </div>
                          <p style={s.auditMessage}>{comm.message}</p>
                          <div style={s.auditMeta}>
                            <span>🕐 {formatDate(comm.sent_at)}</span>
                            <span>👤 {comm.sent_by}</span>
                            <span style={{ color: comm.status === "delivered" ? "#10B981" : "#F59E0B" }}>● {comm.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DEFAULT NOTICE CONFIRMATION MODAL — US-A3.1.2 */}
      {defaultModal && modalAccount && (
        <div style={s.modalOverlay} onClick={() => setDefaultModal(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>⚠️ Issue Default Notice</h2>
              <button style={s.modalClose} onClick={() => setDefaultModal(null)}>✕</button>
            </div>
            <div style={s.modalBody}>
              {/* Account summary */}
              <div style={s.modalSummary}>
                <div style={s.modalSumRow}><span>Borrower</span><strong style={{ color: "#F9FAFB" }}>{modalAccount.borrower}</strong></div>
                <div style={s.modalSumRow}><span>University</span><strong>{modalAccount.university}</strong></div>
                <div style={s.modalSumRow}><span>Days Late</span><strong style={{ color: "#EF4444" }}>{modalAccount.days_late} days</strong></div>
                <div style={s.modalSumRow}><span>Amount Overdue</span><strong style={{ color: "#EF4444" }}>{formatCAD(modalAccount.amount_overdue)}</strong></div>
              </div>

              {/* Fine Calculation Display */}
              <div style={s.fineBox}>
                <h3 style={s.fineTitle}>Fine & Fee Calculation</h3>
                <div style={s.fineGrid}>
                  <div><span style={s.fineLabel}>Outstanding Balance</span><span style={s.fineValue}>{formatCAD(modalAccount.amount_overdue)}</span></div>
                  <div><span style={s.fineLabel}>Late Fee (3% or $25 min)</span><span style={{ ...s.fineValue, color: "#EF4444" }}>{formatCAD(Math.max(25, modalAccount.amount_overdue * 0.03))}</span></div>
                  <div><span style={s.fineLabel}>Default Penalty (5%)</span><span style={{ ...s.fineValue, color: "#EF4444" }}>{formatCAD(modalAccount.amount_overdue * 0.05)}</span></div>
                  <div style={{ gridColumn: "1 / -1", borderTop: "1px solid rgba(75,85,99,0.2)", paddingTop: "10px", marginTop: "4px" }}>
                    <span style={s.fineLabel}>Total Amount Due</span>
                    <span style={{ ...s.fineValue, color: "#EF4444", fontSize: "20px" }}>
                      {formatCAD(modalAccount.amount_overdue + Math.max(25, modalAccount.amount_overdue * 0.03) + modalAccount.amount_overdue * 0.05)}
                    </span>
                  </div>
                </div>
              </div>

              <label style={s.modalLabel}>Default Reason *</label>
              <select value={defaultReason} onChange={(e) => setDefaultReason(e.target.value)} style={s.select}>
                <option value="">Select a reason...</option>
                {DEFAULT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>

              <label style={s.modalLabel}>Additional Notes</label>
              <textarea
                value={defaultNotes}
                onChange={(e) => setDefaultNotes(e.target.value)}
                placeholder="Document any relevant context for the default record..."
                style={s.textarea}
                rows={3}
              />

              <div style={s.warningBox}>
                <strong style={{ color: "#EF4444" }}>⚠️ This action is irreversible</strong>
                <p style={{ fontSize: "13px", color: "#D1D5DB", lineHeight: 1.6, marginTop: "6px" }}>
                  Issuing a default notice will:
                </p>
                <ul style={{ fontSize: "13px", color: "#D1D5DB", lineHeight: 1.8, paddingLeft: "18px", marginTop: "4px" }}>
                  <li>Send a formal default notification to the borrower</li>
                  <li>Flag the loan as &quot;DEFAULT&quot; in the system</li>
                  <li>Trigger referral to external collections partner</li>
                  <li>Record all fees and penalties in the audit trail</li>
                </ul>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.modalCancel} onClick={() => setDefaultModal(null)}>Cancel</button>
              <button
                style={{ ...s.modalConfirmDefault, opacity: defaultReason ? 1 : 0.5 }}
                disabled={!defaultReason}
              >
                ⚠️ Confirm Default Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "24px" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "28px" },
  summaryCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "20px", textAlign: "center" as const },
  summaryValue: { display: "block", fontSize: "28px", fontWeight: 800 },
  summaryLabel: { display: "block", fontSize: "13px", color: "#6B7280", marginTop: "4px" },
  list: { display: "flex", flexDirection: "column" as const, gap: "16px" },
  card: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap" as const, gap: "12px" },
  borrower: { fontSize: "16px", fontWeight: 700, color: "#F9FAFB" },
  university: { fontSize: "13px", color: "#6B7280", marginTop: "4px" },
  detailsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "20px" },
  dLabel: { display: "block", fontSize: "12px", color: "#6B7280", marginBottom: "2px" },
  dValue: { display: "block", fontSize: "16px", fontWeight: 700, color: "#F9FAFB" },
  actions: { display: "flex", gap: "10px", paddingTop: "16px", borderTop: "1px solid rgba(75,85,99,0.15)", flexWrap: "wrap" as const },
  actionBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(17,24,39,0.6)", color: "#6B7280", fontSize: "13px", fontWeight: 600, cursor: "pointer" },

  /* Audit */
  auditSection: { marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(75,85,99,0.15)" },
  auditTitle: { fontSize: "14px", fontWeight: 700, color: "#D1D5DB", marginBottom: "14px" },
  auditList: { display: "flex", flexDirection: "column" as const, gap: "10px" },
  auditItem: { display: "flex", gap: "12px", padding: "14px 16px", borderRadius: "10px", background: "rgba(31,41,55,0.3)", border: "1px solid rgba(75,85,99,0.12)" },
  auditIcon: { fontSize: "22px", flexShrink: 0, marginTop: "2px" },
  auditContent: { flex: 1 },
  auditHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", gap: "8px" },
  auditSubject: { fontSize: "14px", fontWeight: 600, color: "#F9FAFB" },
  auditChannel: { padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700, background: "rgba(139,92,246,0.12)", color: "#8B5CF6", letterSpacing: "0.5px" },
  auditMessage: { fontSize: "13px", color: "#6B7280", lineHeight: 1.6, marginBottom: "8px" },
  auditMeta: { display: "flex", gap: "16px", fontSize: "12px", color: "#6B7280" },

  /* Modal */
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" },
  modal: { background: "#111827", border: "1px solid rgba(75,85,99,0.3)", borderRadius: "16px", width: "100%", maxWidth: "560px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto" as const },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 28px 0" },
  modalTitle: { fontSize: "18px", fontWeight: 700, color: "#EF4444" },
  modalClose: { width: "32px", height: "32px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  modalBody: { padding: "20px 28px" },
  modalSummary: { background: "rgba(31,41,55,0.3)", borderRadius: "10px", padding: "14px", marginBottom: "20px" },
  modalSumRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "14px", color: "#6B7280" },
  fineBox: { background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: "12px", padding: "18px", marginBottom: "20px" },
  fineTitle: { fontSize: "14px", fontWeight: 700, color: "#EF4444", marginBottom: "12px" },
  fineGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  fineLabel: { display: "block", fontSize: "12px", color: "#6B7280", marginBottom: "2px" },
  fineValue: { display: "block", fontSize: "16px", fontWeight: 700, color: "#F9FAFB" },
  modalLabel: { display: "block", fontSize: "13px", fontWeight: 600, color: "#D1D5DB", marginBottom: "8px", marginTop: "16px" },
  select: { width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.3)", background: "rgba(31,41,55,0.4)", color: "#F9FAFB", fontSize: "14px", outline: "none" },
  textarea: { width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.3)", background: "rgba(31,41,55,0.4)", color: "#F9FAFB", fontSize: "14px", outline: "none", resize: "vertical" as const, fontFamily: "inherit" },
  warningBox: { padding: "16px 18px", borderRadius: "10px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", marginTop: "16px" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: "10px", padding: "16px 28px 24px", borderTop: "1px solid rgba(75,85,99,0.15)" },
  modalCancel: { padding: "10px 20px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  modalConfirmDefault: { padding: "10px 24px", borderRadius: "10px", background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.25)", fontSize: "14px", fontWeight: 700, cursor: "pointer" },
};
