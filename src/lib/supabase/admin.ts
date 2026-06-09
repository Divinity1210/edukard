import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client.
 *
 * This client uses the SUPABASE_SERVICE_ROLE_KEY and therefore BYPASSES Row
 * Level Security. It must NEVER be imported into client components or exposed
 * to the browser. Use it only in:
 *   - webhook route handlers (no user session is present)
 *   - trusted server-side jobs that legitimately act across users
 *     (disbursement, settlement, yield distribution, collections automation)
 *
 * For anything that runs in the context of a logged-in user, prefer the
 * RLS-respecting client from ./server.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Service-role client requested but NEXT_PUBLIC_SUPABASE_URL or " +
        "SUPABASE_SERVICE_ROLE_KEY is not set. This is required for webhook " +
        "processing and privileged server writes."
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
