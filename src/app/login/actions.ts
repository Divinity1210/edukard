"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectPath = formData.get("redirect") as string | null;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Determine redirection based on role or explicit redirect query parameter
  if (redirectPath && redirectPath.startsWith("/")) {
    redirect(redirectPath);
  } else {
    redirect("/dashboard");
  }
}
