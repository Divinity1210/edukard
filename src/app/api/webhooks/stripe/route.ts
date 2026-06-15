import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { constructEvent } from "@/lib/integrations/stripe";

/**
 * Stripe webhook — repayment (PAD/ACSS) lifecycle.
 * Signature is verified with the platform secret (no Stripe SDK required).
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      // Refuse to process unsigned events in any environment with no secret.
      return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 503 });
    }

    let event;
    try {
      event = constructEvent(rawBody, signature);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const obj = event.data?.object ?? {};
    const loanId = obj.metadata?.loan_id as string | undefined;
    const paymentNumber = obj.metadata?.payment_number
      ? Number(obj.metadata.payment_number)
      : undefined;

    switch (event.type) {
      case "payment_intent.succeeded": {
        if (loanId && paymentNumber) {
          await supabase
            .from("repayment_schedules")
            .update({ status: "completed", paid_at: new Date().toISOString(), stripe_payment_intent_id: obj.id })
            .eq("loan_id", loanId)
            .eq("payment_number", paymentNumber);
        }
        await supabase.from("audit_logs").insert({
          action: "payment.succeeded",
          entity_type: "loan",
          entity_id: loanId ?? obj.id,
          details: { amount: obj.amount, currency: obj.currency, payment_number: paymentNumber },
        });
        break;
      }
      case "payment_intent.payment_failed": {
        if (loanId && paymentNumber) {
          await supabase
            .from("repayment_schedules")
            .update({ status: "late" })
            .eq("loan_id", loanId)
            .eq("payment_number", paymentNumber);
        }
        await supabase.from("audit_logs").insert({
          action: "payment.failed",
          entity_type: "loan",
          entity_id: loanId ?? obj.id,
          details: { reason: obj.last_payment_error?.message ?? null, payment_number: paymentNumber },
        });
        break;
      }
      case "setup_intent.succeeded": {
        await supabase.from("audit_logs").insert({
          action: "pad_mandate.created",
          entity_type: "loan",
          entity_id: loanId ?? obj.id,
          details: { customer: obj.customer, payment_method: obj.payment_method },
        });
        break;
      }
      default:
        // Acknowledge unhandled events so Stripe stops retrying.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("Stripe webhook error:", message);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
