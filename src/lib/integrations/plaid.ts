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
 * Fetch a Plaid webhook verification key (a public JWK) by its key id. Plaid
 * rotates these, so the `kid` from the JWT header tells us which to fetch.
 * Requires Plaid credentials (client_id/secret).
 */
async function getWebhookVerificationKey(keyId: string): Promise<JWK> {
  const json = await plaidRequest<{ key: JWK }>("/webhook_verification_key/get", { key_id: keyId });
  return json.key;
}

/**
 * Full Plaid webhook verification.
 *
 * Plaid signs each webhook with an ES256 JWT in the `plaid-verification` header.
 * Authenticity requires:
 *   1. Decode the JWT header to read `alg` (must be ES256) and `kid`.
 *   2. Fetch the matching public JWK from Plaid (rotating key).
 *   3. Verify the JWT signature with that key and reject tokens older than 5 min.
 *   4. Confirm the `request_body_sha256` claim equals the SHA-256 of the raw body
 *      (constant-time compare) so the payload can't be swapped after signing.
 *
 * Returns true only when every check passes. Never throws.
 */
export async function verifyWebhook(rawBody: string, jwtHeader: string | null): Promise<boolean> {
  if (!jwtHeader || !isConfigured()) return false;
  try {
    const { decodeProtectedHeader, importJWK, jwtVerify } = await import("jose");
    const crypto = await import("crypto");

    const header = decodeProtectedHeader(jwtHeader);
    if (header.alg !== "ES256" || !header.kid) return false;

    const jwk = await getWebhookVerificationKey(header.kid);
    const key = await importJWK(jwk, "ES256");

    // Verifies signature AND rejects tokens issued more than 5 minutes ago.
    const { payload } = await jwtVerify(jwtHeader, key, {
      algorithms: ["ES256"],
      maxTokenAge: "5 min",
    });

    const claimHash = String(payload.request_body_sha256 ?? "");
    const bodyHash = crypto.createHash("sha256").update(rawBody, "utf8").digest("hex");
    if (claimHash.length !== bodyHash.length) return false;
    return crypto.timingSafeEqual(Buffer.from(claimHash), Buffer.from(bodyHash));
  } catch {
    return false;
  }
}

type JWK = Record<string, unknown>;
