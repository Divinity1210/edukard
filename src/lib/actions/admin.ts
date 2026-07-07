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

// ===== PARTNER MANAGEMENT =====

const UniversitySchema = z.object({
  name: z.string().min(2).max(200),
  dliNumber: z.string().min(3).max(40),
  province: z.string().min(2).max(60),
  city: z.string().min(2).max(100),
  contactEmail: z.string().email(),
});

/** Onboard a partner university. Runs as the admin (RLS universities_admin_write). */
export async function addUniversity(formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Not authorized" };

  const parsed = UniversitySchema.safeParse({
    name: formData.get("name"),
    dliNumber: formData.get("dliNumber"),
    province: formData.get("province"),
    city: formData.get("city"),
    contactEmail: formData.get("contactEmail"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const slug = parsed.data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

  const { data: uni, error } = await supabase
    .from("universities")
    .insert({
      name: parsed.data.name,
      dli_number: parsed.data.dliNumber,
      province: parsed.data.province,
      city: parsed.data.city,
      contact_email: parsed.data.contactEmail,
      status: "pending",
      slug,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "partner.university_added",
    entity_type: "university",
    entity_id: uni.id,
    details: { name: parsed.data.name, dli: parsed.data.dliNumber },
  });

  revalidatePath("/admin/partners");
  return { success: true };
}

const UniversityStatusSchema = z.object({
  universityId: z.string().uuid(),
  status: z.enum(["active", "pending", "inactive"]),
});

export async function setUniversityStatus(formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Not authorized" };

  const parsed = UniversityStatusSchema.safeParse({
    universityId: formData.get("universityId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Invalid request" };

  const { error } = await supabase
    .from("universities")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.universityId);
  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "partner.university_status",
    entity_type: "university",
    entity_id: parsed.data.universityId,
    details: { status: parsed.data.status },
  });

  revalidatePath("/admin/partners");
  return { success: true };
}

const AgentSchema = z.object({
  companyName: z.string().min(2).max(200),
  contactName: z.string().min(2).max(120),
  email: z.string().email(),
  territory: z.string().min(2).max(100),
  commissionRate: z.coerce.number().min(0).max(25),
});

/**
 * Onboard a referral agent. Creates the auth user (service role — auth admin
 * API and cross-user profile write are not possible under RLS), assigns the
 * agent role, and generates a referral code. Returns a one-time temporary
 * password for the admin to hand to the partner.
 */
export async function addAgent(formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Not authorized" };

  const parsed = AgentSchema.safeParse({
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    territory: formData.get("territory"),
    commissionRate: formData.get("commissionRate") || 10,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const { randomBytes } = await import("node:crypto");
  const admin = createAdminClient();

  const tempPassword = randomBytes(9).toString("base64url");
  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.contactName },
  });
  if (authError || !created.user) return { error: authError?.message ?? "Could not create user" };
  const agentId = created.user.id;

  // Referral code: company initials + year + random suffix, e.g. GEP-2026-4F7K.
  const initials = parsed.data.companyName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
  const referralCode = `${initials}-${new Date().getFullYear()}-${randomBytes(2).toString("hex").toUpperCase()}`;

  // The on-signup trigger created a student profile row; promote + attach.
  const { error: roleError } = await admin.from("profiles").update({ role: "agent" }).eq("id", agentId);
  const { error: agentError } = await admin.from("agent_profiles").insert({
    id: agentId,
    company_name: parsed.data.companyName,
    territory: parsed.data.territory,
    commission_rate: parsed.data.commissionRate / 100,
    referral_code: referralCode,
  });
  if (roleError || agentError) {
    // Roll back the half-created account so the email isn't burned.
    await admin.auth.admin.deleteUser(agentId);
    return { error: (roleError ?? agentError)?.message ?? "Could not create agent profile" };
  }

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "partner.agent_added",
    entity_type: "agent",
    entity_id: agentId,
    details: { company: parsed.data.companyName, referral_code: referralCode },
  });

  revalidatePath("/admin/partners");
  return { success: true, referralCode, tempPassword, email: parsed.data.email };
}

// ===== PROTOCOL SETTINGS =====

/** Persist the origination kill-switch (admin-only via RLS). */
export async function setOriginationsPaused(formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Not authorized" };

  const paused = formData.get("paused") === "true";
  const { error } = await supabase
    .from("protocol_settings")
    .update({ originations_paused: paused, updated_by: user.id, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: paused ? "protocol.originations_paused" : "protocol.originations_resumed",
    entity_type: "protocol_settings",
    entity_id: "1",
    details: { paused },
  });

  revalidatePath("/admin/treasury");
  return { success: true, paused };
}
