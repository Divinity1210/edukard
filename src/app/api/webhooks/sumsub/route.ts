import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhook } from "@/lib/integrations/sumsub";

/**
 * Sumsub KYC/KYB webhook.
 * Verifies the HMAC digest, then maps the review answer to the borrower's
 * kyc_status and writes an audit record.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const digest = req.headers.get("x-payload-digest");
    const alg = req.headers.get("x-payload-digest-alg");

    // Refuse-by-default: without a secret we cannot authenticate the payload,
    // so we never process it (prevents forged KYC approvals).
    if (!process.env.SUMSUB_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Sumsub webhook not configured" }, { status: 503 });
    }
    if (!verifyWebhook(rawBody, digest, alg)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    if (body.type === "applicantReviewed" && body.reviewResult) {
      const applicantId: string = body.applicantId;
      const answer: string = body.reviewResult.reviewAnswer; // GREEN | RED
      const supabase = createAdminClient();

      const newStatus = answer === "GREEN" ? "approved" : "rejected";

      const { data: updated } = await supabase
        .from("profiles")
        .update({ kyc_status: newStatus, updated_at: new Date().toISOString() })
        .eq("sumsub_applicant_id", applicantId)
        .select("id")
        .maybeSingle();

      await supabase.from("audit_logs").insert({
        actor_id: updated?.id ?? null,
        action: "kyc.reviewed",
        entity_type: "profile",
        entity_id: updated?.id ?? applicantId,
        details: { provider: "sumsub", answer, applicantId },
      });

      if (updated?.id) {
        await supabase.from("notifications").insert({
          user_id: updated.id,
          title: answer === "GREEN" ? "Identity verified" : "Verification needs attention",
          message:
            answer === "GREEN"
              ? "Your identity check passed. You can now apply for tuition financing."
              : "We couldn't verify your identity. Please review and resubmit your documents.",
          type: answer === "GREEN" ? "success" : "warning",
          link: answer === "GREEN" ? "/student/apply" : "/student/onboarding",
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("Sumsub webhook error:", message);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
