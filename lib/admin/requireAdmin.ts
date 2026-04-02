import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchMyProfileRole } from "@/lib/supabase/profile";

export async function requireAdmin(nextPath = "/admin") {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect(`/entrar?next=${encodeURIComponent(nextPath)}`);

  const role = await fetchMyProfileRole(user.id);
  if (role !== "admin") redirect("/dashboard");

  return { userId: user.id, email: user.email ?? null };
}

