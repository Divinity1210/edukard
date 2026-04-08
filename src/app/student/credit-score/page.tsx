"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_CREDIT_ASSESSMENT } from "@/lib/mock-data";
import { formatCAD, formatPercent } from "@/lib/calculations";

export default function CreditScorePage() {
  const credit = MOCK_CREDIT_ASSESSMENT;
  const score = credit.edukard_score;
  const riskLabel = credit.risk_flag === "green" ? "Low Risk" : credit.risk_flag === "yellow" ? "Medium Risk" : "High Risk";
  const riskColor = credit.risk_flag === "green" ? "#10B981" : credit.risk_flag === "yellow" ? "#F59E0B" : "#EF4444";
  const riskBg = credit.risk_flag === "green" ? "rgba(16,185,129,0.12)" : credit.risk_flag === "yellow" ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)";

  // Score gauge angle (0-100 maps to 0-270 degrees)
  const angle = (score / 100) * 270;
  const circumference = 2 * Math.PI * 90;
  const dashOffset = circumference - (angle / 360) * circumference;

  return (
    <DashboardLayout role="student" userName="Amara Okafor">
      <h1 style={s.title}>Your EduKard Score</h1>
      <p style={s.subtitle}>Your creditworthiness assessed without a traditional credit bureau report.</p>

      <div style={s.topGrid}>
        {/* Score Gauge */}
        <div style={s.gaugeCard}>
          <div style={s.gaugeWrap}>
            <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: "rotate(-135deg)" }}>
              <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(75,85,99,0.15)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`} />
              <circle cx="110" cy="110" r="90" fill="none" stroke={riskColor} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${circumference}`} strokeDashoffset={dashOffset} style={{ transition: "stroke-dashoffset 1.5s ease" }} />
            </svg>
            <div style={s.gaugeCenter}>
              <div style={{ ...s.gaugeScore, color: riskColor }}>{score}</div>
              <div style={s.gaugeLabel}>out of 100</div>
            </div>
          </div>
          <div style={{ ...s.riskPill, background: riskBg, color: riskColor }}>● {riskLabel}</div>
          <p style={s.gaugeDesc}>EduKard uses payroll data, employment stability, and income-to-debt metrics to assess your eligibility — no traditional credit score required.</p>
        </div>

        {/* Details */}
        <div style={s.detailsCol}>
          <div style={s.detailCard}>
            <h3 style={s.detailTitle}>Approved Borrowing Limit</h3>
            <div style={s.approvedAmount}>{formatCAD(credit.approved_limit)}</div>
            <p style={s.detailDesc}>Maximum tuition financing available based on your verified income and risk profile.</p>
          </div>

          <div style={s.metricsCard}>
            <h3 style={s.detailTitle}>Score Breakdown</h3>
            <div style={s.metricsList}>
              {[
                { label: "Monthly Net Income", value: formatCAD(credit.monthly_income), icon: "💰" },
                { label: "Debt-to-Income Ratio", value: formatPercent(credit.dti_ratio), icon: "📊", color: credit.dti_ratio < 30 ? "#10B981" : credit.dti_ratio < 40 ? "#F59E0B" : "#EF4444" },
                { label: "Employment Duration", value: `${credit.employment_months} months`, icon: "💼" },
                { label: "Risk Classification", value: riskLabel, icon: "🛡️", color: riskColor },
              ].map((m) => (
                <div key={m.label} style={s.metricRow}>
                  <span style={s.metricIcon}>{m.icon}</span>
                  <span style={s.metricLabel}>{m.label}</span>
                  <span style={{ ...s.metricValue, color: m.color || "#F9FAFB" }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Factors */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Scoring Factors</h2>
        <div style={s.factorsGrid}>
          {[
            { title: "Income Stability", score: Math.min(30, Math.round((credit.employment_months / 12) * 10)), max: 30, desc: "Based on length of continuous employment", icon: "📈" },
            { title: "Affordability", score: credit.dti_ratio < 20 ? 40 : credit.dti_ratio < 30 ? 30 : credit.dti_ratio < 40 ? 20 : 10, max: 40, desc: "Your debt-to-income ratio capacity", icon: "💳" },
            { title: "Income Level", score: Math.min(30, Math.round((credit.monthly_income / 5000) * 30)), max: 30, desc: "Monthly income relative to loan amount", icon: "💰" },
          ].map((f) => (
            <div key={f.title} style={s.factorCard}>
              <div style={s.factorHeader}>
                <span style={s.factorIcon}>{f.icon}</span>
                <span style={s.factorTitle}>{f.title}</span>
                <span style={s.factorScore}>{f.score}/{f.max}</span>
              </div>
              <div style={s.factorTrack}>
                <div style={{ ...s.factorBar, width: `${(f.score / f.max) * 100}%`, background: f.score / f.max > 0.7 ? "#10B981" : f.score / f.max > 0.4 ? "#F59E0B" : "#EF4444" }} />
              </div>
              <div style={s.factorDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Adverse action if denied */}
      {credit.denial_reason && (
        <div style={s.adverseCard}>
          <div style={s.adverseIcon}>⚠️</div>
          <div>
            <h3 style={s.adverseTitle}>Adverse Action Notice</h3>
            <p style={s.adverseMsg}>{credit.denial_reason}</p>
          </div>
        </div>
      )}

      <div style={s.disclaimer}>
        <strong>Disclosure:</strong> Your EduKard Score is an internal assessment metric and does not represent a traditional credit score. It is not reported to credit bureaus. Your score may change as your income and employment data is updated.
      </div>
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "28px" },
  topGrid: { display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px", marginBottom: "28px" },
  gaugeCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "32px", textAlign: "center" as const },
  gaugeWrap: { position: "relative" as const, width: "220px", height: "220px", margin: "0 auto 20px" },
  gaugeCenter: { position: "absolute" as const, top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" as const },
  gaugeScore: { fontSize: "48px", fontWeight: 800, lineHeight: 1 },
  gaugeLabel: { fontSize: "13px", color: "#6B7280", marginTop: "4px" },
  riskPill: { display: "inline-flex", padding: "6px 16px", borderRadius: "100px", fontSize: "13px", fontWeight: 700, marginBottom: "16px" },
  gaugeDesc: { fontSize: "13px", color: "#6B7280", lineHeight: 1.7 },
  detailsCol: { display: "flex", flexDirection: "column" as const, gap: "16px" },
  detailCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "28px" },
  detailTitle: { fontSize: "16px", fontWeight: 700, color: "#F9FAFB", marginBottom: "12px" },
  approvedAmount: { fontSize: "36px", fontWeight: 800, color: "#10B981", marginBottom: "8px" },
  detailDesc: { fontSize: "13px", color: "#6B7280", lineHeight: 1.6 },
  metricsCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px", flex: 1 },
  metricsList: { display: "flex", flexDirection: "column" as const, gap: "14px" },
  metricRow: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", borderRadius: "10px", background: "rgba(31,41,55,0.3)" },
  metricIcon: { fontSize: "20px", flexShrink: 0 },
  metricLabel: { flex: 1, fontSize: "14px", color: "#6B7280" },
  metricValue: { fontSize: "15px", fontWeight: 700 },
  section: { marginBottom: "28px" },
  sectionTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "14px" },
  factorsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" },
  factorCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "20px" },
  factorHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" },
  factorIcon: { fontSize: "18px" },
  factorTitle: { flex: 1, fontSize: "14px", fontWeight: 600, color: "#F9FAFB" },
  factorScore: { fontSize: "14px", fontWeight: 700, color: "#D1D5DB" },
  factorTrack: { height: "6px", borderRadius: "100px", background: "rgba(31,41,55,0.4)", marginBottom: "10px" },
  factorBar: { height: "100%", borderRadius: "100px", transition: "width 1s ease" },
  factorDesc: { fontSize: "12px", color: "#6B7280", lineHeight: 1.5 },
  adverseCard: { display: "flex", gap: "16px", padding: "20px 24px", borderRadius: "14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", marginBottom: "24px" },
  adverseIcon: { fontSize: "28px", flexShrink: 0, marginTop: "2px" },
  adverseTitle: { fontSize: "16px", fontWeight: 700, color: "#EF4444", marginBottom: "6px" },
  adverseMsg: { fontSize: "14px", color: "#D1D5DB", lineHeight: 1.7 },
  disclaimer: { fontSize: "12px", color: "#6B7280", lineHeight: 1.7, padding: "16px 20px", borderRadius: "12px", background: "rgba(31,41,55,0.3)", border: "1px solid rgba(75,85,99,0.2)" },
};
