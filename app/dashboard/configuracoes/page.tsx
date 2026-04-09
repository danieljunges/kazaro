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
import Link from "next/link";
import { ProfessionalProfileSharePanel } from "@/components/settings/ProfessionalProfileSharePanel";
import { ProPortfolioSection } from "@/components/settings/ProPortfolioSection";
import { getSiteUrl } from "@/lib/site";

export default async function DashboardConfiguracoesPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/entrar?next=/dashboard/configuracoes");

  const [profile, role] = await Promise.all([fetchMyProfile(user.id), fetchMyProfileRole(user.id)]);
  const home = dashboardHomeHref(role);

  type ProSettingsRow = {
    display_name: string;
    service_region: string | null;
    slug: string | null;
    focus_category_keys: string[] | null;
  };

  let pro: ProSettingsRow | null = null;
  let portfolioPhotos: { id: string; image_url: string }[] = [];
  if (role === "professional") {
    const { data } = await supabase
      .from("professionals")
      .select("display_name, service_region, slug, focus_category_keys")
      .eq("id", user.id)
      .maybeSingle();
    pro = (data ?? null) as ProSettingsRow | null;

    if (pro) {
      const { data: pf } = await supabase
        .from("pro_portfolio_photos")
        .select("id, image_url")
        .eq("professional_id", user.id)
        .order("sort_order", { ascending: true });
      portfolioPhotos = (pf ?? []) as { id: string; image_url: string }[];
    }
  }

  const siteBase = getSiteUrl();
  const proSlug = (pro?.slug as string | null | undefined)?.trim() || "";
  const publicProfileUrl = proSlug ? `${siteBase}/profissional/${proSlug}` : "";

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
            Dados da conta, nome na vitrine e portfólio.{" "}
            <strong>Horários em que clientes podem marcar</strong> ficam na{" "}
            <Link href="/dashboard/agenda" className="dc-link" style={{ fontSize: "inherit", fontWeight: 700 }}>
              Agenda
            </Link>{" "}
            (faz mais sentido junto do calendário).
          </p>

          <ProfileSettingsForm
            userId={user.id}
            initialFullName={profile?.full_name ?? null}
            initialPhone={profile?.phone ?? null}
            initialAvatarUrl={profile?.avatar_url ?? null}
          />

          {role === "professional" && pro && publicProfileUrl && proSlug ? (
            <ProfessionalProfileSharePanel profileUrl={publicProfileUrl} slug={proSlug} variant="settings" />
          ) : null}

          {role === "professional" && pro ? (
            <ProfessionalPublicSettingsForm
              initialDisplayName={(pro.display_name as string)?.trim() || ""}
              initialServiceRegion={(pro.service_region as string | null)?.trim() || ""}
              initialFocusCategoryKeys={Array.isArray(pro.focus_category_keys) ? pro.focus_category_keys : []}
            />
          ) : null}

          {role === "professional" && pro ? (
            <>
              <ProPortfolioSection initialPhotos={portfolioPhotos} />
              <p className="sec-sub" style={{ margin: "-8px 0 0", fontSize: 13, color: "var(--ink50)" }}>
                Com a conta logada, você pode gerenciar as mesmas fotos também em{" "}
                {proSlug ? (
                  <Link href={`/profissional/${proSlug}`} className="dc-link" style={{ fontSize: "inherit" }}>
                    ver meu perfil público
                  </Link>
                ) : (
                  "seu perfil público"
                )}
                .
              </p>
            </>
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

