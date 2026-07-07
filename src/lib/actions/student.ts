"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  calculateMonthlyPayment,
  calculateTotalCost,
  calculateEduKardScore,
  calculateAmortization,
} from "@/lib/calculations";

const ApplicationSchema = z.object({
  // Accepts either a university UUID or a front-end slug (e.g. "uoft").
  universityRef: z.string().min(1),
  studentIdNumber: z.string().min(1).max(64),
  tuitionAmount: z.coerce.number().positive().max(200_000),
  loanAmount: z.coerce.number().positive().max(50_000),
  termMonths: z.coerce.number().int().refine((v) => [12, 18, 24, 36].includes(v), "Invalid term"),
  monthlyIncome: z.coerce.number().nonnegative().optional(),
  employmentMonths: z.coerce.number().int().nonnegative().optional(),
});

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Base APR by risk band (annual %). Capped well under provincial limits. */
function aprForRisk(flag: "green" | "yellow" | "red"): number {
  return flag === "green" ? 9.9 : flag === "yellow" ? 13.9 : 17.9;
}

export async function submitLoanApplication(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = ApplicationSchema.safeParse({
    universityRef: formData.get("universityId") ?? formData.get("universityRef"),
    studentIdNumber: formData.get("studentIdNumber"),
    tuitionAmount: formData.get("tuitionAmount"),
    loanAmount: formData.get("loanAmount"),
    termMonths: formData.get("termMonths"),
    monthlyIncome: formData.get("monthlyIncome") ?? undefined,
    employmentMonths: formData.get("employmentMonths") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid application data" };
  }
  const input = parsed.data;

  // Origination kill-switch (admin/treasury). Checked server-side so it can't
  // be bypassed by a stale client.
  const { data: settings } = await supabase
    .from("protocol_settings")
    .select("originations_paused")
    .eq("id", 1)
    .maybeSingle();
  if (settings?.originations_paused) {
    return { error: "New loan originations are temporarily paused. Please try again later." };
  }

  // Resolve university by UUID or slug. Only active partners accept new loans.
  const uniQuery = supabase.from("universities").select("id").eq("status", "active").limit(1);
  const { data: uni } = UUID_RE.test(input.universityRef)
    ? await uniQuery.eq("id", input.universityRef).single()
    : await uniQuery.eq("slug", input.universityRef).single();

  if (!uni) return { error: "Selected university not found or not currently accepting EduKard financing" };

  // Credit decision. Pull the latest assessment if present, else use any
  // income figures supplied on the form (from Plaid-backed onboarding).
  const { data: assessment } = await supabase
    .from("credit_assessments")
    .select("*")
    .eq("user_id", user.id)
    .order("assessed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const monthlyIncome = assessment?.monthly_income ?? input.monthlyIncome ?? 0;
  const employmentMonths = assessment?.employment_months ?? input.employmentMonths ?? 0;

  const score = calculateEduKardScore({
    monthlyIncome,
    employmentMonths,
    requestedAmount: input.loanAmount,
    termMonths: input.termMonths,
  });

  const apr = aprForRisk(score.riskFlag);
  const monthlyPayment = calculateMonthlyPayment(input.loanAmount, apr, input.termMonths);
  const totalCost = calculateTotalCost(input.loanAmount, apr, input.termMonths);

  const { data: loan, error } = await supabase
    .from("loan_applications")
    .insert({
      user_id: user.id,
      university_id: uni.id,
      student_id_number: input.studentIdNumber,
      tuition_amount: input.tuitionAmount,
      loan_amount: input.loanAmount,
      apr,
      term_months: input.termMonths,
      monthly_payment: monthlyPayment,
      total_cost: totalCost,
      status: "submitted",
      risk_flag: score.riskFlag,
    })
    .select()
    .single();

  if (error) {
    console.error("Error submitting loan:", error.message);
    return { error: error.message };
  }

  // Persist the credit snapshot used for this decision.
  await supabase.from("credit_assessments").insert({
    user_id: user.id,
    monthly_income: monthlyIncome,
    dti_ratio: monthlyIncome > 0 ? Math.round((monthlyPayment / monthlyIncome) * 10000) / 100 : 100,
    edukard_score: score.score,
    approved_limit: score.approvedLimit,
    employment_months: employmentMonths,
    risk_flag: score.riskFlag,
  });

  // Generate the repayment schedule up-front (becomes active on disbursement).
  const schedule = calculateAmortization(input.loanAmount, apr, input.termMonths);
  await supabase.from("repayment_schedules").insert(
    schedule.map((row) => ({
      loan_id: loan.id,
      payment_number: row.payment_number,
      due_date: row.date,
      principal: row.principal,
      interest: row.interest,
      total_payment: row.payment,
      remaining_balance: row.balance,
      status: "scheduled",
    }))
  );

  revalidatePath("/student/dashboard");
  revalidatePath("/student/application-status");
  return { success: true, loanId: loan.id, riskFlag: score.riskFlag, apr };
}
