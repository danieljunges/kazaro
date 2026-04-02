import Link from "next/link";
import { redirect } from "next/navigation";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { CreateServiceForm } from "@/components/services/CreateServiceForm";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function formatPriceBRL(cents: number | null): string {
  if (cents == null || cents <= 0) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
    cents / 100,
  );
}

export default async function DashboardServicosPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/entrar?next=/dashboard/servicos");

  const { data: pro } = await supabase.from("professionals").select("id, slug, display_name").eq("id", user.id).maybeSingle();
  const isPro = !!pro?.id;

  const { data: svc } = isPro
    ? await supabase
        .from("pro_services")
        .select("id, name, description, price_cents, status, reviewed_at, reviewer_note, created_at")
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] as any[] };

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/dashboard" backLabel="← Dashboard" />
      <div className="section">
        <div className="pro-page-card" style={{ maxWidth: 980 }}>
          <div className="dc-head" style={{ marginBottom: 12 }}>
            Meus serviços
            {isPro && pro?.slug ? (
              <Link className="dc-link" href={`/profissional/${pro.slug}`}>
                Ver perfil →
              </Link>
            ) : (
              <Link className="dc-link" href="/para-profissionais">
                Ativar prestador →
              </Link>
            )}
          </div>

          {!isPro ? (
            <p className="sec-sub" style={{ margin: "0 0 18px" }}>
              Para cadastrar serviços e aparecer nas buscas, ative seu perfil de prestador.
            </p>
          ) : (
            <>
              <p className="sec-sub" style={{ margin: "0 0 18px", maxWidth: 720 }}>
                Crie um serviço e envie para aprovação. Enquanto estiver <strong>pendente</strong>, ele aparece só pra
                você. Depois de aprovado, fica disponível no perfil público.
              </p>
              <CreateServiceForm />
            </>
          )}

          {isPro ? (
            <div style={{ marginTop: 22 }}>
              <div className="kz-svc-list-head">Serviços cadastrados</div>
              {svc?.length ? (
                <div className="kz-svc-list">
                  {svc.map((s: any) => (
                    <div key={s.id} className="kz-svc-card">
                      <div className="kz-svc-top">
                        <div>
                          <div className="kz-svc-name">{s.name}</div>
                          <div className="kz-svc-sub">
                            <span className={`kz-svc-tag kz-svc-tag--${s.status}`}>{s.status}</span>
                            <span className="kz-svc-price">{formatPriceBRL(s.price_cents ?? null)}</span>
                          </div>
                        </div>
                      </div>
                      {s.description ? <div className="kz-svc-desc">{s.description}</div> : null}
                      {s.status !== "approved" && s.reviewer_note ? (
                        <div className="kz-svc-note">Nota: {s.reviewer_note}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="sec-sub" style={{ margin: "10px 0 0" }}>
                  Nenhum serviço ainda.
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

