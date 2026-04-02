import { NavUserMenu } from "@/components/kazaro/NavUserMenu";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchMyProfile } from "@/lib/supabase/profile-data";

export async function NavUserMenuServer() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user?.id ? await fetchMyProfile(user.id) : null;
  return <NavUserMenu initialEmail={user?.email ?? null} initialAvatarUrl={profile?.avatar_url ?? null} />;
}

