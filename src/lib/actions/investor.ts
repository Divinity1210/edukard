"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const DepositSchema = z.object({
  amount: z.coerce.number().positive().max(10_000_000),
  method: z.enum(["eft", "wire", "ach"]),
});

/**
 * Record an investor deposit (fiat -> USDC). Inserts a `processing` row at a
 * 1:1 CAD→USDC peg. When Circle is live, the Circle webhook flips it to
 * `confirmed` once the on-ramp settles. Ensures the investor_profiles row
 * exists first (FK target).
 */
export async function createDeposit(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = DepositSchema.safeParse({
    amount: formData.get("amount"),
    method: formData.get("method"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid deposit" };

  // Ensure the investor profile exists (FK target for deposits/investments).
  const { data: existing } = await supabase.from("investor_profiles").select("id").eq("id", user.id).maybeSingle();
  if (!existing) {
    const { error: profileErr } = await supabase.from("investor_profiles").insert({ id: user.id });
    if (profileErr) return { error: profileErr.message };
  }

  const { data: deposit, error } = await supabase
    .from("deposits")
    .insert({
      investor_id: user.id,
      amount: parsed.data.amount,
      method: parsed.data.method,
      status: "processing",
      usdc_equivalent: parsed.data.amount, // 1:1 peg
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/investor/deposit");
  return { success: true, reference: `EK-DEP-${String(deposit.id).slice(0, 8).toUpperCase()}` };
}
