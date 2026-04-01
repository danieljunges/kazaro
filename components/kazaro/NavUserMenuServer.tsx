import { NavUserMenu } from "@/components/kazaro/NavUserMenu";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function NavUserMenuServer() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <NavUserMenu initialEmail={user?.email ?? null} />;
}

