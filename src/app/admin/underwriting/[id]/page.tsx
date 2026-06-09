import DashboardLayout from "@/components/DashboardLayout";
import { getProfile, getUnderwritingDetail } from "@/lib/data-access";
import UnderwritingClient, { type UnderwritingDetailProps } from "./UnderwritingClient";

export const dynamic = "force-dynamic";

export default async function UnderwritingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile();
  const detail = await getUnderwritingDetail(id);

  if (!detail) {
    return (
      <DashboardLayout role="admin" userName={profile?.full_name || "Admin User"}>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#F9FAFB" }}>Application Not Found</h2>
          <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "8px" }}>ID: {id}</p>
          <a href="/admin/underwriting" style={{ display: "inline-block", marginTop: "20px", padding: "10px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>← Back to Queue</a>
        </div>
      </DashboardLayout>
    );
  }

  const loan = detail.loan as Record<string, unknown> & {
    profiles?: { full_name?: string; kyc_status?: string } | null;
    university?: { name?: string } | null;
  };
  const credit = detail.credit as Record<string, number | string | null> | null;

  const props: UnderwritingDetailProps = {
    loanId: String(loan.id),
    applicantName: loan.profiles?.full_name || "Unknown applicant",
    universityName: loan.university?.name || "—",
    status: String(loan.status),
    loanAmount: Number(loan.loan_amount),
    apr: Number(loan.apr),
    termMonths: Number(loan.term_months),
    monthlyPayment: Number(loan.monthly_payment),
    totalCost: Number(loan.total_cost),
    riskFlag: (loan.risk_flag as "green" | "yellow" | "red") || "yellow",
    createdAt: String(loan.created_at),
    kycStatus: loan.profiles?.kyc_status || "not_started",
    invoiceUrl: (loan.invoice_url as string | null) ?? null,
    credit: credit
      ? {
          edukardScore: Number(credit.edukard_score),
          riskFlag: (credit.risk_flag as "green" | "yellow" | "red") || "yellow",
          assessedAt: String(credit.assessed_at),
          monthlyIncome: Number(credit.monthly_income),
          dtiRatio: Number(credit.dti_ratio),
          employmentMonths: Number(credit.employment_months),
          approvedLimit: Number(credit.approved_limit),
          denialReason: (credit.denial_reason as string | null) ?? null,
        }
      : null,
    payrollConnections: (detail.payroll_connections as { institution_name: string | null; status: string }[]) || [],
  };

  return (
    <DashboardLayout role="admin" userName={profile?.full_name || "Admin User"}>
      <UnderwritingClient detail={props} />
    </DashboardLayout>
  );
}
