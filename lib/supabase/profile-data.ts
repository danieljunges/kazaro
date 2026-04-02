import { getSupabaseServerClient } from "@/lib/supabase/server";

export type MyProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string | null;
};

export async function fetchMyProfile(userId: string): Promise<MyProfile | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, avatar_url, role")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return data as MyProfile;
  } catch {
    return null;
  }
}

