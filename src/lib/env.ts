import { z } from "zod";

/**
 * Centralised, validated environment configuration for EduKard.
 *
 * Design goals:
 *  - Fail fast & loud for the *core* variables the app cannot run without
 *    (Supabase). Everything else is optional so the platform boots in a
 *    "degraded but functional" mode while integrations are still being keyed.
 *  - Each third-party integration exposes an `isConfigured` boolean so feature
 *    code can branch cleanly instead of throwing at runtime when a key is
 *    missing. This is what makes the build "key-pluggable": add the key and the
 *    integration activates, no code change required.
 *
 * NEVER import this file from client components. The non-public values below are
 * server-only secrets. Only the values prefixed NEXT_PUBLIC_* are safe to ship
 * to the browser.
 */

const serverSchema = z.object({
  // ---- Core (required) -------------------------------------------------
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  // Service-role key is required for webhooks / privileged server writes.
  // Optional at boot so the public site can render, but webhook routes guard on it.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // ---- App ------------------------------------------------------------
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // ---- Stripe (payments / PAD) ----------------------------------------
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // ---- Plaid (bank / payroll / income) --------------------------------
  PLAID_CLIENT_ID: z.string().optional(),
  PLAID_SECRET: z.string().optional(),
  PLAID_ENV: z.enum(["sandbox", "development", "production"]).default("sandbox"),
  PLAID_WEBHOOK_SECRET: z.string().optional(),

  // ---- Circle (USDC custodial wallets / payouts) ----------------------
  CIRCLE_API_KEY: z.string().optional(),
  CIRCLE_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
  CIRCLE_WEBHOOK_SECRET: z.string().optional(),
  CIRCLE_TREASURY_WALLET_ID: z.string().optional(),

  // ---- Sumsub (KYC / KYB / liveness) ----------------------------------
  SUMSUB_APP_TOKEN: z.string().optional(),
  SUMSUB_SECRET_KEY: z.string().optional(),
  SUMSUB_WEBHOOK_SECRET: z.string().optional(),
});

type ServerEnv = z.infer<typeof serverSchema>;

function loadEnv(): ServerEnv {
  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    // Only the core Supabase vars are truly fatal. Surface a clear message.
    throw new Error(
      `Invalid environment configuration. Fix the following in your .env:\n${issues}`
    );
  }

  return parsed.data;
}

// Lazily evaluated singleton so importing this module in a context where env
// is incomplete (e.g. a build step) doesn't crash unrelated code paths.
let cached: ServerEnv | null = null;
export function env(): ServerEnv {
  if (!cached) cached = loadEnv();
  return cached;
}

/** Per-integration readiness flags. Cheap, never throws. */
export const integrations = {
  get stripe() {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  },
  get stripeWebhook() {
    return Boolean(process.env.STRIPE_WEBHOOK_SECRET);
  },
  get plaid() {
    return Boolean(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET);
  },
  get circle() {
    return Boolean(process.env.CIRCLE_API_KEY);
  },
  get sumsub() {
    return Boolean(process.env.SUMSUB_APP_TOKEN && process.env.SUMSUB_SECRET_KEY);
  },
  get serviceRole() {
    return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  },
} as const;
