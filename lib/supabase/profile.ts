import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ProfileRole = "client" | "professional" | "admin";

export async function fetchMyProfileRole(userId: string): Promise<ProfileRole> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
    if (error) return "client";
    const role = (data?.role as string | null) ?? "client";
    if (role === "admin") return "admin";
    return role === "professional" ? "professional" : "client";
  } catch {
    return "client";
  }
}

