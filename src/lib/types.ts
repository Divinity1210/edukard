// Types for the EduKard platform
export type UserRole = "student" | "investor" | "admin" | "university" | "agent";

export type KYCStatus = "not_started" | "pending" | "approved" | "rejected";

export type LoanStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "disbursing"
  | "disbursed"
  | "repaying"
  | "paid_off"
  | "defaulted"
  | "rejected";

export type PaymentStatus = "scheduled" | "processing" | "completed" | "failed" | "late";

export type RiskFlag = "green" | "yellow" | "red";

export type TrancheType = "senior" | "junior";

export type InvestmentStatus = "active" | "withdrawn" | "matured";

export type CollectionStatus = "current" | "1_30_late" | "31_60_late" | "61_90_late" | "default";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  kyc_status: KYCStatus;
  created_at: string;
  updated_at: string;
}

export interface CreditAssessment {
  id: string;
  user_id: string;
  monthly_income: number;
  dti_ratio: number;
  edukard_score: number;
  approved_limit: number;
  employment_months: number;
  risk_flag: RiskFlag;
  denial_reason?: string;
  assessed_at: string;
}

export interface LoanApplication {
  id: string;
  user_id: string;
  university_name: string;
  student_id_number: string;
  tuition_amount: number;
  loan_amount: number;
  apr: number;
  term_months: number;
  monthly_payment: number;
  total_cost: number;
  status: LoanStatus;
  risk_flag: RiskFlag;
  admin_notes?: string;
  invoice_url?: string;
  created_at: string;
  updated_at: string;
}

export interface RepaymentSchedule {
  id: string;
  loan_id: string;
  payment_number: number;
  due_date: string;
  principal: number;
  interest: number;
  total_payment: number;
  remaining_balance: number;
  status: PaymentStatus;
  paid_at?: string;
}

export interface InvestorProfile {
  id: string;
  user_id: string;
  investor_type: "individual" | "institutional";
  total_invested: number;
  total_yield_earned: number;
  kyc_status: KYCStatus;
}

export interface Investment {
  id: string;
  investor_id: string;
  tranche: TrancheType;
  principal: number;
  accrued_yield: number;
  target_apy: number;
  invested_at: string;
  status: InvestmentStatus;
}

export interface LiquidityPool {
  id: string;
  tranche: TrancheType;
  total_capital: number;
  deployed_capital: number;
  available_capital: number;
  utilization_ratio: number;
  target_apy: number;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  link?: string;
  created_at: string;
}

// Canadian University type
export interface University {
  id: string;
  name: string;
  dli_number: string;
  province: string;
  city: string;
  settlement_account?: string;
}

// Amortization calculator types
export interface AmortizationRow {
  payment_number: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

// Dashboard stats
export interface StudentDashboardStats {
  total_borrowed: number;
  total_paid: number;
  remaining_balance: number;
  next_payment_date: string;
  next_payment_amount: number;
  loan_status: LoanStatus;
}

export interface InvestorDashboardStats {
  total_invested: number;
  total_yield: number;
  portfolio_value: number;
  senior_allocation: number;
  junior_allocation: number;
  weighted_apy: number;
}

export interface AdminDashboardStats {
  pending_applications: number;
  active_loans: number;
  total_disbursed: number;
  default_rate: number;
  pool_utilization: number;
  total_tvl: number;
}

// KYC Onboarding Steps (US-B1.1.2)
export type KYCStepStatus = "pending" | "in_progress" | "completed" | "failed";

export interface KYCStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  status: KYCStepStatus;
  completed_at?: string;
}

// Employer / Payroll Connection (US-B1.2.1)
export interface EmployerConnection {
  id: string;
  user_id: string;
  employer_name: string;
  employer_logo?: string;
  position: string;
  monthly_income: number;
  employment_start: string;
  pay_frequency: "weekly" | "biweekly" | "semimonthly" | "monthly";
  connected_at: string;
  status: "connected" | "disconnected" | "pending";
  last_synced?: string;
}

export interface PayslipSummary {
  id: string;
  pay_date: string;
  gross_pay: number;
  net_pay: number;
  deductions: number;
  hours_worked?: number;
}

// Application Timeline / Disbursement Tracking (US-B1.3.2)
export type TimelineStepStatus = "completed" | "active" | "upcoming";

export interface ApplicationTimelineStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  status: TimelineStepStatus;
  timestamp?: string;
  details?: string;
}

// Investor KYB / Onboarding (US-I2.1.1)
export type InvestorEntityType = "individual" | "corporation" | "fund" | "trust";

export interface InvestorOnboarding {
  entity_type: InvestorEntityType;
  accredited: boolean;
  bank_linked: boolean;
  kyc_complete: boolean;
}

// Fiat Deposit (US-I2.1.2)
export type DepositStatus = "pending" | "processing" | "confirmed" | "failed";

export interface FiatDeposit {
  id: string;
  investor_id: string;
  amount: number;
  method: "wire" | "ach" | "eft";
  status: DepositStatus;
  usdc_equivalent: number;
  initiated_at: string;
  confirmed_at?: string;
}

// Collections Communication Log (US-A3.1.2)
export type CommChannel = "email" | "sms" | "phone" | "letter";

export interface CommunicationLog {
  id: string;
  loan_id: string;
  channel: CommChannel;
  subject: string;
  message: string;
  sent_at: string;
  sent_by: string;
  status: "sent" | "delivered" | "failed";
}

// Underwriting Detail (US-A3.1.1)
export interface UnderwritingDetail {
  application: LoanApplication;
  applicant_name: string;
  credit: CreditAssessment;
  employer: EmployerConnection;
  payslips: PayslipSummary[];
  documents: string[];
}

// ===== NEW MODULES FOR ECOSYSTEM EXPANSION =====

export interface UniversityDashboardStats {
  total_students: number;
  total_disbursed: number;
  pending_invoices: number;
  settlements_processing: number;
}

export interface UniversityInvoice {
  id: string;
  student_id: string; // Internal DLI format
  student_name: string;
  program_name: string;
  term: string;
  tuition_amount: number;
  due_date: string;
  status: "unmatched" | "matched" | "disbursing" | "settled";
  edukard_loan_id?: string;
  uploaded_at: string;
}

export interface UniversitySettlement {
  id: string;
  date: string;
  amount: number;
  currency: "CAD" | "USDC";
  transaction_hash?: string;
  status: "pending" | "completed";
  student_count: number;
}

export interface AgentDashboardStats {
  total_referrals: number;
  active_loans: number;
  total_commission: number;
  pending_commission: number;
}

export interface AgentReferral {
  id: string;
  student_name: string;
  university_target: string;
  loan_status: LoanStatus;
  loan_amount?: number;
  commission_earned: number;
  commission_status: "pending" | "paid";
  referred_at: string;
}
