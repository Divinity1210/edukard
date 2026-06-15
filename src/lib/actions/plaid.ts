"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isConfigured, createLinkToken, exchangePublicToken } from "@/lib/integrations/plaid";

/**
 * Step 1 of the Plaid Link handshake: mint a short-lived link_token for the
 * signed-in user. The browser passes this to Plaid Link to open the flow.
 */
export async function createPlaidLinkToken(): Promise<{ link_token?: string; error?: string }> {
  if (!isConfigured()) return { error: "Plaid is not configured" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const res = (await createLinkToken(user.id)) as { link_token?: string };
    if (!res.link_token) return { error: "Could not create link token" };
    return { link_token: res.link_token };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Plaid link token failed" };
  }
}

/**
 * Step 2: exchange the public_token returned by Link for a permanent
 * access_token and persist the item. RLS ensures the row is owned by the user.
 */
export async function exchangePlaidPublicToken(input: {
  publicToken: string;
  institutionId?: string | null;
  institutionName?: string | null;
}): Promise<{ success?: boolean; error?: string }> {
  if (!isConfigured()) return { error: "Plaid is not configured" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const { access_token, item_id } = await exchangePublicToken(input.publicToken);

    const { error } = await supabase.from("plaid_items").upsert(
      {
        user_id: user.id,
        item_id,
        access_token,
        institution_id: input.institutionId ?? null,
        institution_name: input.institutionName ?? null,
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "item_id" }
    );
    if (error) return { error: error.message };

    revalidatePath("/student/payroll");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Plaid exchange failed" };
  }
}
