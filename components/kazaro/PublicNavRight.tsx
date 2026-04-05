import { CompactNavProNotifications } from "@/components/dashboard/CompactNavProNotifications";
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

async function navAuthContext() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user?.id ? await fetchMyProfile(user.id) : null;
  const role: ProfileRole | null = user?.id ? await fetchMyProfileRole(user.id) : null;
  return { user, profile, role };
}

export async function PublicNavRight({ variant, backHref, backLabel }: Props) {
  const { user, profile, role } = await navAuthContext();

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

/** Barra compacta do painel: menu (gaveta) → notificações → conta. */
export async function CompactNavAccountCluster({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  const { user, profile, role } = await navAuthContext();

  return (
    <>
      <SiteNavDrawer variant="compact" backHref={backHref} backLabel={backLabel} accountKind={role} />
      <CompactNavProNotifications />
      <NavUserMenu
        initialEmail={user?.email ?? null}
        initialAvatarUrl={profile?.avatar_url ?? null}
        accountKind={role}
      />
    </>
  );
}
