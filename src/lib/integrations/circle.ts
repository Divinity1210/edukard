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

import crypto from "node:crypto";

type SnsMessage = Record<string, string | undefined>;

/**
 * Only ever fetch AWS-owned HTTPS URLs (the signing cert and the subscribe
 * confirmation). Without this guard, an attacker could POST a fake SNS envelope
 * whose `SigningCertURL`/`SubscribeURL` points at an internal address, turning
 * the webhook into an SSRF probe. Hostname must be an `sns.<region>.amazonaws.com`.
 */
export function isAllowedSnsUrl(raw: string | undefined | null): boolean {
  if (!raw) return false;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return false;
    return /^sns\.[a-z0-9-]+\.amazonaws\.com(\.cn)?$/.test(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Build the canonical string AWS signs, per the SNS message-signature spec:
 * specific fields, in alphabetical order, each as `key\nvalue\n`.
 */
function buildStringToSign(msg: SnsMessage): string | null {
  let keys: string[];
  if (msg.Type === "Notification") {
    keys =
      msg.Subject !== undefined
        ? ["Message", "MessageId", "Subject", "Timestamp", "TopicArn", "Type"]
        : ["Message", "MessageId", "Timestamp", "TopicArn", "Type"];
  } else if (msg.Type === "SubscriptionConfirmation" || msg.Type === "UnsubscribeConfirmation") {
    keys = ["Message", "MessageId", "SubscribeURL", "Timestamp", "Token", "TopicArn", "Type"];
  } else {
    return null;
  }
  let out = "";
  for (const k of keys) {
    const v = msg[k];
    if (v === undefined) return null;
    out += `${k}\n${v}\n`;
  }
  return out;
}

/**
 * Verify an AWS SNS message's X.509 signature. Fetches the (allow-listed)
 * signing certificate and checks the RSA signature over the canonical string.
 * SignatureVersion "1" = RSA-SHA1, "2" = RSA-SHA256. Never throws.
 */
export async function verifySnsMessage(msg: SnsMessage): Promise<boolean> {
  try {
    if (!isAllowedSnsUrl(msg.SigningCertURL)) return false;
    const stringToSign = buildStringToSign(msg);
    if (!stringToSign || !msg.Signature) return false;

    const res = await fetch(msg.SigningCertURL as string);
    if (!res.ok) return false;
    const pem = await res.text();

    const algorithm = msg.SignatureVersion === "2" ? "RSA-SHA256" : "RSA-SHA1";
    const verifier = crypto.createVerify(algorithm);
    verifier.update(stringToSign, "utf8");
    return verifier.verify(pem, msg.Signature, "base64");
  } catch {
    return false;
  }
}

/**
 * Optional defence-in-depth: a shared secret header you can configure in the
 * Circle/SNS delivery. Returns true only when configured AND matching.
 */
export function verifyWebhookSecret(headerSecret: string | null): boolean {
  const secret = process.env.CIRCLE_WEBHOOK_SECRET;
  if (!secret || !headerSecret) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(headerSecret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
