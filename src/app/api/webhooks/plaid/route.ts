import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookBody } from "@/lib/integrations/plaid";

/**
 * Plaid webhook — item health + income/payroll verification readiness.
 * Body integrity is checked against the plaid-verification JWT claim.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const jwt = req.headers.get("plaid-verification");

    // When a JWT is present, verify the body hash matches its claim.
    if (jwt) {
      const ok = await verifyWebhookBody(rawBody, jwt);
      if (!ok) return NextResponse.json({ error: "Body verification failed" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { webhook_type, webhook_code, item_id, error } = body;
    const supabase = createAdminClient();

    if (error) {
      console.error("Plaid webhook error details:", error);
    }

    if (webhook_type === "ITEM") {
      if (webhook_code === "ERROR" || webhook_code === "PENDING_EXPIRATION") {
        await supabase
          .from("plaid_items")
          .update({ status: webhook_code === "ERROR" ? "error" : "pending_expiration" })
          .eq("item_id", item_id);
      }
    } else if (webhook_type === "INCOME" && webhook_code === "INCOME_VERIFICATION") {
      await supabase.from("audit_logs").insert({
        action: "plaid.income_verification_ready",
        entity_type: "plaid_item",
        entity_id: item_id,
        details: { webhook_code },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("Plaid webhook error:", message);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
