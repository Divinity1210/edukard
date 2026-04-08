"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_APPLICATION_TIMELINE, MOCK_LOAN } from "@/lib/mock-data";
import { formatCAD, formatDate } from "@/lib/calculations";

export default function ApplicationStatusPage() {
  const timeline = MOCK_APPLICATION_TIMELINE;
  const loan = MOCK_LOAN;

  const stepIcons = ["📝", "🔍", "✅", "🏦", "🎓"];
  const allComplete = timeline.every((s) => s.status === "completed");

  return (
    <DashboardLayout role="student" userName="Amara Okafor">
      <h1 style={s.title}>Application Status</h1>
      <p style={s.subtitle}>Track the progress of your tuition financing application in real-time.</p>

      {/* Loan summary */}
      <div style={s.summaryCard}>
        <div style={s.summaryGrid}>
          <div><span style={s.sumLabel}>Application</span><span style={s.sumValue}>#{loan.id}</span></div>
          <div><span style={s.sumLabel}>University</span><span style={s.sumValue}>{loan.university_name}</span></div>
          <div><span style={s.sumLabel}>Amount</span><span style={s.sumValue}>{formatCAD(loan.loan_amount)}</span></div>
          <div><span style={s.sumLabel}>Status</span><span style={{ ...s.sumValue, color: allComplete ? "#10B981" : "#F59E0B" }}>{allComplete ? "Disbursed ✓" : "In Progress"}</span></div>
        </div>
      </div>

      {/* Timeline */}
      <div style={s.timelineContainer}>
        {timeline.map((step, i) => {
          const isComplete = step.status === "completed";
          const isActive = step.status === "active";
          const isLast = i === timeline.length - 1;
          const color = isComplete ? "#10B981" : isActive ? "#F59E0B" : "#4B5563";

          return (
            <div key={step.id} style={s.timelineItem}>
              {/* Line connector */}
              <div style={s.timelineLeft}>
                <div style={{
                  ...s.timelineDot,
                  background: isComplete ? "linear-gradient(135deg, #10B981, #059669)" : isActive ? "linear-gradient(135deg, #F59E0B, #D97706)" : "rgba(75,85,99,0.3)",
                  boxShadow: isComplete ? "0 0 16px rgba(16,185,129,0.3)" : isActive ? "0 0 16px rgba(245,158,11,0.3)" : "none",
                }}>
                  {isComplete ? "✓" : stepIcons[i]}
                </div>
                {!isLast && <div style={{ ...s.timelineLine, background: isComplete ? "rgba(16,185,129,0.3)" : "rgba(75,85,99,0.15)" }} />}
              </div>

              {/* Content */}
              <div style={{
                ...s.timelineContent,
                borderColor: isActive ? "rgba(245,158,11,0.25)" : isComplete ? "rgba(16,185,129,0.12)" : "rgba(75,85,99,0.15)",
              }}>
                <div style={s.timelineHeader}>
                  <h3 style={{ ...s.timelineTitle, color: isComplete || isActive ? "#F9FAFB" : "#6B7280" }}>{step.title}</h3>
                  <span style={{ ...s.timelineBadge, background: `${color}18`, color }}>{isComplete ? "Complete" : isActive ? "In Progress" : "Pending"}</span>
                </div>
                <p style={s.timelineDesc}>{step.description}</p>
                {step.timestamp && (
                  <div style={s.timelineMeta}>
                    <span style={s.metaItem}>🕐 {formatDate(step.timestamp)}</span>
                    {step.details && <span style={s.metaItem}>📋 {step.details}</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final confirmation */}
      {allComplete && (
        <div style={s.confirmCard}>
          <div style={s.confirmIcon}>🎉</div>
          <h2 style={s.confirmTitle}>Funds Successfully Disbursed</h2>
          <p style={s.confirmMsg}>
            {formatCAD(loan.loan_amount)} has been sent directly to <strong>{loan.university_name}</strong>&apos;s settlement account.
            Your first repayment of {formatCAD(loan.monthly_payment)} is due on {formatDate(MOCK_APPLICATION_TIMELINE[0].timestamp || "")}.
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
  timelineMeta: { display: "flex", gap: "16px", flexWrap: "wrap" as const },
  metaItem: { fontSize: "12px", color: "#6B7280" },
  confirmCard: { background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "14px", padding: "40px", textAlign: "center" as const },
  confirmIcon: { fontSize: "48px", marginBottom: "16px" },
  confirmTitle: { fontSize: "22px", fontWeight: 800, color: "#F9FAFB", marginBottom: "12px" },
  confirmMsg: { fontSize: "15px", color: "#D1D5DB", lineHeight: 1.7, maxWidth: "540px", margin: "0 auto 24px" },
  confirmActions: { display: "flex", justifyContent: "center", gap: "12px" },
  confirmBtn: { padding: "12px 28px", borderRadius: "10px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none", boxShadow: "0 0 20px rgba(16,185,129,0.2)" },
  confirmBtnSecondary: { padding: "12px 28px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(17,24,39,0.6)", color: "#6B7280", fontSize: "14px", fontWeight: 600, textDecoration: "none" },
};
