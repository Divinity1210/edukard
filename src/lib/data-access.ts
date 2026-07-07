import { createClient } from "./supabase/server";

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  
  return profile;
}

export async function getStudentLoan(userId: string) {
  const supabase = await createClient();
  
  const { data: loan } = await supabase
    .from("loan_applications")
    .select(`
      *,
      university:universities(name)
    `)
    .eq("user_id", userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  return loan;
}

export async function getRepaymentSchedule(loanId: string) {
  const supabase = await createClient();
  
  const { data: schedule } = await supabase
    .from("repayment_schedules")
    .select("*")
    .eq("loan_id", loanId)
    .order('payment_number', { ascending: true });
    
  return schedule || [];
}

export async function getPayrollConnections(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("plaid_items")
    .select("institution_name, institution_id, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getCreditAssessment(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("credit_assessments")
    .select("*")
    .eq("user_id", userId)
    .order("assessed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getStudentStats(userId: string) {
  const loan = await getStudentLoan(userId);
  if (!loan) return null;
  
  const schedule = await getRepaymentSchedule(loan.id);
  
  const totalPaid = schedule
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.total_payment), 0);
    
  const remainingBalance = schedule
    .filter(p => p.status !== 'completed')
    .reduce((sum, p) => sum + Number(p.total_payment), 0);
    
  const nextPayment = schedule.find(p => p.status === 'scheduled');
  
  return {
    total_borrowed: Number(loan.loan_amount),
    total_paid: totalPaid,
    remaining_balance: remainingBalance,
    next_payment_date: nextPayment?.due_date || null,
    next_payment_amount: nextPayment ? Number(nextPayment.total_payment) : 0,
    loan_status: loan.status
  };
}

// ===== INVESTOR FUNCTIONS =====

export async function getInvestorProfile(userId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("investor_profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return profile;
}

export async function getInvestments(userId: string) {
  const supabase = await createClient();
  const { data: investments } = await supabase
    .from("investments")
    .select("*")
    .eq("investor_id", userId)
    .order("invested_at", { ascending: false });
  return investments || [];
}

export async function getDeposits(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deposits")
    .select("*")
    .eq("investor_id", userId)
    .order("initiated_at", { ascending: false });
  return data || [];
}

export async function getLiquidityPools() {
  const supabase = await createClient();
  const { data: pools } = await supabase
    .from("liquidity_pools")
    .select("*");
  return pools || [];
}

export async function getInvestorStats(userId: string) {
  const profile = await getInvestorProfile(userId);
  const investments = await getInvestments(userId);
  
  if (!profile) return null;

  const totalInvested = Number(profile.total_invested) || 0;
  const totalYield = Number(profile.total_yield_earned) || 0;
  const portfolioValue = totalInvested + totalYield;
  
  const seniorAllocation = investments
    .filter(i => i.tranche === "senior" && i.status === "active")
    .reduce((sum, i) => sum + Number(i.principal), 0);
    
  const juniorAllocation = investments
    .filter(i => i.tranche === "junior" && i.status === "active")
    .reduce((sum, i) => sum + Number(i.principal), 0);
    
  // Calculate weighted APY
  let weightedApy = 0;
  if (totalInvested > 0) {
    const totalYieldPotential = investments
      .filter(i => i.status === "active")
      .reduce((sum, i) => sum + (Number(i.principal) * (Number(i.target_apy) / 100)), 0);
    weightedApy = (totalYieldPotential / totalInvested) * 100;
  }

  return {
    total_invested: totalInvested,
    total_yield: totalYield,
    portfolio_value: portfolioValue,
    senior_allocation: seniorAllocation,
    junior_allocation: juniorAllocation,
    weighted_apy: weightedApy
  };
}

// ===== UNIVERSITY FUNCTIONS =====

// We'll get the first university for demonstration purposes since 
// user <-> university mapping isn't fully defined in the schema yet.
export async function getUniversityContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Prefer the university linked to the logged-in bursar's profile.
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("university_id")
      .eq("id", user.id)
      .single();
    if (profile?.university_id) {
      const { data: uni } = await supabase
        .from("universities")
        .select("*")
        .eq("id", profile.university_id)
        .single();
      if (uni) return uni;
    }
  }

  // Fallback (demo / unlinked): first university.
  const { data: uni } = await supabase
    .from("universities")
    .select("*")
    .limit(1)
    .single();
  return uni;
}

export async function getUniversityInvoices(universityId: string) {
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("university_invoices")
    .select("*")
    .eq("university_id", universityId)
    .order("uploaded_at", { ascending: false });
  return invoices || [];
}

export async function getUniversitySettlements(universityId: string) {
  const supabase = await createClient();
  const { data: settlements } = await supabase
    .from("university_settlements")
    .select("*")
    .eq("university_id", universityId)
    .order("date", { ascending: false });
  return settlements || [];
}

export async function getUniversityStats(universityId: string) {
  const invoices = await getUniversityInvoices(universityId);
  const settlements = await getUniversitySettlements(universityId);
  
  const totalStudents = new Set(invoices.map(i => i.student_id_number)).size;
  const totalDisbursed = settlements
    .filter(s => s.status === "completed")
    .reduce((sum, s) => sum + Number(s.amount), 0);
  const pendingInvoicesCount = invoices.filter(i => i.status !== "settled").length;
  const settlementsProcessingCount = settlements.filter(s => s.status === "processing").length;
  
  return {
    total_students: totalStudents,
    total_disbursed: totalDisbursed,
    pending_invoices: pendingInvoicesCount,
    settlements_processing: settlementsProcessingCount,
  };
}

// ===== AGENT FUNCTIONS =====

export async function getAgentProfile(userId: string) {
  const supabase = await createClient();
  // agent_profiles shares its primary key with profiles.id (1:1).
  const { data: agentProfile } = await supabase
    .from("agent_profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return agentProfile;
}

export async function getAgentReferrals(agentId: string) {
  const supabase = await createClient();
  const { data: referrals } = await supabase
    .from("agent_referrals")
    .select("*")
    .eq("agent_id", agentId)
    .order("referred_at", { ascending: false });
  return referrals || [];
}

export async function getAgentStats(agentId: string) {
  const referrals = await getAgentReferrals(agentId);
  
  const totalReferrals = referrals.length;
  const activeLoans = referrals.filter(r => 
    ["approved", "disbursed", "repaying"].includes(r.loan_status)
  ).length;
  const totalCommission = referrals
    .filter(r => r.commission_status === "paid")
    .reduce((sum, r) => sum + Number(r.commission_earned), 0);
  const pendingCommission = referrals
    .filter(r => r.commission_status === "pending")
    .reduce((sum, r) => sum + Number(r.commission_earned), 0);

  return {
    total_referrals: totalReferrals,
    active_loans: activeLoans,
    total_commission: totalCommission,
    pending_commission: pendingCommission
  };
}

// ===== ADMIN FUNCTIONS =====

export async function getAdminStats() {
  const supabase = await createClient();

  // Loans live in `loan_applications`; investments use `principal`.
  const { data: loans } = await supabase.from("loan_applications").select("*");
  const { data: investments } = await supabase.from("investments").select("*");

  const pendingApplications = loans?.filter(l => l.status === "submitted" || l.status === "under_review").length || 0;
  const activeLoans = loans?.filter(l => ["approved", "disbursed", "repaying"].includes(l.status)).length || 0;

  const totalDisbursed = loans?.filter(l => ["disbursed", "repaying", "paid_off"].includes(l.status))
    .reduce((sum, l) => sum + Number(l.loan_amount), 0) || 0;

  const defaultedCount = loans?.filter(l => l.status === "defaulted").length || 0;
  const defaultRate = (loans && loans.length > 0) ? (defaultedCount / loans.length) * 100 : 0;

  const totalTvl = investments
    ?.filter(i => i.status === "active")
    .reduce((sum, i) => sum + Number(i.principal), 0) || 0;
  const poolUtilization = totalTvl > 0 ? (totalDisbursed / totalTvl) * 100 : 0;

  return {
    pending_applications: pendingApplications,
    active_loans: activeLoans,
    total_disbursed: totalDisbursed,
    default_rate: defaultRate,
    pool_utilization: poolUtilization,
    total_tvl: totalTvl
  };
}

export async function getAdminPendingLoans() {
  const supabase = await createClient();
  const { data: loans } = await supabase
    .from("loan_applications")
    .select("*, profiles:user_id(full_name), university:universities(name)")
    .in("status", ["submitted", "under_review"])
    .order("created_at", { ascending: false });

  return loans || [];
}

/**
 * Delinquent loans = loans that are formally defaulted OR have at least one
 * repayment installment in `late` status. Delinquency is tracked at the
 * installment level (repayment_schedules), not on the loan enum.
 */
export async function getAdminDelinquentLoans() {
  const supabase = await createClient();

  const { data: lateInstallments } = await supabase
    .from("repayment_schedules")
    .select("loan_id")
    .eq("status", "late");

  const lateLoanIds = Array.from(new Set((lateInstallments || []).map(r => r.loan_id)));

  const { data: loans } = await supabase
    .from("loan_applications")
    .select("*, profiles:user_id(full_name), university:universities(name)")
    .or(
      lateLoanIds.length > 0
        ? `status.eq.defaulted,id.in.(${lateLoanIds.join(",")})`
        : `status.eq.defaulted`
    )
    .order("created_at", { ascending: false });

  return loans || [];
}

/**
 * Full underwriting packet for a single application: loan + applicant profile +
 * credit assessment + payroll context + uploaded documents.
 */
export async function getUnderwritingDetail(loanId: string) {
  const supabase = await createClient();

  const { data: loan } = await supabase
    .from("loan_applications")
    .select("*, profiles:user_id(full_name, email, kyc_status), university:universities(name, province, city)")
    .eq("id", loanId)
    .single();

  if (!loan) return null;

  const { data: credit } = await supabase
    .from("credit_assessments")
    .select("*")
    .eq("user_id", loan.user_id)
    .order("assessed_at", { ascending: false })
    .limit(1)
    .single();

  const { data: plaid } = await supabase
    .from("plaid_items")
    .select("institution_name, status")
    .eq("user_id", loan.user_id);

  return { loan, credit: credit || null, payroll_connections: plaid || [] };
}

export async function getAdminAuditLogs(limit = 100) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("*, actor:actor_id(full_name, role)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getLoanCommunications(loanId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("communication_logs")
    .select("*")
    .eq("loan_id", loanId)
    .order("sent_at", { ascending: false });
  return data || [];
}

/**
 * Treasury view: pool capital/utilization plus live deployed totals derived from
 * loan + investment tables (so the dashboard reflects reality, not stored guesses).
 */
export async function getTreasuryData() {
  const supabase = await createClient();
  const pools = await getLiquidityPools();

  const { data: investments } = await supabase
    .from("investments")
    .select("tranche, principal, status");
  const { data: loans } = await supabase
    .from("loan_applications")
    .select("loan_amount, status");

  const trancheTotals = (tranche: "senior" | "junior") =>
    (investments || [])
      .filter(i => i.tranche === tranche && i.status === "active")
      .reduce((s, i) => s + Number(i.principal), 0);

  const deployed = (loans || [])
    .filter(l => ["disbursed", "repaying"].includes(l.status))
    .reduce((s, l) => s + Number(l.loan_amount), 0);

  const totalCapital = trancheTotals("senior") + trancheTotals("junior");

  return {
    pools,
    senior_capital: trancheTotals("senior"),
    junior_capital: trancheTotals("junior"),
    total_capital: totalCapital,
    deployed_capital: deployed,
    available_capital: Math.max(0, totalCapital - deployed),
    utilization_ratio: totalCapital > 0 ? (deployed / totalCapital) * 100 : 0,
  };
}

/**
 * Collections view: one entry per delinquent loan with overdue amount, days
 * late, derived stage, last contact date, and its communication history.
 * Delinquency is computed from repayment_schedules (late or past-due-scheduled).
 */
export async function getCollectionsAccounts() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Overdue installments: explicitly late, or scheduled with a due date in the past.
  const { data: overdue } = await supabase
    .from("repayment_schedules")
    .select("loan_id, due_date, total_payment, status")
    .or(`status.eq.late,and(status.eq.scheduled,due_date.lt.${today})`);

  // Group overdue installments by loan.
  const byLoan = new Map<string, { amount: number; oldestDue: string }>();
  for (const r of overdue || []) {
    const cur = byLoan.get(r.loan_id) || { amount: 0, oldestDue: r.due_date };
    cur.amount += Number(r.total_payment);
    if (r.due_date < cur.oldestDue) cur.oldestDue = r.due_date;
    byLoan.set(r.loan_id, cur);
  }

  // Include any defaulted loans even if no overdue rows remain.
  const { data: defaultedLoans } = await supabase
    .from("loan_applications")
    .select("id")
    .eq("status", "defaulted");
  for (const l of defaultedLoans || []) {
    if (!byLoan.has(l.id)) byLoan.set(l.id, { amount: 0, oldestDue: today });
  }

  const loanIds = Array.from(byLoan.keys());
  if (loanIds.length === 0) return { accounts: [], totalComms: 0 };

  const { data: loans } = await supabase
    .from("loan_applications")
    .select("id, status, profiles:user_id(full_name), university:universities(name)")
    .in("id", loanIds);

  const { data: comms } = await supabase
    .from("communication_logs")
    .select("*")
    .in("loan_id", loanIds)
    .order("sent_at", { ascending: false });

  const dayMs = 86400000;
  const accounts = (loans || []).map((loan) => {
    const agg = byLoan.get(loan.id)!;
    const daysLate = Math.max(0, Math.floor((Date.now() - new Date(agg.oldestDue).getTime()) / dayMs));
    const accComms = (comms || []).filter((c) => c.loan_id === loan.id);
    const status =
      loan.status === "defaulted"
        ? "default"
        : daysLate > 90
        ? "default"
        : daysLate > 60
        ? "61_90_late"
        : daysLate > 30
        ? "31_60_late"
        : "1_30_late";
    // Supabase returns joined to-one relations as objects (typed loosely here).
    const profileRel = loan.profiles as unknown as { full_name?: string } | null;
    const uniRel = loan.university as unknown as { name?: string } | null;
    return {
      loan_id: loan.id,
      borrower: profileRel?.full_name || "Unknown borrower",
      university: uniRel?.name || "—",
      amount_overdue: Math.round(agg.amount * 100) / 100,
      days_late: daysLate,
      last_contact: accComms[0]?.sent_at ? accComms[0].sent_at.split("T")[0] : "Never",
      status,
      comms: accComms,
    };
  });

  const totalComms = (comms || []).length;
  return { accounts, totalComms };
}

/** Aggregate, anonymized protocol stats for the investor transparency page. */
export async function getProtocolStats() {
  const supabase = await createClient();
  const { data: loans } = await supabase
    .from("loan_applications")
    .select("loan_amount, status, university:universities(name)");
  const { data: credits } = await supabase
    .from("credit_assessments")
    .select("edukard_score, dti_ratio, monthly_income");

  const allLoans = loans || [];
  const activeStatuses = ["disbursed", "repaying"];
  const activeLoans = allLoans.filter((l) => activeStatuses.includes(l.status)).length;
  const defaulted = allLoans.filter((l) => l.status === "defaulted").length;
  const decided = allLoans.filter((l) => ["disbursed", "repaying", "paid_off", "defaulted"].includes(l.status)).length;
  const defaultRate = decided > 0 ? (defaulted / decided) * 100 : 0;

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const avgScore = avg((credits || []).map((c) => Number(c.edukard_score)));
  const avgDti = avg((credits || []).map((c) => Number(c.dti_ratio)));
  const avgIncome = avg((credits || []).map((c) => Number(c.monthly_income)));

  // University distribution among funded loans.
  const fundedLoans = allLoans.filter((l) => activeStatuses.includes(l.status) || l.status === "paid_off");
  const counts = new Map<string, number>();
  for (const l of fundedLoans) {
    const name = (l.university as unknown as { name?: string } | null)?.name || "Other Institutions";
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  const total = fundedLoans.length || 1;
  const distribution = Array.from(counts.entries())
    .map(([name, n]) => ({ name, loans: n, pct: Math.round((n / total) * 1000) / 10 }))
    .sort((a, b) => b.loans - a.loans)
    .slice(0, 6);

  return {
    active_loans: activeLoans,
    default_rate: Math.round(defaultRate * 10) / 10,
    avg_score: Math.round(avgScore),
    avg_dti: Math.round(avgDti * 10) / 10,
    avg_income: Math.round(avgIncome),
    distribution,
  };
}

export async function getNotifications(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return data || [];
}

// ===== ADMIN: PARTNER MANAGEMENT =====

export async function getAdminUniversities() {
  const supabase = await createClient();
  const [{ data: unis }, { data: loans }] = await Promise.all([
    supabase
      .from("universities")
      .select("id, name, dli_number, province, city, contact_email, status, created_at")
      .order("name"),
    supabase
      .from("loan_applications")
      .select("university_id, loan_amount, status")
      .in("status", ["disbursing", "disbursed", "repaying", "paid_off"]),
  ]);

  const funded = new Map<string, { count: number; total: number }>();
  for (const loan of loans || []) {
    const agg = funded.get(loan.university_id) || { count: 0, total: 0 };
    agg.count += 1;
    agg.total += Number(loan.loan_amount) || 0;
    funded.set(loan.university_id, agg);
  }

  return (unis || []).map((u) => ({
    ...u,
    students_funded: funded.get(u.id)?.count ?? 0,
    total_disbursed: funded.get(u.id)?.total ?? 0,
  }));
}

export async function getAdminAgents() {
  const supabase = await createClient();
  const [{ data: agents }, { data: referrals }] = await Promise.all([
    supabase
      .from("agent_profiles")
      .select("id, company_name, territory, commission_rate, referral_code, created_at, profile:profiles(full_name, email)")
      .order("created_at", { ascending: false }),
    supabase.from("agent_referrals").select("agent_id, commission_earned, commission_status"),
  ]);

  const stats = new Map<string, { referrals: number; earned: number }>();
  for (const r of referrals || []) {
    const agg = stats.get(r.agent_id) || { referrals: 0, earned: 0 };
    agg.referrals += 1;
    if (r.commission_status === "paid") {
      agg.earned += Number(r.commission_earned) || 0;
    }
    stats.set(r.agent_id, agg);
  }

  return (agents || []).map((a) => ({
    ...a,
    total_referrals: stats.get(a.id)?.referrals ?? 0,
    total_earned: stats.get(a.id)?.earned ?? 0,
  }));
}

/** Origination kill-switch state. Reads fail open (not paused) — enforcement
 *  happens in submitLoanApplication, which re-reads it. */
export async function getOriginationsPaused(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("protocol_settings")
    .select("originations_paused")
    .eq("id", 1)
    .maybeSingle();
  return data?.originations_paused ?? false;
}
