import { redirect } from "next/navigation";
import { getAdminPanelBasePath } from "@/lib/admin/panel-path";
import { fetchMyProfileRole } from "@/lib/supabase/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin(nextPath?: string) {
  const fallback = getAdminPanelBasePath();
  const path = nextPath ?? fallback;

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect(`/entrar?next=${encodeURIComponent(path)}`);

  const role = await fetchMyProfileRole(user.id);
  if (role !== "admin") {
    redirect(`/entrar?next=${encodeURIComponent(path)}&requer=admin`);
  }

  return { userId: user.id, email: user.email ?? null };
}

