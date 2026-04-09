"use server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Verifica se o e-mail já existe em `profiles` (espelho de auth).
 * Com service role no servidor; sem chave, retorna ok e o signUp do Supabase continua sendo a fonte da verdade.
 */
export async function checkSignupEmailAvailable(
  email: string,
): Promise<{ available: true } | { available: false; message: string }> {
  const trimmed = email.trim();
  if (!trimmed || !EMAIL_RE.test(trimmed)) {
    return { available: true };
  }
  const normalized = trimmed.toLowerCase();

  const admin = getSupabaseAdmin();
  if (!admin) {
    return { available: true };
  }

  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", normalized)
    .maybeSingle();

  if (error) {
    return { available: true };
  }
  if (data) {
    return { available: false, message: "E-mail já cadastrado." };
  }
  return { available: true };
}
