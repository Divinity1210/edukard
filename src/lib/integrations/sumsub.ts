import crypto from "crypto";

/**
 * Sumsub adapter — KYC / KYB / liveness.
 *
 * Sumsub authenticates every API call with an HMAC signature over
 * `ts + METHOD + path + body` using the secret key, plus the app token.
 * Activates when SUMSUB_APP_TOKEN + SUMSUB_SECRET_KEY are present.
 */

const API_BASE = "https://api.sumsub.com";

export function isConfigured(): boolean {
  return Boolean(process.env.SUMSUB_APP_TOKEN && process.env.SUMSUB_SECRET_KEY);
}

function creds() {
  const token = process.env.SUMSUB_APP_TOKEN;
  const secret = process.env.SUMSUB_SECRET_KEY;
  if (!token || !secret) throw new Error("Sumsub is not configured (SUMSUB_APP_TOKEN/SUMSUB_SECRET_KEY missing).");
  return { token, secret };
}

async function sumsubRequest<T = unknown>(
  method: "GET" | "POST",
  path: string,
  body?: unknown
): Promise<T> {
  const { token, secret } = creds();
  const ts = Math.floor(Date.now() / 1000).toString();
  const bodyStr = body ? JSON.stringify(body) : "";
  const signature = crypto
    .createHmac("sha256", secret)
    .update(ts + method + path + bodyStr)
    .digest("hex");

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "X-App-Token": token,
      "X-App-Access-Sig": signature,
      "X-App-Access-Ts": ts,
      "Content-Type": "application/json",
    },
    body: body ? bodyStr : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Sumsub ${method} ${path} failed: ${json?.description || res.status}`);
  }
  return json as T;
}

/** Create an applicant for a given user before they start KYC. */
export async function createApplicant(externalUserId: string, levelName = "basic-kyc-level") {
  return sumsubRequest("POST", `/resources/applicants?levelName=${encodeURIComponent(levelName)}`, {
    externalUserId,
  });
}

/** Generate a short-lived access token to launch the front-end WebSDK. */
export async function generateAccessToken(externalUserId: string, levelName = "basic-kyc-level", ttlSecs = 600) {
  return sumsubRequest<{ token: string; userId: string }>(
    "POST",
    `/resources/accessTokens?userId=${encodeURIComponent(externalUserId)}&levelName=${encodeURIComponent(levelName)}&ttlInSecs=${ttlSecs}`
  );
}

export async function getApplicantStatus(applicantId: string) {
  return sumsubRequest("GET", `/resources/applicants/${applicantId}/status`);
}

/**
 * Verify a Sumsub webhook. Sumsub HMACs the raw body with the webhook secret;
 * the digest algorithm is declared in `x-payload-digest-alg`
 * (HMAC_SHA1_HEX | HMAC_SHA256_HEX | HMAC_SHA512_HEX) and the digest in
 * `x-payload-digest`.
 */
export function verifyWebhook(rawBody: string, digest: string | null, alg: string | null): boolean {
  const secret = process.env.SUMSUB_WEBHOOK_SECRET;
  if (!secret || !digest) return false;

  const algMap: Record<string, string> = {
    HMAC_SHA1_HEX: "sha1",
    HMAC_SHA256_HEX: "sha256",
    HMAC_SHA512_HEX: "sha512",
  };
  const hashAlg = algMap[alg || "HMAC_SHA256_HEX"] || "sha256";
  const expected = crypto.createHmac(hashAlg, secret).update(rawBody).digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(digest);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
