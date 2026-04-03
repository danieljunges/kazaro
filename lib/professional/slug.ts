import type { SupabaseClient } from "@supabase/supabase-js";

export function displayNameToSlugBase(name: string): string {
  const t = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return t || "prestador";
}

export async function pickUniqueProfessionalSlug(supabase: SupabaseClient, base: string): Promise<string> {
  const cleanBase = base.replace(/-+/g, "-").replace(/^-+|-+$/g, "") || "prestador";
  for (let i = 0; i < 32; i++) {
    const suffix = i === 0 ? "" : `-${Math.random().toString(36).slice(2, 7)}`;
    const slug = `${cleanBase}${suffix}`.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
    const { data } = await supabase.from("professionals").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
  }
  return `${cleanBase}-${Date.now().toString(36)}`;
}
