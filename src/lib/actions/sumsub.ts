"use server";

import { createClient } from "@/lib/supabase/server";
import { isConfigured, createApplicant, generateAccessToken } from "@/lib/integrations/sumsub";

/**
 * Start (or resume) a Sumsub verification for the signed-in user.
 *
 * Ensures an applicant exists and that its id is stored on the profile so the
 * `applicantReviewed` webhook can match the review back to this user, then
 * returns a short-lived access token to launch the WebSDK.
 */
export async function startSumsubVerification(): Promise<{ token?: string; error?: string }> {
  if (!isConfigured()) return { error: "Sumsub is not configured" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("sumsub_applicant_id")
      .eq("id", user.id)
      .single();

    // Create the applicant the first time so we can persist its id for webhook
    // matching. If one already exists Sumsub returns 409 — safe to ignore.
    if (!profile?.sumsub_applicant_id) {
      try {
        const applicant = (await createApplicant(user.id)) as { id?: string };
        if (applicant?.id) {
          await supabase
            .from("profiles")
            .update({ sumsub_applicant_id: applicant.id, kyc_status: "pending", updated_at: new Date().toISOString() })
            .eq("id", user.id);
        }
      } catch {
        // Applicant already exists — proceed to token generation.
      }
    }

    const { token } = await generateAccessToken(user.id);
    if (!token) return { error: "Could not generate access token" };
    return { token };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Sumsub start failed" };
  }
}

/**
 * Token refresh callback for the WebSDK — invoked when the access token expires
 * mid-session. Returns a fresh token string (or empty on failure).
 */
export async function refreshSumsubToken(): Promise<string> {
  if (!isConfigured()) return "";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "";
  try {
    const { token } = await generateAccessToken(user.id);
    return token || "";
  } catch {
    return "";
  }
}
