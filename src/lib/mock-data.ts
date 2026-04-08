// Mock data for demo/development - simulates Supabase responses
import type {
  Profile, CreditAssessment, LoanApplication, RepaymentSchedule,
  Investment, LiquidityPool, StudentDashboardStats, InvestorDashboardStats,
  AdminDashboardStats, Notification, AuditLogEntry
} from "./types";

// ===== STUDENT DATA =====
export const MOCK_STUDENT_PROFILE: Profile = {
  id: "student-001",
  email: "amara.okafor@mail.utoronto.ca",
  full_name: "Amara Okafor",
  role: "student",
  kyc_status: "approved",
  created_at: "2026-01-15T10:00:00Z",
  updated_at: "2026-03-20T14:30:00Z",
};

export const MOCK_CREDIT_ASSESSMENT: CreditAssessment = {
  id: "ca-001",
  user_id: "student-001",
  monthly_income: 3200,
  dti_ratio: 28.5,
  edukard_score: 72,
  approved_limit: 18000,
  employment_months: 14,
  risk_flag: "green",
  assessed_at: "2026-02-01T09:00:00Z",
};

export const MOCK_LOAN: LoanApplication = {
  id: "loan-001",
  user_id: "student-001",
  university_name: "University of Toronto",
  student_id_number: "1009876543",
  tuition_amount: 15500,
  loan_amount: 15500,
  apr: 11.5,
  term_months: 24,
  monthly_payment: 726.84,
  total_cost: 17444.16,
  status: "repaying",
  risk_flag: "green",
  invoice_url: "/documents/tuition-invoice.pdf",
  created_at: "2026-02-10T11:00:00Z",
  updated_at: "2026-03-01T16:00:00Z",
};

export const MOCK_REPAYMENT_SCHEDULE: RepaymentSchedule[] = [
  { id: "rs-1", loan_id: "loan-001", payment_number: 1, due_date: "2026-03-01", principal: 578.18, interest: 148.54, total_payment: 726.84, remaining_balance: 14921.82, status: "completed", paid_at: "2026-03-01T10:00:00Z" },
  { id: "rs-2", loan_id: "loan-001", payment_number: 2, due_date: "2026-04-01", principal: 583.72, interest: 143.00, total_payment: 726.84, remaining_balance: 14338.10, status: "completed", paid_at: "2026-04-01T10:00:00Z" },
  { id: "rs-3", loan_id: "loan-001", payment_number: 3, due_date: "2026-05-01", principal: 589.32, interest: 137.41, total_payment: 726.84, remaining_balance: 13748.78, status: "scheduled" },
  { id: "rs-4", loan_id: "loan-001", payment_number: 4, due_date: "2026-06-01", principal: 594.97, interest: 131.76, total_payment: 726.84, remaining_balance: 13153.81, status: "scheduled" },
  { id: "rs-5", loan_id: "loan-001", payment_number: 5, due_date: "2026-07-01", principal: 600.67, interest: 126.06, total_payment: 726.84, remaining_balance: 12553.14, status: "scheduled" },
  { id: "rs-6", loan_id: "loan-001", payment_number: 6, due_date: "2026-08-01", principal: 606.43, interest: 120.30, total_payment: 726.84, remaining_balance: 11946.71, status: "scheduled" },
];

export const MOCK_STUDENT_STATS: StudentDashboardStats = {
  total_borrowed: 15500,
  total_paid: 1453.68,
  remaining_balance: 14338.10,
  next_payment_date: "2026-05-01",
  next_payment_amount: 726.84,
  loan_status: "repaying",
};

// ===== INVESTOR DATA =====
export const MOCK_INVESTOR_PROFILE: Profile = {
  id: "investor-001",
  email: "marcus.chen@nexuscapital.ca",
  full_name: "Marcus Chen",
  role: "investor",
  kyc_status: "approved",
  created_at: "2026-01-05T08:00:00Z",
  updated_at: "2026-03-15T12:00:00Z",
};

export const MOCK_INVESTMENTS: Investment[] = [
  {
    id: "inv-001",
    investor_id: "investor-001",
    tranche: "senior",
    principal: 50000,
    accrued_yield: 1643.84,
    target_apy: 8,
    invested_at: "2026-01-15T10:00:00Z",
    status: "active",
  },
  {
    id: "inv-002",
    investor_id: "investor-001",
    tranche: "junior",
    principal: 25000,
    accrued_yield: 1438.36,
    target_apy: 14,
    invested_at: "2026-01-20T10:00:00Z",
    status: "active",
  },
];

export const MOCK_INVESTOR_STATS: InvestorDashboardStats = {
  total_invested: 75000,
  total_yield: 3082.20,
  portfolio_value: 78082.20,
  senior_allocation: 50000,
  junior_allocation: 25000,
  weighted_apy: 10,
};

export const MOCK_PORTFOLIO_HISTORY = [
  { date: "Jan 15", value: 75000 },
  { date: "Feb 01", value: 75520 },
  { date: "Feb 15", value: 76100 },
  { date: "Mar 01", value: 76750 },
  { date: "Mar 15", value: 77420 },
  { date: "Apr 01", value: 78082 },
];

// ===== POOL DATA =====
export const MOCK_POOLS: LiquidityPool[] = [
  {
    id: "pool-senior",
    tranche: "senior",
    total_capital: 2500000,
    deployed_capital: 2125000,
    available_capital: 375000,
    utilization_ratio: 85,
    target_apy: 8,
    updated_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "pool-junior",
    tranche: "junior",
    total_capital: 1000000,
    deployed_capital: 780000,
    available_capital: 220000,
    utilization_ratio: 78,
    target_apy: 14,
    updated_at: "2026-04-01T00:00:00Z",
  },
];

// ===== ADMIN DATA =====
export const MOCK_ADMIN_STATS: AdminDashboardStats = {
  pending_applications: 12,
  active_loans: 847,
  total_disbursed: 12450000,
  default_rate: 2.1,
  pool_utilization: 83,
  total_tvl: 3500000,
};

export const MOCK_PENDING_APPLICATIONS: LoanApplication[] = [
  {
    id: "loan-pending-1", user_id: "s-002", university_name: "University of British Columbia",
    student_id_number: "20234567", tuition_amount: 12000, loan_amount: 12000,
    apr: 11.5, term_months: 18, monthly_payment: 726.84, total_cost: 13083.12,
    status: "under_review", risk_flag: "green", created_at: "2026-03-28T14:00:00Z", updated_at: "2026-03-28T14:00:00Z",
  },
  {
    id: "loan-pending-2", user_id: "s-003", university_name: "McGill University",
    student_id_number: "20239876", tuition_amount: 18500, loan_amount: 18500,
    apr: 11.5, term_months: 24, monthly_payment: 868.10, total_cost: 20834.40,
    status: "under_review", risk_flag: "yellow", created_at: "2026-03-29T09:00:00Z", updated_at: "2026-03-29T09:00:00Z",
  },
  {
    id: "loan-pending-3", user_id: "s-004", university_name: "Conestoga College",
    student_id_number: "20231234", tuition_amount: 8000, loan_amount: 8000,
    apr: 11.5, term_months: 12, monthly_payment: 707.35, total_cost: 8488.20,
    status: "under_review", risk_flag: "red", created_at: "2026-03-30T11:00:00Z", updated_at: "2026-03-30T11:00:00Z",
  },
  {
    id: "loan-pending-4", user_id: "s-005", university_name: "University of Alberta",
    student_id_number: "20237890", tuition_amount: 14000, loan_amount: 14000,
    apr: 11.5, term_months: 24, monthly_payment: 656.52, total_cost: 15756.48,
    status: "submitted", risk_flag: "green", created_at: "2026-04-01T08:00:00Z", updated_at: "2026-04-01T08:00:00Z",
  },
];

export const MOCK_APPLICANT_NAMES: Record<string, string> = {
  "s-002": "Priya Sharma",
  "s-003": "Jean-Pierre Dubois",
  "s-004": "Fatima Al-Rashid",
  "s-005": "Daniel Kimani",
};

// ===== NOTIFICATIONS =====
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n-1", user_id: "student-001", title: "Payment Processed", message: "Your April payment of $726.84 has been processed successfully.", type: "success", read: false, created_at: "2026-04-01T10:00:00Z" },
  { id: "n-2", user_id: "student-001", title: "Payment Reminder", message: "Your next payment of $726.84 is due on May 1, 2026.", type: "info", read: false, link: "/student/payments", created_at: "2026-03-25T09:00:00Z" },
  { id: "n-3", user_id: "student-001", title: "KYC Approved", message: "Your identity verification has been approved.", type: "success", read: true, created_at: "2026-02-01T12:00:00Z" },
];

// ===== AUDIT LOG =====
export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  { id: "al-1", user_id: "admin-001", action: "application_approved", entity_type: "loan", entity_id: "loan-001", details: { reason: "All checks passed" }, created_at: "2026-02-20T14:30:00Z" },
  { id: "al-2", user_id: "admin-001", action: "funds_disbursed", entity_type: "loan", entity_id: "loan-001", details: { amount: 15500, university: "University of Toronto" }, created_at: "2026-03-01T09:00:00Z" },
];

// Collection status for admin
export const MOCK_DELINQUENT_ACCOUNTS = [
  { loan_id: "loan-late-1", borrower: "Alex Thompson", university: "York University", amount_overdue: 726.84, days_late: 15, status: "1_30_late" as const, last_contact: "2026-03-20" },
  { loan_id: "loan-late-2", borrower: "Sarah Kim", university: "Seneca College", amount_overdue: 1453.68, days_late: 45, status: "31_60_late" as const, last_contact: "2026-03-10" },
  { loan_id: "loan-late-3", borrower: "Omar Hassan", university: "Humber College", amount_overdue: 2180.52, days_late: 92, status: "default" as const, last_contact: "2026-02-15" },
];

// ===== KYC ONBOARDING STEPS (US-B1.1.2) =====
export const MOCK_KYC_STEPS: import("./types").KYCStep[] = [
  { id: "kyc-1", step_number: 1, title: "Personal Information", description: "Provide your legal name, date of birth, and address.", status: "completed", completed_at: "2026-01-15T10:05:00Z" },
  { id: "kyc-2", step_number: 2, title: "Government ID", description: "Upload a photo of your passport, driver's license, or national ID card (front and back).", status: "completed", completed_at: "2026-01-15T10:12:00Z" },
  { id: "kyc-3", step_number: 3, title: "Selfie Verification", description: "Take a live selfie to verify your identity. A liveness check will be performed.", status: "completed", completed_at: "2026-01-15T10:15:00Z" },
  { id: "kyc-4", step_number: 4, title: "Student Verification", description: "Upload your Student ID card or University acceptance letter to confirm enrollment.", status: "completed", completed_at: "2026-01-15T10:20:00Z" },
];

// ===== EMPLOYER SEARCH RESULTS (US-B1.2.1) =====
export const MOCK_EMPLOYER_SEARCH = [
  { id: "emp-1", name: "Tim Hortons", category: "Food & Beverage", connected: true, logo: "🍩" },
  { id: "emp-2", name: "Shoppers Drug Mart", category: "Retail / Pharmacy", connected: false, logo: "💊" },
  { id: "emp-3", name: "Walmart Canada", category: "Retail", connected: false, logo: "🏪" },
  { id: "emp-4", name: "Amazon Fulfillment", category: "Logistics", connected: false, logo: "📦" },
  { id: "emp-5", name: "Starbucks Canada", category: "Food & Beverage", connected: false, logo: "☕" },
  { id: "emp-6", name: "CIBC", category: "Banking", connected: false, logo: "🏦" },
  { id: "emp-7", name: "Loblaws", category: "Grocery", connected: false, logo: "🛒" },
  { id: "emp-8", name: "Rogers Communications", category: "Telecom", connected: false, logo: "📡" },
];

export const MOCK_PAYSLIPS: import("./types").PayslipSummary[] = [
  { id: "ps-1", pay_date: "2026-03-15", gross_pay: 1680.00, net_pay: 1420.80, deductions: 259.20, hours_worked: 80 },
  { id: "ps-2", pay_date: "2026-03-01", gross_pay: 1600.00, net_pay: 1356.00, deductions: 244.00, hours_worked: 76 },
  { id: "ps-3", pay_date: "2026-02-15", gross_pay: 1720.00, net_pay: 1458.20, deductions: 261.80, hours_worked: 82 },
  { id: "ps-4", pay_date: "2026-02-01", gross_pay: 1600.00, net_pay: 1356.00, deductions: 244.00, hours_worked: 76 },
  { id: "ps-5", pay_date: "2026-01-15", gross_pay: 1560.00, net_pay: 1322.40, deductions: 237.60, hours_worked: 74 },
  { id: "ps-6", pay_date: "2026-01-01", gross_pay: 1640.00, net_pay: 1390.60, deductions: 249.40, hours_worked: 78 },
];

// ===== APPLICATION TIMELINE (US-B1.3.2) =====
export const MOCK_APPLICATION_TIMELINE: import("./types").ApplicationTimelineStep[] = [
  { id: "tl-1", step_number: 1, title: "Application Submitted", description: "Your loan application has been submitted for review.", status: "completed", timestamp: "2026-02-10T11:00:00Z", details: "Application #loan-001 for $15,500.00" },
  { id: "tl-2", step_number: 2, title: "Under Review", description: "Our underwriting team is reviewing your application and verifying your documents.", status: "completed", timestamp: "2026-02-12T09:30:00Z", details: "EduKard Score: 72 · Risk: Low" },
  { id: "tl-3", step_number: 3, title: "Approved", description: "Your application has been approved. Preparing fund disbursement.", status: "completed", timestamp: "2026-02-15T14:00:00Z", details: "Approved by: Risk Engine (Auto)" },
  { id: "tl-4", step_number: 4, title: "Disbursing Funds", description: "Funds are being transferred to your university's settlement account.", status: "completed", timestamp: "2026-02-28T10:00:00Z", details: "Wire initiated to University of Toronto Bursar" },
  { id: "tl-5", step_number: 5, title: "Funds Disbursed to University", description: "Funds have been received and confirmed by the University of Toronto.", status: "completed", timestamp: "2026-03-01T09:00:00Z", details: "Settlement ref: EK-2026-UToronto-001" },
];

// ===== INVESTOR DEPOSITS (US-I2.1.2) =====
export const MOCK_DEPOSITS: import("./types").FiatDeposit[] = [
  { id: "dep-1", investor_id: "investor-001", amount: 50000, method: "wire", status: "confirmed", usdc_equivalent: 50000, initiated_at: "2026-01-10T09:00:00Z", confirmed_at: "2026-01-12T14:00:00Z" },
  { id: "dep-2", investor_id: "investor-001", amount: 25000, method: "eft", status: "confirmed", usdc_equivalent: 25000, initiated_at: "2026-01-18T11:00:00Z", confirmed_at: "2026-01-20T10:00:00Z" },
  { id: "dep-3", investor_id: "investor-001", amount: 10000, method: "eft", status: "processing", usdc_equivalent: 10000, initiated_at: "2026-04-01T08:00:00Z" },
];

// ===== COLLECTIONS COMMUNICATION LOG (US-A3.1.2) =====
export const MOCK_COMMUNICATION_LOG: import("./types").CommunicationLog[] = [
  { id: "cl-1", loan_id: "loan-late-1", channel: "email", subject: "Payment Reminder — 15 Days Overdue", message: "Dear Alex, your payment of $726.84 was due on March 15. Please make payment at your earliest convenience to avoid late fees.", sent_at: "2026-03-20T09:00:00Z", sent_by: "System (Auto)", status: "delivered" },
  { id: "cl-2", loan_id: "loan-late-1", channel: "sms", subject: "Payment Reminder", message: "EduKard: Your payment of $726.84 is overdue. Log in to make a payment: edukard.ca/pay", sent_at: "2026-03-22T10:00:00Z", sent_by: "System (Auto)", status: "delivered" },
  { id: "cl-3", loan_id: "loan-late-2", channel: "email", subject: "Urgent: Account 31+ Days Past Due", message: "Dear Sarah, your account is now 31+ days past due with $1,453.68 outstanding. Please contact us immediately to arrange payment.", sent_at: "2026-03-10T09:00:00Z", sent_by: "Admin User", status: "delivered" },
  { id: "cl-4", loan_id: "loan-late-2", channel: "phone", subject: "Collections Call", message: "Spoke with borrower. Agreed to make partial payment of $500 by March 20. Will set up new PAD for remaining balance.", sent_at: "2026-03-12T14:30:00Z", sent_by: "Admin User", status: "sent" },
  { id: "cl-5", loan_id: "loan-late-3", channel: "letter", subject: "Notice of Default", message: "Formal notice of default issued. Account referred to collections partner.", sent_at: "2026-02-15T09:00:00Z", sent_by: "Admin User", status: "delivered" },
  { id: "cl-6", loan_id: "loan-late-3", channel: "email", subject: "Default Notice — Final Warning", message: "Dear Omar, this is a final notice regarding your defaulted loan of $2,180.52. Failure to respond within 14 days will result in referral to external collections.", sent_at: "2026-03-01T09:00:00Z", sent_by: "System (Auto)", status: "delivered" },
];

// ===== UNDERWRITING DETAIL DATA (US-A3.1.1) =====
export const MOCK_UNDERWRITING_DETAILS: Record<string, import("./types").UnderwritingDetail> = {
  "loan-pending-1": {
    application: MOCK_PENDING_APPLICATIONS[0],
    applicant_name: "Priya Sharma",
    credit: { id: "ca-002", user_id: "s-002", monthly_income: 2800, dti_ratio: 22.4, edukard_score: 68, approved_limit: 16800, employment_months: 11, risk_flag: "green", assessed_at: "2026-03-28T14:30:00Z" },
    employer: { id: "ec-002", user_id: "s-002", employer_name: "Shoppers Drug Mart", position: "Pharmacy Assistant", monthly_income: 2800, employment_start: "2025-04-15", pay_frequency: "biweekly", connected_at: "2026-03-27T10:00:00Z", status: "connected", last_synced: "2026-03-28T08:00:00Z" },
    payslips: [
      { id: "ps-p1", pay_date: "2026-03-15", gross_pay: 1480, net_pay: 1260, deductions: 220, hours_worked: 74 },
      { id: "ps-p2", pay_date: "2026-03-01", gross_pay: 1400, net_pay: 1190, deductions: 210, hours_worked: 70 },
      { id: "ps-p3", pay_date: "2026-02-15", gross_pay: 1520, net_pay: 1295, deductions: 225, hours_worked: 76 },
    ],
    documents: ["Government ID (Passport)", "Student ID — UBC", "Tuition Invoice — Winter 2026", "Study Permit"],
  },
  "loan-pending-2": {
    application: MOCK_PENDING_APPLICATIONS[1],
    applicant_name: "Jean-Pierre Dubois",
    credit: { id: "ca-003", user_id: "s-003", monthly_income: 3600, dti_ratio: 34.2, edukard_score: 52, approved_limit: 18000, employment_months: 8, risk_flag: "yellow", assessed_at: "2026-03-29T09:30:00Z" },
    employer: { id: "ec-003", user_id: "s-003", employer_name: "Rogers Communications", position: "Customer Service Rep", monthly_income: 3600, employment_start: "2025-07-01", pay_frequency: "biweekly", connected_at: "2026-03-28T15:00:00Z", status: "connected", last_synced: "2026-03-29T08:00:00Z" },
    payslips: [
      { id: "ps-jp1", pay_date: "2026-03-15", gross_pay: 1900, net_pay: 1615, deductions: 285, hours_worked: 80 },
      { id: "ps-jp2", pay_date: "2026-03-01", gross_pay: 1800, net_pay: 1530, deductions: 270, hours_worked: 76 },
    ],
    documents: ["Government ID (QC Driver License)", "Student ID — McGill", "Tuition Invoice — Winter 2026"],
  },
  "loan-pending-3": {
    application: MOCK_PENDING_APPLICATIONS[2],
    applicant_name: "Fatima Al-Rashid",
    credit: { id: "ca-004", user_id: "s-004", monthly_income: 1800, dti_ratio: 48.5, edukard_score: 31, approved_limit: 0, employment_months: 4, risk_flag: "red", denial_reason: "Insufficient employment history (4 months, minimum 6 required). DTI ratio of 48.5% exceeds the 40% threshold.", assessed_at: "2026-03-30T11:30:00Z" },
    employer: { id: "ec-004", user_id: "s-004", employer_name: "Tim Hortons", position: "Crew Member", monthly_income: 1800, employment_start: "2025-11-20", pay_frequency: "biweekly", connected_at: "2026-03-29T12:00:00Z", status: "connected", last_synced: "2026-03-30T08:00:00Z" },
    payslips: [
      { id: "ps-fa1", pay_date: "2026-03-15", gross_pay: 960, net_pay: 816, deductions: 144, hours_worked: 48 },
      { id: "ps-fa2", pay_date: "2026-03-01", gross_pay: 900, net_pay: 765, deductions: 135, hours_worked: 45 },
    ],
    documents: ["Government ID (Passport)", "Acceptance Letter — Conestoga", "Tuition Invoice — Spring 2026"],
  },
};



// ===== UNIVERSITY DATA =====
export const MOCK_UNIVERSITY_STATS: import('./types').UniversityDashboardStats = {
  total_students: 142,
  total_disbursed: 2150000,
  pending_invoices: 45,
  settlements_processing: 3,
};

export const MOCK_UNIVERSITY_INVOICES: import('./types').UniversityInvoice[] = [
  { id: 'inv-u1', student_id: '1009876543', student_name: 'Amara Okafor', program_name: 'BSc Computer Science', term: 'Fall 2026', tuition_amount: 15500, due_date: '2026-09-01', status: 'settled', edukard_loan_id: 'loan-001', uploaded_at: '2026-02-15T10:00:00Z' },
  { id: 'inv-u2', student_id: '1001234567', student_name: 'David Wong', program_name: 'MBA', term: 'Fall 2026', tuition_amount: 28000, due_date: '2026-09-01', status: 'matched', edukard_loan_id: 'loan-008', uploaded_at: '2026-03-20T14:00:00Z' },
  { id: 'inv-u3', student_id: '1009988776', student_name: 'Sofia Martinez', program_name: 'BA Economics', term: 'Fall 2026', tuition_amount: 14200, due_date: '2026-09-01', status: 'unmatched', uploaded_at: '2026-04-05T09:00:00Z' },
];

export const MOCK_UNIVERSITY_SETTLEMENTS: import('./types').UniversitySettlement[] = [
  { id: 'set-1', date: '2026-03-01T09:00:00Z', amount: 450000, currency: 'CAD', transaction_hash: '0x8f2d...4a1c', status: 'completed', student_count: 28 },
  { id: 'set-2', date: '2026-03-15T09:00:00Z', amount: 320000, currency: 'CAD', transaction_hash: '0x1b4e...9f2b', status: 'completed', student_count: 19 },
  { id: 'set-3', date: '2026-04-05T09:00:00Z', amount: 155000, currency: 'CAD', status: 'pending', student_count: 12 },
];

// ===== AGENT DATA =====
export const MOCK_AGENT_STATS: import('./types').AgentDashboardStats = {
  total_referrals: 114,
  active_loans: 47,
  total_commission: 47000,
  pending_commission: 8500,
};

export const MOCK_AGENT_REFERRALS: import('./types').AgentReferral[] = [
  { id: 'ref-1', student_name: 'Amara Okafor', university_target: 'University of Toronto', loan_status: 'repaying', loan_amount: 15500, commission_earned: 1000, commission_status: 'paid', referred_at: '2025-11-10T00:00:00Z' },
  { id: 'ref-2', student_name: 'Jean-Pierre Dubois', university_target: 'McGill University', loan_status: 'under_review', loan_amount: 18500, commission_earned: 1000, commission_status: 'pending', referred_at: '2026-03-20T00:00:00Z' },
  { id: 'ref-3', student_name: 'Fatima Al-Rashid', university_target: 'Conestoga College', loan_status: 'rejected', commission_earned: 0, commission_status: 'paid', referred_at: '2026-03-25T00:00:00Z' },
  { id: 'ref-4', student_name: 'Priya Sharma', university_target: 'University of British Columbia', loan_status: 'under_review', loan_amount: 12000, commission_earned: 1000, commission_status: 'pending', referred_at: '2026-03-22T00:00:00Z' },
];
