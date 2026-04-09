import type { ProfileRole } from "@/lib/supabase/profile";

/** Clientes não usam a visão geral do painel; prestadores/admin sim. */
export function dashboardHomeHref(role: ProfileRole): string {
  return role === "client" ? "/search" : "/dashboard";
}
