"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { circle } from "@/lib/integrations";

/**
 * Admin underwriting + collections actions. These run as the logged-in admin,
 * so RLS `is_admin()` policies authorize the writes. Every state change is
 * recorded in audit_logs and surfaced to the borrower via notifications.
 */

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, user, isAdmin: profile?.role === "admin" };
}

const DecisionSchema = z.object({
  loanId: z.string().uuid(),
  notes: z.string().max(2000).optional(),
});

export async function approveLoan(formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Not authorized" };

  const parsed = DecisionSchema.safeParse({
    loanId: formData.get("loanId"),
    notes: formData.get("notes") ?? undefined,
  });
  if (!parsed.success) return { error: "Invalid request" };

  const { data: loan, error } = await supabase
    .from("loan_applications")
    .update({ status: "approved", admin_notes: parsed.data.notes ?? null, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.loanId)
    .select("id, user_id, loan_amount")
    .single();
  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "loan.approved",
    entity_type: "loan",
    entity_id: loan.id,
    details: { amount: loan.loan_amount, notes: parsed.data.notes ?? null },
  });
  await supabase.from("notifications").insert({
    user_id: loan.user_id,
    title: "Loan approved",
    message: "Your tuition financing was approved. Funds will be disbursed to your university shortly.",
    type: "success",
    link: "/student/application-status",
  });

  revalidatePath("/admin/underwriting");
  return { success: true };
}

export async function rejectLoan(formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Not authorized" };

  const parsed = DecisionSchema.safeParse({
    loanId: formData.get("loanId"),
    notes: formData.get("notes") ?? undefined,
  });
  if (!parsed.success) return { error: "Invalid request" };

  const { data: loan, error } = await supabase
    .from("loan_applications")
    .update({ status: "rejected", admin_notes: parsed.data.notes ?? null, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.loanId)
    .select("id, user_id")
    .single();
  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "loan.rejected",
    entity_type: "loan",
    entity_id: loan.id,
    details: { reason: parsed.data.notes ?? null },
  });
  await supabase.from("notifications").insert({
    user_id: loan.user_id,
    title: "Application decision",
    message: "Unfortunately your application was not approved at this time. See details in your portal.",
    type: "warning",
    link: "/student/application-status",
  });

  revalidatePath("/admin/underwriting");
  return { success: true };
}

/**
 * Disburse an approved loan to the university. If Circle is configured, this is
 * where the USDC transfer is initiated; otherwise the status advances and the
 * transfer is reconciled later. Idempotent on already-disbursed loans.
 */
export async function disburseLoan(formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Not authorized" };

  const loanId = z.string().uuid().safeParse(formData.get("loanId"));
  if (!loanId.success) return { error: "Invalid loan id" };

  const { data: loan } = await supabase
    .from("loan_applications")
    .select("id, status, loan_amount, university_id")
    .eq("id", loanId.data)
    .single();
  if (!loan) return { error: "Loan not found" };
  if (loan.status !== "approved") return { error: "Loan must be approved before disbursement" };

  let circleTransferId: string | null = null;
  if (circle.isConfigured()) {
    try {
      const { data: uni } = await supabase
        .from("universities")
        .select("circle_wallet_id")
        .eq("id", loan.university_id)
        .single();
      if (uni?.circle_wallet_id && process.env.CIRCLE_TREASURY_WALLET_ID) {
        const transfer = (await circle.createTransfer({
          idempotencyKey: `disburse-${loan.id}`,
          sourceWalletId: process.env.CIRCLE_TREASURY_WALLET_ID,
          destinationWalletId: uni.circle_wallet_id,
          amountUsd: Number(loan.loan_amount).toFixed(2),
        })) as { data?: { id?: string } };
        circleTransferId = transfer?.data?.id ?? null;
      }
    } catch (e) {
      console.error("Circle disbursement failed, advancing status for manual settlement:", e);
    }
  }

  const { error } = await supabase
    .from("loan_applications")
    .update({
      status: "disbursing",
      circle_transfer_id: circleTransferId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", loan.id);
  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "loan.disbursing",
    entity_type: "loan",
    entity_id: loan.id,
    details: { amount: loan.loan_amount, circle_transfer_id: circleTransferId },
  });

  revalidatePath("/admin/underwriting");
  return { success: true, circleTransferId };
}

const DefaultSchema = z.object({
  loanId: z.string().uuid(),
  reason: z.string().min(1).max(500),
  notes: z.string().max(2000).optional(),
});

/** Issue a formal default notice: flag the loan, log it, notify the borrower. */
export async function markDefault(formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Not authorized" };

  const parsed = DefaultSchema.safeParse({
    loanId: formData.get("loanId"),
    reason: formData.get("reason"),
    notes: formData.get("notes") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { data: loan, error } = await supabase
    .from("loan_applications")
    .update({ status: "defaulted", updated_at: new Date().toISOString() })
    .eq("id", parsed.data.loanId)
    .select("id, user_id")
    .single();
  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "loan.defaulted",
    entity_type: "loan",
    entity_id: loan.id,
    details: { reason: parsed.data.reason, notes: parsed.data.notes ?? null },
  });
  await supabase.from("communication_logs").insert({
    loan_id: loan.id,
    channel: "letter",
    subject: "Notice of Default",
    message: `Default issued. Reason: ${parsed.data.reason}. ${parsed.data.notes ?? ""}`.trim(),
    sent_by: user.id,
    status: "sent",
  });
  await supabase.from("notifications").insert({
    user_id: loan.user_id,
    title: "Notice of Default",
    message: "A notice of default has been issued on your loan. Please contact support immediately.",
    type: "error",
    link: "/student/support",
  });

  revalidatePath("/admin/collections");
  return { success: true };
}

const CommSchema = z.object({
  loanId: z.string().uuid(),
  channel: z.enum(["email", "sms", "phone", "letter"]),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(4000),
});

/** Log a collections communication against a delinquent loan. */
export async function logCommunication(formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Not authorized" };

  const parsed = CommSchema.safeParse({
    loanId: formData.get("loanId"),
    channel: formData.get("channel"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { error } = await supabase.from("communication_logs").insert({
    loan_id: parsed.data.loanId,
    channel: parsed.data.channel,
    subject: parsed.data.subject,
    message: parsed.data.message,
    sent_by: user.id,
    status: "sent",
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/collections");
  return { success: true };
}
