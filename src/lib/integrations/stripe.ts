import crypto from "crypto";

/**
 * Stripe adapter — dependency-free (uses the REST API directly via fetch).
 *
 * Payments + PAD (pre-authorized debit) for Canadian repayment collection.
 * Every method no-ops or throws a clear "not configured" error when STRIPE_SECRET_KEY
 * is absent, so the rest of the app keeps working before keys are added.
 */

const API_BASE = "https://api.stripe.com/v1";

export function isConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function requireKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
  return key;
}

/** Flatten nested params into Stripe's bracketed form-encoding. */
function encodeForm(params: Record<string, unknown>, prefix = ""): string[] {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object" && !Array.isArray(v)) {
      parts.push(...encodeForm(v as Record<string, unknown>, key));
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts;
}

async function stripeRequest<T = unknown>(
  path: string,
  method: "GET" | "POST",
  params: Record<string, unknown> = {}
): Promise<T> {
  const key = requireKey();
  const body = method === "POST" ? encodeForm(params).join("&") : undefined;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": "2024-06-20",
    },
    body,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Stripe ${method} ${path} failed: ${json?.error?.message || res.status}`);
  }
  return json as T;
}

/** Create or fetch a Stripe Customer for a borrower/investor. */
export async function createCustomer(email: string, name: string, metadata: Record<string, string> = {}) {
  return stripeRequest("/customers", "POST", { email, name, metadata });
}

/** Set up a Canadian PAD mandate (acss_debit) the student authorizes once. */
export async function createPadSetupIntent(customerId: string) {
  return stripeRequest("/setup_intents", "POST", {
    customer: customerId,
    payment_method_types: ["acss_debit"],
    payment_method_options: {
      acss_debit: { currency: "cad", mandate_options: { payment_schedule: "interval", interval_description: "Monthly tuition repayment", transaction_type: "personal" } },
    },
  });
}

/** Charge a scheduled monthly installment against the saved PAD method. */
export async function createInstallmentCharge(args: {
  customerId: string;
  paymentMethodId: string;
  amountCents: number;
  loanId: string;
  paymentNumber: number;
}) {
  return stripeRequest("/payment_intents", "POST", {
    amount: args.amountCents,
    currency: "cad",
    customer: args.customerId,
    payment_method: args.paymentMethodId,
    payment_method_types: ["acss_debit"],
    confirm: true,
    off_session: true,
    metadata: { loan_id: args.loanId, payment_number: args.paymentNumber },
  });
}

/**
 * Verify a Stripe webhook signature WITHOUT the Stripe SDK.
 * Implements the t=/v1= scheme: signed_payload = `${t}.${rawBody}`,
 * expected = HMAC-SHA256(secret, signed_payload).
 * Returns the parsed event on success, throws on failure.
 */
export function constructEvent(rawBody: string, sigHeader: string | null, toleranceSec = 300) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET not set.");
  if (!sigHeader) throw new Error("Missing stripe-signature header.");

  const parts = Object.fromEntries(
    sigHeader.split(",").map((p) => p.split("=").map((s) => s.trim()) as [string, string])
  );
  const timestamp = parts["t"];
  const v1 = parts["v1"];
  if (!timestamp || !v1) throw new Error("Malformed stripe-signature header.");

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("Stripe signature verification failed.");
  }

  const ageSec = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (ageSec > toleranceSec) throw new Error("Stripe webhook timestamp outside tolerance.");

  return JSON.parse(rawBody);
}
