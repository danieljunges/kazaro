import { redirect } from "next/navigation";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { ActivateProfessionalForm } from "@/components/dashboard/ActivateProfessionalForm";
import { fetchMyProfileRole } from "@/lib/supabase/profile";
import { fetchMyProfile } from "@/lib/supabase/profile-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AtivarPerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ conta?: string }>;
}) {
  const sp = await searchParams;
  const showEmailConfirmed = sp.conta === "ativada";

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    redirect(`/entrar?next=${encodeURIComponent("/dashboard/ativar-perfil")}`);
  }

  const [role, profile, proRow] = await Promise.all([
    fetchMyProfileRole(user.id),
    fetchMyProfile(user.id),
    supabase.from("professionals").select("id").eq("id", user.id).maybeSingle(),
  ]);

  if (role === "client") redirect("/search");
  if (role === "admin") redirect("/dashboard");
  if (proRow.data) redirect("/dashboard");

  const initialName = (profile?.full_name ?? "").trim() || (user.email?.split("@")[0] ?? "").trim() || "";

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/para-profissionais" backLabel="← Área do prestador" />
      <div className="section">
        <div className="pro-page-card auth-flow-card auth-flow-card--wide">
          <span className="sec-eyebrow">Prestador</span>
          <h1 className="sec-title" style={{ fontSize: "clamp(28px,4vw,40px)", marginBottom: 12 }}>
            Ativar seu perfil
          </h1>
          <p className="sec-sub" style={{ marginBottom: 22 }}>
            Último passo para aparecer nas buscas e cadastrar serviços.
          </p>

          {showEmailConfirmed ? (
            <div
              className="auth-banner auth-banner--ok"
              style={{ marginBottom: 22, textAlign: "left", lineHeight: 1.5 }}
            >
              <strong>Conta confirmada.</strong> Seu e-mail está verificado. Complete os dados abaixo para publicar seu
              perfil no Kazaro.
            </div>
          ) : null}

          <ActivateProfessionalForm initialDisplayName={initialName} />
        </div>
      </div>
    </div>
  );
}
