import DashboardLayout from "@/components/DashboardLayout";
import { getProfile, getPayrollConnections, getCreditAssessment } from "@/lib/data-access";
import { formatCAD, formatDate } from "@/lib/calculations";
import { integrationStatus } from "@/lib/integrations";
import PlaidLinkButton from "./PlaidLinkButton";

export const dynamic = "force-dynamic";

export default async function PayrollPage() {
  const profile = await getProfile();
  const connections = profile ? await getPayrollConnections(profile.id) : [];
  const credit = profile ? await getCreditAssessment(profile.id) : null;
  const plaidLive = integrationStatus().plaid;
  const userName = profile?.full_name || "Student";
  const primary = connections[0];

  return (
    <DashboardLayout role="student" userName={userName}>
      <h1 style={s.title}>Payroll Connection</h1>
      <p style={s.subtitle}>Connect your employer to verify income and enable automatic deductions.</p>

      <div style={s.trustRow}>
        {["🔒 Bank-level Encryption", "👁️ Read-only Access", "🛡️ PIPEDA Compliant", "🔗 Powered by Plaid"].map((b) => (
          <span key={b} style={s.trustBadge}>{b}</span>
        ))}
      </div>

      {primary ? (
        <div style={s.employerCard}>
          <div style={s.employerHeader}>
            <div style={s.employerIconWrap}>🏦</div>
            <div style={{ flex: 1 }}>
              <div style={s.employerName}>{primary.institution_name || "Linked account"}</div>
              <div style={s.employerMeta}>Connected via Plaid · Since {formatDate(primary.created_at)}</div>
            </div>
            <span style={{ ...s.connectedBadge, color: primary.status === "active" ? "#10B981" : "#F59E0B", background: primary.status === "active" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)" }}>● {primary.status}</span>
          </div>
          <div style={s.employerDetails}>
            <div><span style={s.detLabel}>Monthly Income</span><span style={{ ...s.detValue, color: "#10B981" }}>{credit ? formatCAD(Number(credit.monthly_income)) : "Pending sync"}</span></div>
            <div><span style={s.detLabel}>Employment Duration</span><span style={s.detValue}>{credit ? `${credit.employment_months} months` : "—"}</span></div>
            <div><span style={s.detLabel}>Income Verification</span><span style={{ ...s.detValue, color: credit ? "#10B981" : "#F59E0B" }}>{credit ? "✓ Verified" : "In progress"}</span></div>
            <div><span style={s.detLabel}>Linked Accounts</span><span style={s.detValue}>{connections.length}</span></div>
          </div>
        </div>
      ) : (
        <div style={s.employerCard}>
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔗</div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#F9FAFB", marginBottom: "8px" }}>No payroll connected</h2>
            <p style={{ fontSize: "14px", color: "#6B7280", maxWidth: "440px", margin: "0 auto 20px", lineHeight: 1.6 }}>
              Securely connect your bank or payroll provider to verify income and unlock financing. EduKard uses read-only access via Plaid.
            </p>
            <PlaidLinkButton enabled={plaidLive} />
          </div>
        </div>
      )}

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Recent Payslips</h2>
        <div style={s.tableCard}>
          <div style={{ padding: "28px", textAlign: "center", color: "#6B7280", fontSize: "14px", lineHeight: 1.6 }}>
            Payslip history appears here once your payroll income report syncs from Plaid.
          </div>
        </div>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionTitle}>How payroll deduction works</h2>
        <div style={s.stepsRow}>
          {[
            { icon: "🔗", title: "Link your employer", desc: "We verify your employment and income using a read-only payroll connection." },
            { icon: "📋", title: "Set up payment plan", desc: "Choose a flexible repayment plan aligned with your pay schedule." },
            { icon: "🔄", title: "Automatic deductions", desc: "Payments are automatically deducted from your pay — never miss a payment." },
          ].map((step) => (
            <div key={step.title} style={s.stepCard}>
              <div style={s.stepIcon}>{step.icon}</div>
              <div style={s.stepTitle}>{step.title}</div>
              <div style={s.stepDesc}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.noticeBox}>
        <strong style={{ color: "#F59E0B" }}>🔒 Your data is secure</strong>
        <p style={{ fontSize: "13px", color: "#D1D5DB", lineHeight: 1.7, marginTop: "6px" }}>
          EduKard connects to your payroll/bank using bank-level encryption via Plaid. We only access read-only data (pay stubs,
          employment dates) and never store your login credentials. You can disconnect at any time.
        </p>
      </div>
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "20px" },
  trustRow: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  trustBadge: { padding: "6px 14px", borderRadius: "100px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", color: "#10B981", fontSize: "12px", fontWeight: 600 },
  employerCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px", marginBottom: "24px" },
  employerHeader: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px", flexWrap: "wrap" as const },
  employerIconWrap: { width: "48px", height: "48px", borderRadius: "12px", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 },
  employerName: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB" },
  employerMeta: { fontSize: "13px", color: "#6B7280", marginTop: "3px" },
  connectedBadge: { marginLeft: "auto", padding: "6px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: 700, textTransform: "capitalize" as const },
  employerDetails: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" },
  detLabel: { display: "block", fontSize: "12px", color: "#6B7280", marginBottom: "2px" },
  detValue: { display: "block", fontSize: "15px", fontWeight: 700, color: "#F9FAFB" },
  section: { marginBottom: "28px" },
  sectionTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "14px" },
  tableCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "auto" },
  stepsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" },
  stepCard: { background: "rgba(31,41,55,0.3)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "12px", padding: "22px 20px", textAlign: "center" as const },
  stepIcon: { fontSize: "32px", marginBottom: "10px" },
  stepTitle: { fontSize: "15px", fontWeight: 700, color: "#F9FAFB", marginBottom: "6px" },
  stepDesc: { fontSize: "13px", color: "#6B7280", lineHeight: 1.6 },
  authBtn: { width: "100%", padding: "14px", borderRadius: "12px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "15px", fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(16,185,129,0.15)" },
  noticeBox: { background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "14px", padding: "20px" },
};
