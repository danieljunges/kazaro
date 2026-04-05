import { NextResponse } from "next/server";
import { fetchProDashboardNotifications } from "@/lib/dashboard/pro-notifications";
import { fetchMyProfileRole } from "@/lib/supabase/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Lista de notificações do painel (prestador/admin) para o sino na CompactNav no mobile.
 */
export async function GET() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return NextResponse.json({ items: [], visible: false }, { status: 401 });
  }

  const role = await fetchMyProfileRole(user.id);
  if (role === "client") {
    return NextResponse.json({ items: [], visible: false });
  }
  if (role !== "professional" && role !== "admin") {
    return NextResponse.json({ items: [], visible: false });
  }

  const items = await fetchProDashboardNotifications(user.id);
  return NextResponse.json({ items, visible: true });
}
