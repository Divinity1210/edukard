import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSecret } from "@/lib/integrations/circle";

/**
 * Circle webhook — USDC transfer lifecycle (deposits, disbursements,
 * settlements). Delivered via AWS SNS.
 *
 * Pilot security: a shared-secret header (CIRCLE_WEBHOOK_SECRET) gates the
 * endpoint. Before mainnet, replace with SNS X.509 cert signature verification.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // SNS subscription handshake.
    if (body.Type === "SubscriptionConfirmation" && body.SubscribeURL) {
      await fetch(body.SubscribeURL);
      return NextResponse.json({ status: "subscribed" });
    }

    if (process.env.CIRCLE_WEBHOOK_SECRET) {
      const headerSecret = req.headers.get("x-circle-secret");
      if (!verifyWebhookSecret(headerSecret)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
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
