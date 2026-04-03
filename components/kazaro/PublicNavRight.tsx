import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchMyProfile } from "@/lib/supabase/profile-data";
import { fetchMyProfileRole, type ProfileRole } from "@/lib/supabase/profile";
import { NavUserMenu } from "@/components/kazaro/NavUserMenu";
import { SiteNavDrawer } from "@/components/kazaro/SiteNavDrawer";

type Props = {
  variant: "marketing" | "compact";
  backHref?: string;
  backLabel?: string;
};

export async function PublicNavRight({ variant, backHref, backLabel }: Props) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user?.id ? await fetchMyProfile(user.id) : null;
  const role: ProfileRole | null = user?.id ? await fetchMyProfileRole(user.id) : null;

  return (
    <>
      <SiteNavDrawer variant={variant} backHref={backHref} backLabel={backLabel} accountKind={role} />
      <NavUserMenu
        initialEmail={user?.email ?? null}
        initialAvatarUrl={profile?.avatar_url ?? null}
        accountKind={role}
      />
    </>
  );
}
