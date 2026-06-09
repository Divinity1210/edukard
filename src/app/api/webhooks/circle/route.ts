import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAllowedSnsUrl, verifySnsMessage, verifyWebhookSecret } from "@/lib/integrations/circle";

/**
 * Circle webhook — USDC transfer lifecycle (deposits, disbursements,
 * settlements). Delivered via AWS SNS.
 *
 * Security (refuse-by-default):
 *   1. Every envelope must carry a valid AWS SNS X.509 signature.
 *   2. The SubscribeURL/SigningCertURL must be a real AWS SNS host (SSRF guard).
 *   3. Optional shared-secret header (CIRCLE_WEBHOOK_SECRET) as defence-in-depth.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // 1. Authenticate the SNS envelope before doing ANYTHING with its contents.
    const signed = await verifySnsMessage(body);
    if (!signed) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Optional defence-in-depth shared secret, enforced only when configured.
    if (process.env.CIRCLE_WEBHOOK_SECRET) {
      if (!verifyWebhookSecret(req.headers.get("x-circle-secret"))) {
        return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
      }
    }

    // 3. SNS subscription handshake — only confirm an allow-listed AWS URL.
    if (body.Type === "SubscriptionConfirmation" && body.SubscribeURL) {
      if (!isAllowedSnsUrl(body.SubscribeURL)) {
        return NextResponse.json({ error: "Disallowed SubscribeURL" }, { status: 400 });
      }
      await fetch(body.SubscribeURL);
      return NextResponse.json({ status: "subscribed" });
    }

    if (body.Type === "Notification") {
      const message = JSON.parse(body.Message);
      const supabase = createAdminClient();

      if (message.notificationType === "transfers" && message.transfer) {
        const transfer = message.transfer;
        const status = transfer.status; // complete | failed | pending

        // Reconcile investor deposits keyed by circle_transfer_id.
        if (status === "complete") {
          await supabase
            .from("deposits")
            .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
            .eq("circle_transfer_id", transfer.id);
        } else if (status === "failed") {
          await supabase.from("deposits").update({ status: "failed" }).eq("circle_transfer_id", transfer.id);
        }

        await supabase.from("audit_logs").insert({
          action: `circle.transfer.${status}`,
          entity_type: "transfer",
          entity_id: transfer.id,
          details: { amount: transfer.amount, source: transfer.source, destination: transfer.destination },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("Circle webhook error:", message);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
