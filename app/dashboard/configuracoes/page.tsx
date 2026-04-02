import { redirect } from "next/navigation";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchMyProfile } from "@/lib/supabase/profile-data";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";

export default async function DashboardConfiguracoesPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/entrar?next=/dashboard/configuracoes");

  const profile = await fetchMyProfile(user.id);

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/dashboard" backLabel="← Dashboard" />
      <div className="section">
        <div className="pro-page-card" style={{ maxWidth: 860 }}>
          <span className="sec-eyebrow">Conta</span>
          <h1 className="sec-title" style={{ fontSize: "clamp(32px,4vw,42px)" }}>
            Configurações
          </h1>
          <p className="sec-sub" style={{ marginBottom: 18 }}>
            Atualize seus dados e personalize sua conta.
          </p>

          <ProfileSettingsForm
            userId={user.id}
            initialFullName={profile?.full_name ?? null}
            initialPhone={profile?.phone ?? null}
            initialAvatarUrl={profile?.avatar_url ?? null}
          />
        </div>
      </div>
    </div>
  );
}

