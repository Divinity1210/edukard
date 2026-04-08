"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { UNIVERSITIES } from "@/lib/constants";
import { calculateMonthlyPayment, calculateTotalCost, calculateAmortization, formatCAD, formatDate } from "@/lib/calculations";
import { useRouter } from "next/navigation";

export default function LoanApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [university, setUniversity] = useState("");
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState(12000);
  const [term, setTerm] = useState(24);
  const [search, setSearch] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<string | null>(null);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const apr = 11.5;
  const monthly = calculateMonthlyPayment(amount, apr, term);
  const totalCost = calculateTotalCost(amount, apr, term);
  const totalInterest = totalCost - amount;
  const approvedLimit = 18000;
  const amortization = calculateAmortization(amount, apr, term);

  const filteredUnis = UNIVERSITIES.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.city.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUni = UNIVERSITIES.find(u => u.id === university);

  return (
    <DashboardLayout role="student" userName="Amara Okafor">
      <h1 style={s.pageTitle}>Apply for Tuition Financing</h1>

      {/* Progress stepper */}
      <div style={s.stepper}>
        {["University & Invoice", "Loan Details", "Review & Sign"].map((label, i) => (
          <div key={label} style={s.stepItem}>
            <div style={{
              ...s.stepCircle,
              ...(i + 1 <= step ? s.stepCircleActive : {}),
              ...(i + 1 < step ? s.stepCircleDone : {}),
            }}>
              {i + 1 < step ? "✓" : i + 1}
            </div>
            <span style={{ ...s.stepLabel, color: i + 1 <= step ? "#F9FAFB" : "#6B7280" }}>{label}</span>
            {i < 2 && <div style={{ ...s.stepLine, background: i + 1 < step ? "#10B981" : "rgba(75,85,99,0.2)" }} />}
          </div>
        ))}
      </div>

      <div style={s.formCard}>
        {/* Step 1: University + Invoice Upload */}
        {step === 1 && (
          <div>
            <h2 style={s.stepTitle}>Select your university & upload invoice</h2>
            <p style={s.stepDesc}>Choose from our list of Canadian Designated Learning Institutions (DLI) and upload your tuition invoice.</p>

            <input type="text" placeholder="Search universities..." value={search} onChange={(e) => setSearch(e.target.value)} style={s.searchInput} />

            <div style={s.uniGrid}>
              {filteredUnis.slice(0, 12).map((uni) => (
                <button key={uni.id} onClick={() => setUniversity(uni.id)} style={{ ...s.uniCard, ...(university === uni.id ? s.uniCardSelected : {}) }}>
                  <div style={s.uniName}>{uni.name}</div>
                  <div style={s.uniMeta}>{uni.city}, {uni.province}</div>
                </button>
              ))}
            </div>

            <div style={s.field}>
              <label style={s.label}>Student ID Number</label>
              <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Your university student number" style={s.input} />
            </div>

            {/* INVOICE UPLOAD — US-B1.3.1 */}
            <div style={s.invoiceSection}>
              <label style={s.label}>Tuition Invoice</label>
              <div style={s.invoiceUpload}>
                <div style={s.invoiceIcon}>{invoiceFile ? "📄" : "📤"}</div>
                <div style={s.invoiceTitle}>{invoiceFile || "Upload Tuition Invoice"}</div>
                <div style={s.invoiceDesc}>
                  {invoiceFile
                    ? "File uploaded. Click to replace."
                    : "Upload your official tuition invoice from your university. PDF, JPG, or PNG up to 10MB."
                  }
                </div>
                <label style={s.invoiceBtn}>
                  {invoiceFile ? "Replace File" : "Choose File"}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setInvoiceFile(file.name);
                    }}
                  />
                </label>
                {invoiceFile && (
                  <button onClick={() => setInvoiceFile(null)} style={s.removeFile}>✕ Remove</button>
                )}
              </div>
            </div>

            <button
              style={{ ...s.nextBtn, opacity: university && studentId ? 1 : 0.5 }}
              disabled={!university || !studentId}
              onClick={() => setStep(2)}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Loan Details + Amortization Preview */}
        {step === 2 && (
          <div>
            <h2 style={s.stepTitle}>Configure your loan</h2>
            <p style={s.stepDesc}>Your approved limit is <strong style={{ color: "#10B981" }}>{formatCAD(approvedLimit)}</strong> based on your EduKard Score.</p>

            <div style={s.sliderSection}>
              <label style={s.label}>Loan Amount: <strong style={{ color: "#10B981", fontSize: "18px" }}>{formatCAD(amount)}</strong></label>
              <input type="range" min={1000} max={approvedLimit} step={500} value={amount} onChange={(e) => setAmount(Number(e.target.value))} style={s.slider} />
              <div style={s.sliderLabels}><span>{formatCAD(1000)}</span><span>{formatCAD(approvedLimit)}</span></div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Repayment Term</label>
              <div style={s.termGrid}>
                {[12, 18, 24, 36].map((t) => (
                  <button key={t} onClick={() => setTerm(t)} style={{ ...s.termBtn, ...(term === t ? s.termBtnActive : {}) }}>{t} months</button>
                ))}
              </div>
            </div>

            <div style={s.costBreakdown}>
              <h3 style={s.costTitle}>Cost of Borrowing (Canadian Disclosure)</h3>
              <div style={s.costGrid}>
                {[
                  { l: "Annual Percentage Rate (APR)", v: `${apr}%` },
                  { l: "Monthly Payment", v: formatCAD(monthly), c: "#10B981" },
                  { l: "Total Interest", v: formatCAD(totalInterest) },
                  { l: "Total Cost of Borrowing", v: formatCAD(totalCost), b: true },
                ].map((c) => (
                  <div key={c.l} style={s.costItem}><span style={s.costLabel}>{c.l}</span><span style={{ ...s.costValue, color: c.c || "#F9FAFB", fontWeight: c.b ? 800 : 700 }}>{c.v}</span></div>
                ))}
              </div>
            </div>

            {/* AMORTIZATION SCHEDULE PREVIEW — US-B1.3.1 */}
            <div style={s.amortSection}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={s.amortTitle}>Amortization Schedule Preview</h3>
                <button onClick={() => setShowFullSchedule(!showFullSchedule)} style={s.toggleBtn}>
                  {showFullSchedule ? "Show Less" : `Show All ${amortization.length} Payments`}
                </button>
              </div>
              <div style={s.amortTable}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["#", "Date", "Payment", "Principal", "Interest", "Balance"].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(showFullSchedule ? amortization : amortization.slice(0, 6)).map((row) => (
                      <tr key={row.payment_number}>
                        <td style={s.td}>{row.payment_number}</td>
                        <td style={s.td}>{formatDate(row.date)}</td>
                        <td style={{ ...s.td, fontWeight: 600 }}>{formatCAD(row.payment)}</td>
                        <td style={s.td}>{formatCAD(row.principal)}</td>
                        <td style={{ ...s.td, color: "#F59E0B" }}>{formatCAD(row.interest)}</td>
                        <td style={s.td}>{formatCAD(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!showFullSchedule && amortization.length > 6 && (
                <div style={s.amortFade}>... and {amortization.length - 6} more payments</div>
              )}
            </div>

            <div style={s.btnRow}><button style={s.backBtn} onClick={() => setStep(1)}>← Back</button><button style={s.nextBtn} onClick={() => setStep(3)}>Continue →</button></div>
          </div>
        )}

        {/* Step 3: Review & Sign */}
        {step === 3 && (
          <div>
            <h2 style={s.stepTitle}>Review & sign agreement</h2>
            <p style={s.stepDesc}>Please review the details below before signing your loan agreement.</p>

            <div style={s.reviewCard}>
              {[
                { l: "University", v: selectedUni?.name },
                { l: "Student ID", v: studentId },
                { l: "Tuition Invoice", v: invoiceFile || "Not uploaded" },
                { l: "Loan Amount", v: formatCAD(amount) },
                { l: "APR", v: `${apr}%` },
                { l: "Term", v: `${term} months` },
                { l: "Monthly Payment", v: formatCAD(monthly), c: "#10B981" },
                { l: "Total Cost", v: formatCAD(totalCost) },
              ].map((r) => (
                <div key={r.l} style={s.reviewRow}><span>{r.l}</span><strong style={{ color: r.c || "#F9FAFB" }}>{r.v}</strong></div>
              ))}
            </div>

            <div style={s.legalBox}>
              <h4 style={s.legalTitle}>Important Disclosures</h4>
              <ul style={s.legalList}>
                <li>Funds will be sent directly to {selectedUni?.name}&apos;s bursar account. You will not receive the funds directly.</li>
                <li>You have a 2-day cooling-off period after signing to cancel this agreement without penalty.</li>
                <li>Late payments may incur a fee of $25 or 3% of the payment, whichever is less.</li>
                <li>Your repayments will be collected via Pre-Authorized Debit (PAD) from your linked bank account.</li>
              </ul>
            </div>

            <label style={s.consent}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={s.checkbox} />
              <span style={s.consentText}>I have read and agree to the Loan Agreement, PAD mandate, and acknowledge the total cost of borrowing of {formatCAD(totalCost)}. I understand funds will be disbursed directly to my university.</span>
            </label>

            <div style={s.btnRow}>
              <button style={s.backBtn} onClick={() => setStep(2)}>← Back</button>
              <button style={{ ...s.submitBtn, opacity: agreed ? 1 : 0.5 }} disabled={!agreed} onClick={() => router.push("/student/application-status")}>✍️ Sign & Submit Application</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  pageTitle: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB", marginBottom: "24px" },
  stepper: { display: "flex", alignItems: "center", marginBottom: "28px" },
  stepItem: { display: "flex", alignItems: "center", gap: "10px" },
  stepCircle: { width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, background: "rgba(31,41,55,0.4)", color: "#6B7280", flexShrink: 0 },
  stepCircleActive: { background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff" },
  stepCircleDone: { background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff" },
  stepLabel: { fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" as const },
  stepLine: { width: "40px", height: "2px", borderRadius: "1px", marginLeft: "8px", marginRight: "8px", flexShrink: 0 },
  formCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "32px" },
  stepTitle: { fontSize: "20px", fontWeight: 700, color: "#F9FAFB", marginBottom: "8px" },
  stepDesc: { fontSize: "14px", color: "#6B7280", marginBottom: "24px", lineHeight: 1.6 },
  searchInput: { width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", color: "#F9FAFB", fontSize: "15px", outline: "none", marginBottom: "20px" },
  uniGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px", marginBottom: "24px" },
  uniCard: { padding: "16px", borderRadius: "12px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", cursor: "pointer", textAlign: "left" as const, transition: "all 0.2s ease" },
  uniCardSelected: { border: "2px solid #10B981", background: "rgba(16,185,129,0.12)" },
  uniName: { fontSize: "14px", fontWeight: 600, color: "#F9FAFB", marginBottom: "4px" },
  uniMeta: { fontSize: "12px", color: "#6B7280" },
  field: { marginBottom: "24px" },
  label: { display: "block", fontSize: "13px", fontWeight: 600, color: "#D1D5DB", marginBottom: "8px" },
  input: { width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", color: "#F9FAFB", fontSize: "15px", outline: "none" },

  /* Invoice upload */
  invoiceSection: { marginBottom: "24px" },
  invoiceUpload: { border: "2px dashed rgba(16,185,129,0.25)", borderRadius: "14px", padding: "28px 24px", textAlign: "center" as const, background: "rgba(16,185,129,0.03)" },
  invoiceIcon: { fontSize: "36px", marginBottom: "10px" },
  invoiceTitle: { fontSize: "16px", fontWeight: 700, color: "#F9FAFB", marginBottom: "6px" },
  invoiceDesc: { fontSize: "13px", color: "#6B7280", lineHeight: 1.6, marginBottom: "16px" },
  invoiceBtn: { display: "inline-block", padding: "10px 24px", borderRadius: "10px", background: "rgba(16,185,129,0.12)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  removeFile: { display: "inline-block", marginLeft: "10px", padding: "10px 16px", borderRadius: "10px", background: "transparent", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)", fontSize: "13px", fontWeight: 600, cursor: "pointer" },

  /* Slider */
  sliderSection: { marginBottom: "28px" },
  slider: { width: "100%", marginTop: "12px", accentColor: "#10B981", height: "6px" },
  sliderLabels: { display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6B7280", marginTop: "8px" },
  termGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" },
  termBtn: { padding: "12px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", color: "#6B7280", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  termBtnActive: { border: "2px solid #10B981", background: "rgba(16,185,129,0.12)", color: "#10B981" },
  costBreakdown: { background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "14px", padding: "24px", marginBottom: "28px" },
  costTitle: { fontSize: "14px", fontWeight: 700, color: "#F59E0B", marginBottom: "16px", textTransform: "uppercase" as const, letterSpacing: "0.5px" },
  costGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  costItem: { display: "flex", flexDirection: "column" as const, gap: "4px" },
  costLabel: { fontSize: "12px", color: "#F59E0B" },
  costValue: { fontSize: "18px", fontWeight: 700 },

  /* Amortization Preview */
  amortSection: { marginBottom: "28px" },
  amortTitle: { fontSize: "15px", fontWeight: 700, color: "#F9FAFB" },
  toggleBtn: { padding: "6px 14px", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.06)", color: "#10B981", fontSize: "12px", fontWeight: 600, cursor: "pointer" },
  amortTable: { borderRadius: "12px", border: "1px solid rgba(75,85,99,0.25)", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" as const, minWidth: "550px" },
  th: { padding: "12px 14px", fontSize: "11px", fontWeight: 600, color: "#6B7280", textAlign: "left" as const, textTransform: "uppercase" as const, borderBottom: "1px solid rgba(75,85,99,0.2)", background: "rgba(31,41,55,0.2)" },
  td: { padding: "10px 14px", fontSize: "13px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.08)" },
  amortFade: { textAlign: "center" as const, padding: "12px", fontSize: "13px", color: "#6B7280", fontStyle: "italic" as const },

  /* Navigation */
  btnRow: { display: "flex", justifyContent: "space-between", gap: "16px", marginTop: "8px" },
  backBtn: { padding: "12px 24px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(17,24,39,0.6)", color: "#6B7280", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  nextBtn: { padding: "12px 32px", borderRadius: "10px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer", marginLeft: "auto", boxShadow: "0 0 20px rgba(16,185,129,0.2)" },

  /* Review */
  reviewCard: { background: "rgba(31,41,55,0.3)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "20px", marginBottom: "20px" },
  reviewRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: "14px", color: "#6B7280", borderBottom: "1px solid rgba(75,85,99,0.2)" },
  legalBox: { background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "14px", padding: "20px", marginBottom: "20px" },
  legalTitle: { fontSize: "14px", fontWeight: 700, color: "#F59E0B", marginBottom: "12px" },
  legalList: { listStyle: "disc", paddingLeft: "20px", fontSize: "13px", color: "#D1D5DB", lineHeight: 1.8, display: "flex", flexDirection: "column" as const, gap: "4px" },
  consent: { display: "flex", gap: "10px", alignItems: "flex-start", cursor: "pointer", marginBottom: "24px" },
  checkbox: { marginTop: "3px", accentColor: "#10B981", width: "18px", height: "18px", flexShrink: 0 },
  consentText: { fontSize: "13px", color: "#6B7280", lineHeight: 1.6 },
  submitBtn: { padding: "14px 32px", borderRadius: "12px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "15px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 0 30px rgba(16,185,129,0.25)" },
};
