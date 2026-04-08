"use client";

import { use, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_UNDERWRITING_DETAILS } from "@/lib/mock-data";
import { formatCAD, formatPercent, formatDate } from "@/lib/calculations";

export default function UnderwritingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const detail = MOCK_UNDERWRITING_DETAILS[id];
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");

  if (!detail) {
    return (
      <DashboardLayout role="admin" userName="Admin User">
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#F9FAFB" }}>Application Not Found</h2>
          <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "8px" }}>ID: {id}</p>
          <a href="/admin/underwriting" style={{ display: "inline-block", marginTop: "20px", padding: "10px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>← Back to Queue</a>
        </div>
      </DashboardLayout>
    );
  }

  const { application: app, applicant_name, credit, employer, payslips, documents } = detail;
  const riskColors: Record<string, string> = { green: "#10B981", yellow: "#F59E0B", red: "#EF4444" };
  const riskBg: Record<string, string> = { green: "rgba(16,185,129,0.12)", yellow: "rgba(245,158,11,0.12)", red: "rgba(239,68,68,0.12)" };
  const riskLabels: Record<string, string> = { green: "LOW RISK", yellow: "MEDIUM RISK", red: "HIGH RISK" };

  // EduKard Score gauge
  const scoreAngle = (credit.edukard_score / 100) * 270;
  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (scoreAngle / 360) * circumference;

  const REJECT_REASONS = [
    "Insufficient employment history",
    "DTI ratio exceeds threshold",
    "Failed identity verification",
    "Fraudulent documents detected",
    "Insufficient income for requested amount",
    "Student enrollment not confirmed",
    "Other (specify in notes)",
  ];

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div style={s.header}>
        <div>
          <a href="/admin/underwriting" style={s.backLink}>← Back to Queue</a>
          <h1 style={s.title}>{applicant_name}</h1>
          <p style={s.meta}>{app.university_name} · Applied {formatDate(app.created_at)}</p>
        </div>
        <span style={{ ...s.riskBadge, background: riskBg[app.risk_flag], color: riskColors[app.risk_flag] }}>● {riskLabels[app.risk_flag]}</span>
      </div>

      {/* Loan Summary */}
      <div style={s.summaryGrid}>
        {[
          { label: "Loan Amount", value: formatCAD(app.loan_amount), color: "#F9FAFB" },
          { label: "APR", value: `${app.apr}%`, color: "#F9FAFB" },
          { label: "Term", value: `${app.term_months} months`, color: "#F9FAFB" },
          { label: "Monthly Payment", value: formatCAD(app.monthly_payment), color: "#F9FAFB" },
          { label: "Total Cost", value: formatCAD(app.total_cost), color: "#F59E0B" },
        ].map((item) => (
          <div key={item.label} style={s.summaryItem}>
            <span style={s.sumLabel}>{item.label}</span>
            <span style={{ ...s.sumValue, color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>

      <div style={s.twoCol}>
        {/* Credit Assessment with Gauge */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>📊 EduKard Score</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "20px" }}>
            <div style={{ position: "relative", width: "110px", height: "110px" }}>
              <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: "rotate(-135deg)" }}>
                <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(75,85,99,0.15)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`} />
                <circle cx="55" cy="55" r="45" fill="none" stroke={riskColors[credit.risk_flag]} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${circumference}`} strokeDashoffset={dashOffset} style={{ transition: "stroke-dashoffset 1.5s ease" }} />
              </svg>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: riskColors[credit.risk_flag] }}>{credit.edukard_score}</div>
                <div style={{ fontSize: "10px", color: "#6B7280" }}>/100</div>
              </div>
            </div>
            <div>
              <div style={{ ...s.riskPill, background: riskBg[credit.risk_flag], color: riskColors[credit.risk_flag] }}>● {riskLabels[credit.risk_flag]}</div>
              <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "8px" }}>Assessed {formatDate(credit.assessed_at)}</div>
            </div>
          </div>

          <div style={s.metricsGrid}>
            <div style={s.metricItem}><span style={s.mLabel}>Monthly Income</span><span style={s.mValue}>{formatCAD(credit.monthly_income)}</span></div>
            <div style={s.metricItem}><span style={s.mLabel}>DTI Ratio</span><span style={{ ...s.mValue, color: credit.dti_ratio < 30 ? "#10B981" : credit.dti_ratio < 40 ? "#F59E0B" : "#EF4444" }}>{formatPercent(credit.dti_ratio)}</span></div>
            <div style={s.metricItem}><span style={s.mLabel}>Employment</span><span style={s.mValue}>{credit.employment_months} months</span></div>
            <div style={s.metricItem}><span style={s.mLabel}>Approved Limit</span><span style={{ ...s.mValue, color: "#10B981" }}>{formatCAD(credit.approved_limit)}</span></div>
          </div>
          {credit.denial_reason && (
            <div style={s.denialBox}>
              <strong style={{ color: "#EF4444" }}>⚠️ Denial Reason:</strong>
              <p style={{ color: "#D1D5DB", fontSize: "13px", lineHeight: 1.6, marginTop: "6px" }}>{credit.denial_reason}</p>
            </div>
          )}
        </div>

        {/* Employer Data */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>💼 Parsed Payroll Data</h2>
          <div style={s.employerRow}>
            <div><span style={s.mLabel}>Employer</span><span style={s.empName}>{employer.employer_name}</span></div>
            <div><span style={s.mLabel}>Position</span><span style={s.mValue}>{employer.position}</span></div>
            <div><span style={s.mLabel}>Pay Frequency</span><span style={s.mValue}>{employer.pay_frequency}</span></div>
            <div><span style={s.mLabel}>Since</span><span style={s.mValue}>{formatDate(employer.employment_start)}</span></div>
          </div>
          <h3 style={s.subTitle}>Recent Payslips ({payslips.length})</h3>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Date</th><th style={s.th}>Gross</th><th style={s.th}>Net</th><th style={s.th}>Deductions</th><th style={s.th}>Hours</th></tr></thead>
            <tbody>
              {payslips.map((p) => (
                <tr key={p.id}>
                  <td style={s.td}>{formatDate(p.pay_date)}</td>
                  <td style={{ ...s.td, fontWeight: 600 }}>{formatCAD(p.gross_pay)}</td>
                  <td style={{ ...s.td, color: "#10B981" }}>{formatCAD(p.net_pay)}</td>
                  <td style={s.td}>{formatCAD(p.deductions)}</td>
                  <td style={s.td}>{p.hours_worked}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documents */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>📄 Submitted Documents</h2>
        <div style={s.docGrid}>
          {documents.map((d) => (
            <div key={d} style={s.docItem}><span style={{ fontSize: "18px" }}>📋</span><span style={s.docName}>{d}</span><span style={s.docVerified}>✓ Verified</span></div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={s.actionBar}>
        <button style={s.approveBtn} onClick={() => setShowApproveModal(true)}>✓ Approve Application</button>
        <button style={s.rejectBtn} onClick={() => setShowRejectModal(true)}>✕ Reject Application</button>
        <button style={s.overrideBtn}>⚙️ Manual Override</button>
      </div>

      {/* APPROVE MODAL — US-A3.1.1 */}
      {showApproveModal && (
        <div style={s.modalOverlay} onClick={() => setShowApproveModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>✓ Approve Application</h2>
              <button style={s.modalClose} onClick={() => setShowApproveModal(false)}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.modalSummary}>
                <div style={s.modalSumRow}><span>Applicant</span><strong>{applicant_name}</strong></div>
                <div style={s.modalSumRow}><span>Amount</span><strong>{formatCAD(app.loan_amount)}</strong></div>
                <div style={s.modalSumRow}><span>Risk</span><strong style={{ color: riskColors[credit.risk_flag] }}>{riskLabels[credit.risk_flag]}</strong></div>
                <div style={s.modalSumRow}><span>EduKard Score</span><strong>{credit.edukard_score}/100</strong></div>
              </div>
              <label style={s.modalLabel}>Approval Notes (optional)</label>
              <textarea
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                placeholder="Add any notes for the approval record..."
                style={s.textarea}
                rows={4}
              />
              <p style={s.modalHint}>This action will approve the loan and trigger fund disbursement to {app.university_name}.</p>
            </div>
            <div style={s.modalFooter}>
              <button style={s.modalCancel} onClick={() => setShowApproveModal(false)}>Cancel</button>
              <button style={s.modalConfirmApprove}>✓ Confirm Approval</button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL — US-A3.1.1 */}
      {showRejectModal && (
        <div style={s.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={{ ...s.modalTitle, color: "#EF4444" }}>✕ Reject Application</h2>
              <button style={s.modalClose} onClick={() => setShowRejectModal(false)}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.modalSummary}>
                <div style={s.modalSumRow}><span>Applicant</span><strong>{applicant_name}</strong></div>
                <div style={s.modalSumRow}><span>Amount</span><strong>{formatCAD(app.loan_amount)}</strong></div>
              </div>
              <label style={s.modalLabel}>Rejection Reason *</label>
              <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} style={s.select}>
                <option value="">Select a reason...</option>
                {REJECT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <label style={s.modalLabel}>Additional Notes</label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Provide details for the rejection..."
                style={s.textarea}
                rows={4}
              />
              <div style={s.warningBox}>
                <strong style={{ color: "#EF4444" }}>⚠️ Important:</strong> Rejection triggers an adverse action notice to the applicant per federal regulation. Ensure the reason is accurate and documented.
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.modalCancel} onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button style={{ ...s.modalConfirmReject, opacity: rejectReason ? 1 : 0.5 }} disabled={!rejectReason}>
                ✕ Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  backLink: { fontSize: "13px", color: "#6B7280", textDecoration: "none", display: "block", marginBottom: "8px" },
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  meta: { fontSize: "14px", color: "#6B7280", marginTop: "4px" },
  riskBadge: { padding: "8px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 800, letterSpacing: "0.5px" },
  riskPill: { display: "inline-flex", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700 },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "24px" },
  summaryItem: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "12px", padding: "16px", textAlign: "center" as const },
  sumLabel: { display: "block", fontSize: "11px", color: "#6B7280", marginBottom: "4px", textTransform: "uppercase" as const, letterSpacing: "0.5px" },
  sumValue: { display: "block", fontSize: "18px", fontWeight: 800 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" },
  card: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px", marginBottom: "20px" },
  cardTitle: { fontSize: "16px", fontWeight: 700, color: "#F9FAFB", marginBottom: "16px" },
  metricsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" },
  metricItem: { padding: "12px", borderRadius: "10px", background: "rgba(31,41,55,0.3)" },
  mLabel: { display: "block", fontSize: "11px", color: "#6B7280", marginBottom: "4px" },
  mValue: { display: "block", fontSize: "15px", fontWeight: 700, color: "#F9FAFB" },
  denialBox: { padding: "16px", borderRadius: "10px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" },
  employerRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" },
  empName: { display: "block", fontSize: "15px", fontWeight: 700, color: "#F9FAFB" },
  subTitle: { fontSize: "14px", fontWeight: 700, color: "#D1D5DB", marginBottom: "10px" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { padding: "10px 12px", fontSize: "11px", fontWeight: 600, color: "#6B7280", textAlign: "left" as const, textTransform: "uppercase" as const, borderBottom: "1px solid rgba(75,85,99,0.2)" },
  td: { padding: "10px 12px", fontSize: "13px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },
  docGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" },
  docItem: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "10px", background: "rgba(31,41,55,0.3)" },
  docName: { flex: 1, fontSize: "13px", fontWeight: 600, color: "#F9FAFB" },
  docVerified: { fontSize: "11px", fontWeight: 700, color: "#10B981" },
  actionBar: { display: "flex", gap: "12px", padding: "20px 0" },
  approveBtn: { padding: "14px 28px", borderRadius: "10px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "15px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(16,185,129,0.2)" },
  rejectBtn: { padding: "14px 28px", borderRadius: "10px", background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)", fontSize: "15px", fontWeight: 700, cursor: "pointer" },
  overrideBtn: { padding: "14px 28px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(17,24,39,0.6)", color: "#6B7280", fontSize: "15px", fontWeight: 600, cursor: "pointer", marginLeft: "auto" },

  /* Modal */
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" },
  modal: { background: "#111827", border: "1px solid rgba(75,85,99,0.3)", borderRadius: "16px", width: "100%", maxWidth: "520px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 28px 0" },
  modalTitle: { fontSize: "18px", fontWeight: 700, color: "#F9FAFB" },
  modalClose: { width: "32px", height: "32px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  modalBody: { padding: "20px 28px" },
  modalSummary: { background: "rgba(31,41,55,0.3)", borderRadius: "10px", padding: "14px", marginBottom: "20px" },
  modalSumRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "14px", color: "#6B7280" },
  modalLabel: { display: "block", fontSize: "13px", fontWeight: 600, color: "#D1D5DB", marginBottom: "8px", marginTop: "16px" },
  textarea: { width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.3)", background: "rgba(31,41,55,0.4)", color: "#F9FAFB", fontSize: "14px", outline: "none", resize: "vertical" as const, fontFamily: "inherit" },
  select: { width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.3)", background: "rgba(31,41,55,0.4)", color: "#F9FAFB", fontSize: "14px", outline: "none" },
  modalHint: { fontSize: "12px", color: "#6B7280", marginTop: "16px", lineHeight: 1.6 },
  warningBox: { padding: "14px 16px", borderRadius: "10px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", marginTop: "16px", fontSize: "13px", color: "#D1D5DB", lineHeight: 1.6 },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: "10px", padding: "16px 28px 24px", borderTop: "1px solid rgba(75,85,99,0.15)" },
  modalCancel: { padding: "10px 20px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  modalConfirmApprove: { padding: "10px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 0 16px rgba(16,185,129,0.2)" },
  modalConfirmReject: { padding: "10px 24px", borderRadius: "10px", background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.25)", fontSize: "14px", fontWeight: 700, cursor: "pointer" },
};
