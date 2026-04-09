import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Cliente com service_role: só em Server Actions / Route Handlers.
 * Nunca importar em componentes "use client".
 */
export function getSupabaseServiceRoleClient(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) return null;
  const { url } = getSupabaseEnv();
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/** Alias legado (signup / checagens). */
export { getSupabaseServiceRoleClient as getSupabaseAdmin };

export function isAccountDeletionConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}
