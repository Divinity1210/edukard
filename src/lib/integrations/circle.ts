/**
 * Circle adapter — USDC custodial wallets + payouts (the "blockchain layer").
 *
 * Chosen for the pilot because Circle's sandbox is free and requires no
 * smart-contract deployment, audit, or gas management: fiat <-> USDC and
 * on-chain settlement are handled through Circle's programmable wallets API.
 * Activates when CIRCLE_API_KEY is present.
 */

function baseUrl(): string {
  const env = process.env.CIRCLE_ENV === "production" ? "api" : "api-sandbox";
  return `https://${env}.circle.com`;
}

export function isConfigured(): boolean {
  return Boolean(process.env.CIRCLE_API_KEY);
}

function apiKey(): string {
  const key = process.env.CIRCLE_API_KEY;
  if (!key) throw new Error("Circle is not configured (CIRCLE_API_KEY missing).");
  return key;
}

async function circleRequest<T = unknown>(
  path: string,
  method: "GET" | "POST",
  body?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Circle ${method} ${path} failed: ${json?.message || res.status}`);
  }
  return json as T;
}

/** Provision a custodial wallet for an investor or university. */
export async function createWallet(idempotencyKey: string, description: string) {
  return circleRequest("/v1/wallets", "POST", { idempotencyKey, description });
}

/** Get current USDC balance for a wallet. */
export async function getWalletBalance(walletId: string) {
  return circleRequest(`/v1/wallets/${walletId}`, "GET");
}

/**
 * Move USDC from the protocol treasury wallet to a destination wallet —
 * used for tuition disbursement to a university and for yield distribution.
 */
export async function createTransfer(args: {
  idempotencyKey: string;
  sourceWalletId: string;
  destinationWalletId: string;
  amountUsd: string; // decimal string, e.g. "10000.00"
}) {
  return circleRequest("/v1/transfers", "POST", {
    idempotencyKey: args.idempotencyKey,
    source: { type: "wallet", id: args.sourceWalletId },
    destination: { type: "wallet", id: args.destinationWalletId },
    amount: { amount: args.amountUsd, currency: "USD" },
  });
}

export async function getTransfer(transferId: string) {
  return circleRequest(`/v1/transfers/${transferId}`, "GET");
}

/**
 * Circle delivers webhooks via AWS SNS and signs the message with an X.509
 * cert referenced by `SigningCertURL`. Production verification should fetch
 * that cert and verify the RSA-SHA1 signature over the canonical SNS string.
 * For the pilot we expose a shared-secret HMAC fallback (CIRCLE_WEBHOOK_SECRET)
 * so the endpoint can be locked down immediately; swap in cert verification
 * when going live on mainnet.
 */
export function verifyWebhookSecret(headerSecret: string | null): boolean {
  const secret = process.env.CIRCLE_WEBHOOK_SECRET;
  if (!secret) return false;
  return headerSecret === secret;
}
