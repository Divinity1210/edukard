import DashboardLayout from "@/components/DashboardLayout";
import { getProfile, getStudentLoan, getRepaymentSchedule } from "@/lib/data-access";
import { formatCAD, formatDate } from "@/lib/calculations";

export const dynamic = "force-dynamic";

// Numeric progress per loan status drives the 5-step timeline.
const PROGRESS: Record<string, number> = {
  draft: 0, submitted: 1, under_review: 1, approved: 2, disbursing: 3,
  disbursed: 4, repaying: 4, paid_off: 4, defaulted: 4, rejected: -1,
};

export default async function ApplicationStatusPage() {
  const profile = await getProfile();
  const loan = profile ? await getStudentLoan(profile.id) : null;
  const schedule = loan ? await getRepaymentSchedule(loan.id) : [];
  const firstPayment = schedule.find((p) => p.status === "scheduled") || schedule[0];

  const stepIcons = ["📝", "🔍", "✅", "🏦", "🎓"];
  const userName = profile?.full_name || "Student";

  if (!loan) {
    return (
      <DashboardLayout role="student" userName={userName}>
        <h1 style={s.title}>Application Status</h1>
        <p style={s.subtitle}>Track the progress of your tuition financing application in real-time.</p>
        <div style={s.summaryCard}>
          <p style={{ color: "#9CA3AF" }}>You don&apos;t have an application yet. <a href="/student/apply" style={{ color: "#10B981" }}>Apply for financing →</a></p>
        </div>
      </DashboardLayout>
    );
  }

  const progress = PROGRESS[loan.status] ?? 0;
  const rejected = loan.status === "rejected";
  const universityName = (loan.university as { name?: string } | null)?.name || "your university";

  const steps = [
    { id: "submitted", title: "Application Submitted", description: "Your application has been received.", completeAt: 1, activeAt: 0 },
    { id: "review", title: "Under Review", description: "Our underwriting team is reviewing your application.", completeAt: 2, activeAt: 1 },
    { id: "approved", title: rejected ? "Decision: Not Approved" : "Approved", description: rejected ? "Unfortunately your application was not approved." : "Your loan has been approved.", completeAt: 2, activeAt: 2 },
    { id: "disbursing", title: "Disbursing Funds", description: "Funds are being transferred from the liquidity pool.", completeAt: 4, activeAt: 3 },
    { id: "disbursed", title: "Funds Disbursed to University", description: `Tuition sent to ${universityName}.`, completeAt: 4, activeAt: 4 },
  ].map((step) => {
    let status: "completed" | "active" | "pending" = "pending";
    if (rejected && step.id === "approved") status = "active";
    else if (progress >= step.completeAt && !(rejected && ["disbursing", "disbursed"].includes(step.id))) status = "completed";
    else if (progress === step.activeAt) status = "active";
    return { ...step, status };
  });

  const allComplete = progress >= 4;

  return (
    <DashboardLayout role="student" userName={userName}>
      <h1 style={s.title}>Application Status</h1>
      <p style={s.subtitle}>Track the progress of your tuition financing application in real-time.</p>

      <div style={s.summaryCard}>
        <div style={s.summaryGrid}>
          <div><span style={s.sumLabel}>Application</span><span style={s.sumValue}>#{String(loan.id).slice(0, 8)}</span></div>
          <div><span style={s.sumLabel}>University</span><span style={s.sumValue}>{universityName}</span></div>
          <div><span style={s.sumLabel}>Amount</span><span style={s.sumValue}>{formatCAD(Number(loan.loan_amount))}</span></div>
          <div><span style={s.sumLabel}>Status</span><span style={{ ...s.sumValue, color: rejected ? "#EF4444" : allComplete ? "#10B981" : "#F59E0B", textTransform: "capitalize" }}>{String(loan.status).replace("_", " ")}</span></div>
        </div>
      </div>

      <div style={s.timelineContainer}>
        {steps.map((step, i) => {
          const isComplete = step.status === "completed";
          const isActive = step.status === "active";
          const isLast = i === steps.length - 1;
          const color = isComplete ? "#10B981" : isActive ? (rejected && step.id === "approved" ? "#EF4444" : "#F59E0B") : "#4B5563";

          return (
            <div key={step.id} style={s.timelineItem}>
              <div style={s.timelineLeft}>
                <div style={{
                  ...s.timelineDot,
                  background: isComplete ? "linear-gradient(135deg, #10B981, #059669)" : isActive ? `linear-gradient(135deg, ${color}, ${color})` : "rgba(75,85,99,0.3)",
                  boxShadow: isComplete ? "0 0 16px rgba(16,185,129,0.3)" : isActive ? `0 0 16px ${color}55` : "none",
                }}>
                  {isComplete ? "✓" : stepIcons[i]}
                </div>
                {!isLast && <div style={{ ...s.timelineLine, background: isComplete ? "rgba(16,185,129,0.3)" : "rgba(75,85,99,0.15)" }} />}
              </div>

              <div style={{
                ...s.timelineContent,
                borderColor: isActive ? `${color}40` : isComplete ? "rgba(16,185,129,0.12)" : "rgba(75,85,99,0.15)",
              }}>
                <div style={s.timelineHeader}>
                  <h3 style={{ ...s.timelineTitle, color: isComplete || isActive ? "#F9FAFB" : "#6B7280" }}>{step.title}</h3>
                  <span style={{ ...s.timelineBadge, background: `${color}18`, color }}>{isComplete ? "Complete" : isActive ? "In Progress" : "Pending"}</span>
                </div>
                <p style={s.timelineDesc}>{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {allComplete && (
        <div style={s.confirmCard}>
          <div style={s.confirmIcon}>🎉</div>
          <h2 style={s.confirmTitle}>Funds Successfully Disbursed</h2>
          <p style={s.confirmMsg}>
            {formatCAD(Number(loan.loan_amount))} has been sent directly to <strong>{universityName}</strong>&apos;s settlement account.
            {firstPayment ? <> Your first repayment of {formatCAD(Number(loan.monthly_payment))} is due on {formatDate(firstPayment.due_date)}.</> : null}
          </p>
          <div style={s.confirmActions}>
            <a href="/student/payments" style={s.confirmBtn}>View Payment Schedule →</a>
            <a href="/student/documents" style={s.confirmBtnSecondary}>View Loan Agreement</a>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "24px" },
  summaryCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px", marginBottom: "28px" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" },
  sumLabel: { display: "block", fontSize: "12px", color: "#6B7280", marginBottom: "4px" },
  sumValue: { display: "block", fontSize: "16px", fontWeight: 700, color: "#F9FAFB" },
  timelineContainer: { display: "flex", flexDirection: "column" as const, gap: "0px", marginBottom: "28px" },
  timelineItem: { display: "flex", gap: "20px" },
  timelineLeft: { display: "flex", flexDirection: "column" as const, alignItems: "center", width: "44px", flexShrink: 0 },
  timelineDot: { width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: "#fff", fontWeight: 700, flexShrink: 0 },
  timelineLine: { width: "2px", flex: 1, minHeight: "20px" },
  timelineContent: { flex: 1, background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "20px 24px", marginBottom: "16px" },
  timelineHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" as const, gap: "8px" },
  timelineTitle: { fontSize: "16px", fontWeight: 700 },
  timelineBadge: { padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 },
  timelineDesc: { fontSize: "14px", color: "#6B7280", lineHeight: 1.6, marginBottom: "10px" },
  confirmCard: { background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "14px", padding: "40px", textAlign: "center" as const },
  confirmIcon: { fontSize: "48px", marginBottom: "16px" },
  confirmTitle: { fontSize: "22px", fontWeight: 800, color: "#F9FAFB", marginBottom: "12px" },
  confirmMsg: { fontSize: "15px", color: "#D1D5DB", lineHeight: 1.7, maxWidth: "540px", margin: "0 auto 24px" },
  confirmActions: { display: "flex", justifyContent: "center", gap: "12px" },
  confirmBtn: { padding: "12px 28px", borderRadius: "10px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none", boxShadow: "0 0 20px rgba(16,185,129,0.2)" },
  confirmBtnSecondary: { padding: "12px 28px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(17,24,39,0.6)", color: "#6B7280", fontSize: "14px", fontWeight: 600, textDecoration: "none" },
};
