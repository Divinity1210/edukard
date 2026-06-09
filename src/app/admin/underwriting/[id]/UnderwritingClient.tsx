"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatCAD, formatPercent, formatDate } from "@/lib/calculations";
import { approveLoan, rejectLoan, disburseLoan } from "@/lib/actions/admin";

export type UnderwritingDetailProps = {
  loanId: string;
  applicantName: string;
  universityName: string;
  status: string;
  loanAmount: number;
  apr: number;
  termMonths: number;
  monthlyPayment: number;
  totalCost: number;
  riskFlag: "green" | "yellow" | "red";
  createdAt: string;
  kycStatus: string;
  invoiceUrl: string | null;
  credit: {
    edukardScore: number;
    riskFlag: "green" | "yellow" | "red";
    assessedAt: string;
    monthlyIncome: number;
    dtiRatio: number;
    employmentMonths: number;
    approvedLimit: number;
    denialReason: string | null;
  } | null;
  payrollConnections: { institution_name: string | null; status: string }[];
};

export default function UnderwritingClient({ detail }: { detail: UnderwritingDetailProps }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const riskColors: Record<string, string> = { green: "#10B981", yellow: "#F59E0B", red: "#EF4444" };
  const riskBg: Record<string, string> = { green: "rgba(16,185,129,0.12)", yellow: "rgba(245,158,11,0.12)", red: "rgba(239,68,68,0.12)" };
  const riskLabels: Record<string, string> = { green: "LOW RISK", yellow: "MEDIUM RISK", red: "HIGH RISK" };

  const REJECT_REASONS = [
    "Insufficient employment history",
    "DTI ratio exceeds threshold",
    "Failed identity verification",
    "Fraudulent documents detected",
    "Insufficient income for requested amount",
    "Student enrollment not confirmed",
    "Other (specify in notes)",
  ];

  const score = detail.credit?.edukardScore ?? 0;
  const creditRisk = detail.credit?.riskFlag ?? detail.riskFlag;
  const circumference = 2 * Math.PI * 45;
  const scoreAngle = (score / 100) * 270;
  const dashOffset = circumference - (scoreAngle / 360) * circumference;

  const isDecided = ["approved", "rejected", "disbursing", "disbursed", "repaying", "paid_off", "defaulted"].includes(detail.status);

  function runApprove() {
    setError(null);
    const fd = new FormData();
    fd.set("loanId", detail.loanId);
    fd.set("notes", approveNotes);
    startTransition(async () => {
      const r = await approveLoan(fd);
      if (r?.error) setError(r.error);
      else { setShowApproveModal(false); router.refresh(); }
    });
  }

  function runReject() {
    if (!rejectReason) return;
    setError(null);
    const fd = new FormData();
    fd.set("loanId", detail.loanId);
    fd.set("notes", `${rejectReason}. ${rejectNotes}`.trim());
    startTransition(async () => {
      const r = await rejectLoan(fd);
      if (r?.error) setError(r.error);
      else { setShowRejectModal(false); router.refresh(); }
    });
  }

  function runDisburse() {
    setError(null);
    const fd = new FormData();
    fd.set("loanId", detail.loanId);
    startTransition(async () => {
      const r = await disburseLoan(fd);
      if (r?.error) setError(r.error);
      else router.refresh();
    });
  }

  return (
    <>
      <div style={s.header}>
        <div>
          <a href="/admin/underwriting" style={s.backLink}>← Back to Queue</a>
          <h1 style={s.title}>{detail.applicantName}</h1>
          <p style={s.meta}>{detail.universityName} · Applied {formatDate(detail.createdAt)} · <span style={{ textTransform: "uppercase" }}>{detail.status}</span></p>
        </div>
        <span style={{ ...s.riskBadge, background: riskBg[detail.riskFlag], color: riskColors[detail.riskFlag] }}>● {riskLabels[detail.riskFlag]}</span>
      </div>

      {error && <div style={s.errorBar}>{error}</div>}

      <div style={s.summaryGrid}>
        {[
          { label: "Loan Amount", value: formatCAD(detail.loanAmount), color: "#F9FAFB" },
          { label: "APR", value: `${detail.apr}%`, color: "#F9FAFB" },
          { label: "Term", value: `${detail.termMonths} months`, color: "#F9FAFB" },
          { label: "Monthly Payment", value: formatCAD(detail.monthlyPayment), color: "#F9FAFB" },
          { label: "Total Cost", value: formatCAD(detail.totalCost), color: "#F59E0B" },
        ].map((item) => (
          <div key={item.label} style={s.summaryItem}>
            <span style={s.sumLabel}>{item.label}</span>
            <span style={{ ...s.sumValue, color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>

      <div style={s.twoCol}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>📊 EduKard Score</h2>
          {detail.credit ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "20px" }}>
                <div style={{ position: "relative", width: "110px", height: "110px" }}>
                  <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: "rotate(-135deg)" }}>
                    <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(75,85,99,0.15)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`} />
                    <circle cx="55" cy="55" r="45" fill="none" stroke={riskColors[creditRisk]} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${circumference}`} strokeDashoffset={dashOffset} style={{ transition: "stroke-dashoffset 1.5s ease" }} />
                  </svg>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: riskColors[creditRisk] }}>{score}</div>
                    <div style={{ fontSize: "10px", color: "#6B7280" }}>/100</div>
                  </div>
                </div>
                <div>
                  <div style={{ ...s.riskPill, background: riskBg[creditRisk], color: riskColors[creditRisk] }}>● {riskLabels[creditRisk]}</div>
                  <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "8px" }}>Assessed {formatDate(detail.credit.assessedAt)}</div>
                </div>
              </div>
              <div style={s.metricsGrid}>
                <div style={s.metricItem}><span style={s.mLabel}>Monthly Income</span><span style={s.mValue}>{formatCAD(detail.credit.monthlyIncome)}</span></div>
                <div style={s.metricItem}><span style={s.mLabel}>DTI Ratio</span><span style={{ ...s.mValue, color: detail.credit.dtiRatio < 30 ? "#10B981" : detail.credit.dtiRatio < 40 ? "#F59E0B" : "#EF4444" }}>{formatPercent(detail.credit.dtiRatio)}</span></div>
                <div style={s.metricItem}><span style={s.mLabel}>Employment</span><span style={s.mValue}>{detail.credit.employmentMonths} months</span></div>
                <div style={s.metricItem}><span style={s.mLabel}>Approved Limit</span><span style={{ ...s.mValue, color: "#10B981" }}>{formatCAD(detail.credit.approvedLimit)}</span></div>
              </div>
              {detail.credit.denialReason && (
                <div style={s.denialBox}>
                  <strong style={{ color: "#EF4444" }}>⚠️ Denial Reason:</strong>
                  <p style={{ color: "#D1D5DB", fontSize: "13px", lineHeight: 1.6, marginTop: "6px" }}>{detail.credit.denialReason}</p>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: "#9CA3AF", fontSize: "14px" }}>No formal credit assessment on file for this applicant.</p>
          )}
        </div>

        <div style={s.card}>
          <h2 style={s.cardTitle}>💼 Payroll & Identity</h2>
          <div style={{ marginBottom: "16px" }}>
            <span style={s.mLabel}>KYC Status</span>
            <span style={{ ...s.mValue, color: detail.kycStatus === "approved" ? "#10B981" : detail.kycStatus === "rejected" ? "#EF4444" : "#F59E0B", textTransform: "capitalize" }}>{detail.kycStatus.replace("_", " ")}</span>
          </div>
          <h3 style={s.subTitle}>Connected Payroll / Bank ({detail.payrollConnections.length})</h3>
          {detail.payrollConnections.length > 0 ? (
            <div style={s.docGrid}>
              {detail.payrollConnections.map((c, i) => (
                <div key={i} style={s.docItem}>
                  <span style={{ fontSize: "18px" }}>🏦</span>
                  <span style={s.docName}>{c.institution_name || "Linked account"}</span>
                  <span style={{ ...s.docVerified, color: c.status === "active" ? "#10B981" : "#F59E0B" }}>{c.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#9CA3AF", fontSize: "13px" }}>No payroll/bank account connected via Plaid.</p>
          )}
        </div>
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>📄 Submitted Documents</h2>
        <div style={s.docGrid}>
          {detail.invoiceUrl ? (
            <a href={detail.invoiceUrl} target="_blank" rel="noreferrer" style={s.docItem}>
              <span style={{ fontSize: "18px" }}>📋</span><span style={s.docName}>Tuition Invoice</span><span style={s.docVerified}>View →</span>
            </a>
          ) : (
            <div style={s.docItem}><span style={{ fontSize: "18px" }}>📋</span><span style={s.docName}>Tuition Invoice</span><span style={{ ...s.docVerified, color: "#F59E0B" }}>Not uploaded</span></div>
          )}
          <div style={s.docItem}><span style={{ fontSize: "18px" }}>🪪</span><span style={s.docName}>Identity (KYC via Sumsub)</span><span style={{ ...s.docVerified, color: detail.kycStatus === "approved" ? "#10B981" : "#F59E0B" }}>{detail.kycStatus}</span></div>
        </div>
      </div>

      {!isDecided ? (
        <div style={s.actionBar}>
          <button disabled={pending} style={s.approveBtn} onClick={() => setShowApproveModal(true)}>✓ Approve Application</button>
          <button disabled={pending} style={s.rejectBtn} onClick={() => setShowRejectModal(true)}>✕ Reject Application</button>
        </div>
      ) : detail.status === "approved" ? (
        <div style={s.actionBar}>
          <button disabled={pending} style={s.approveBtn} onClick={runDisburse}>{pending ? "Processing..." : "💸 Disburse to University"}</button>
        </div>
      ) : (
        <div style={s.actionBar}>
          <span style={{ ...s.riskPill, background: "rgba(75,85,99,0.2)", color: "#9CA3AF" }}>Decision recorded: {detail.status}</span>
        </div>
      )}

      {showApproveModal && (
        <div style={s.modalOverlay} onClick={() => setShowApproveModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>✓ Approve Application</h2>
              <button style={s.modalClose} onClick={() => setShowApproveModal(false)}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.modalSummary}>
                <div style={s.modalSumRow}><span>Applicant</span><strong>{detail.applicantName}</strong></div>
                <div style={s.modalSumRow}><span>Amount</span><strong>{formatCAD(detail.loanAmount)}</strong></div>
                <div style={s.modalSumRow}><span>Risk</span><strong style={{ color: riskColors[creditRisk] }}>{riskLabels[creditRisk]}</strong></div>
                <div style={s.modalSumRow}><span>EduKard Score</span><strong>{score}/100</strong></div>
              </div>
              <label style={s.modalLabel}>Approval Notes (optional)</label>
              <textarea value={approveNotes} onChange={(e) => setApproveNotes(e.target.value)} placeholder="Add any notes for the approval record..." style={s.textarea} rows={4} />
              <p style={s.modalHint}>Approving records the decision and notifies the applicant. You can then disburse funds to {detail.universityName}.</p>
            </div>
            <div style={s.modalFooter}>
              <button style={s.modalCancel} onClick={() => setShowApproveModal(false)}>Cancel</button>
              <button style={s.modalConfirmApprove} disabled={pending} onClick={runApprove}>{pending ? "Processing..." : "✓ Confirm Approval"}</button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div style={s.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={{ ...s.modalTitle, color: "#EF4444" }}>✕ Reject Application</h2>
              <button style={s.modalClose} onClick={() => setShowRejectModal(false)}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.modalSummary}>
                <div style={s.modalSumRow}><span>Applicant</span><strong>{detail.applicantName}</strong></div>
                <div style={s.modalSumRow}><span>Amount</span><strong>{formatCAD(detail.loanAmount)}</strong></div>
              </div>
              <label style={s.modalLabel}>Rejection Reason *</label>
              <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} style={s.select}>
                <option value="">Select a reason...</option>
                {REJECT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <label style={s.modalLabel}>Additional Notes</label>
              <textarea value={rejectNotes} onChange={(e) => setRejectNotes(e.target.value)} placeholder="Provide details for the rejection..." style={s.textarea} rows={4} />
              <div style={s.warningBox}>
                <strong style={{ color: "#EF4444" }}>⚠️ Important:</strong> Rejection triggers an adverse action notice to the applicant per federal regulation. Ensure the reason is accurate and documented.
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.modalCancel} onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button style={{ ...s.modalConfirmReject, opacity: rejectReason && !pending ? 1 : 0.5 }} disabled={!rejectReason || pending} onClick={runReject}>
                {pending ? "Processing..." : "✕ Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  backLink: { fontSize: "13px", color: "#6B7280", textDecoration: "none", display: "block", marginBottom: "8px" },
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  meta: { fontSize: "14px", color: "#6B7280", marginTop: "4px" },
  errorBar: { padding: "12px 18px", borderRadius: "10px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", fontSize: "14px", marginBottom: "20px" },
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
  subTitle: { fontSize: "14px", fontWeight: 700, color: "#D1D5DB", marginBottom: "10px" },
  docGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" },
  docItem: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "10px", background: "rgba(31,41,55,0.3)", textDecoration: "none" },
  docName: { flex: 1, fontSize: "13px", fontWeight: 600, color: "#F9FAFB" },
  docVerified: { fontSize: "11px", fontWeight: 700, color: "#10B981" },
  actionBar: { display: "flex", gap: "12px", padding: "20px 0", alignItems: "center" },
  approveBtn: { padding: "14px 28px", borderRadius: "10px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "15px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(16,185,129,0.2)" },
  rejectBtn: { padding: "14px 28px", borderRadius: "10px", background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)", fontSize: "15px", fontWeight: 700, cursor: "pointer" },
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
