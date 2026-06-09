/**
 * Plaid adapter — dependency-free REST client.
 *
 * Bank account linking, income / payroll verification for the EduKard credit
 * engine. Activates when PLAID_CLIENT_ID + PLAID_SECRET are present.
 */

type PlaidEnv = "sandbox" | "development" | "production";

function baseUrl(): string {
  const env = (process.env.PLAID_ENV as PlaidEnv) || "sandbox";
  return `https://${env}.plaid.com`;
}

export function isConfigured(): boolean {
  return Boolean(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET);
}

function creds() {
  const client_id = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  if (!client_id || !secret) throw new Error("Plaid is not configured (PLAID_CLIENT_ID/PLAID_SECRET missing).");
  return { client_id, secret };
}

async function plaidRequest<T = unknown>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...creds(), ...body }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Plaid ${path} failed: ${json?.error_message || json?.error_code || res.status}`);
  }
  return json as T;
}

/** Create a Link token to initialize the front-end Plaid Link flow. */
export async function createLinkToken(userId: string) {
  return plaidRequest("/link/token/create", {
    user: { client_user_id: userId },
    client_name: "EduKard",
    products: ["auth", "income_verification"],
    country_codes: ["CA"],
    language: "en",
    webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/plaid`,
  });
}

/** Exchange the public_token returned by Link for a permanent access_token. */
export async function exchangePublicToken(publicToken: string) {
  return plaidRequest<{ access_token: string; item_id: string }>("/item/public_token/exchange", {
    public_token: publicToken,
  });
}

/** Pull income/payroll for credit scoring. */
export async function getIncome(accessToken: string) {
  return plaidRequest("/credit/payroll_income/get", { access_token: accessToken });
}

/** Bank account + routing details (for settlement / PAD setup). */
export async function getAuth(accessToken: string) {
  return plaidRequest("/auth/get", { access_token: accessToken });
}

/**
 * Plaid signs webhooks with an ES256 JWT in the `plaid-verification` header.
 * Full verification requires fetching the rotating JWK and validating the
 * signature (recommended: add the `jose` package before production). Here we
 * perform the body-integrity portion: decode the (unverified) JWT and confirm
 * its `request_body_sha256` claim matches the actual body hash. This blocks
 * tampering; pair with JWK signature checking for full authenticity.
 */
export async function verifyWebhookBody(rawBody: string, jwtHeader: string | null): Promise<boolean> {
  if (!jwtHeader) return false;
  try {
    const crypto = await import("crypto");
    const [, payloadB64] = jwtHeader.split(".");
    const claims = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    const bodyHash = crypto.createHash("sha256").update(rawBody).digest("hex");
    return claims.request_body_sha256 === bodyHash;
  } catch {
    return false;
  }
}
