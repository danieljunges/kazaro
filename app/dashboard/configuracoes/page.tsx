import { redirect } from "next/navigation";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { dashboardHomeHref } from "@/lib/dashboard/home-href";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchMyProfile } from "@/lib/supabase/profile-data";
import { fetchMyProfileRole } from "@/lib/supabase/profile";
import { isAccountDeletionConfigured } from "@/lib/supabase/admin";
import { AccountSecuritySection } from "@/components/settings/AccountSecuritySection";
import { ProfessionalPublicSettingsForm } from "@/components/settings/ProfessionalPublicSettingsForm";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";

export default async function DashboardConfiguracoesPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/entrar?next=/dashboard/configuracoes");

  const [profile, role] = await Promise.all([fetchMyProfile(user.id), fetchMyProfileRole(user.id)]);
  const home = dashboardHomeHref(role);

  let pro: { display_name: string; service_region: string | null } | null = null;
  if (role === "professional") {
    const { data } = await supabase
      .from("professionals")
      .select("display_name, service_region")
      .eq("id", user.id)
      .maybeSingle();
    pro = data;
  }

  const userEmail = user.email?.trim() ?? "";
  const hasEmailPasswordProvider = (user.identities ?? []).some((i) => i.provider === "email");
  const accountDeletionConfigured = isAccountDeletionConfigured();

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref={home} backLabel={role === "client" ? "← Início" : "← Dashboard"} />
      <div className="section">
        <div className="pro-page-card" style={{ maxWidth: 860 }}>
          <span className="sec-eyebrow">Conta</span>
          <h1 className="sec-title" style={{ fontSize: "clamp(32px,4vw,42px)" }}>
            Configurações
          </h1>
          <p className="sec-sub" style={{ marginBottom: 18 }}>
            Perfil público, segurança da conta e exclusão de dados.
          </p>

          <ProfileSettingsForm
            userId={user.id}
            initialFullName={profile?.full_name ?? null}
            initialPhone={profile?.phone ?? null}
            initialAvatarUrl={profile?.avatar_url ?? null}
          />

          {role === "professional" && pro ? (
            <ProfessionalPublicSettingsForm
              initialDisplayName={(pro.display_name as string)?.trim() || ""}
              initialServiceRegion={(pro.service_region as string | null)?.trim() || ""}
            />
          ) : null}

          <AccountSecuritySection
            userEmail={userEmail}
            hasEmailPasswordProvider={hasEmailPasswordProvider}
            accountDeletionConfigured={accountDeletionConfigured}
          />
        </div>
      </div>
    </div>
  );
}

