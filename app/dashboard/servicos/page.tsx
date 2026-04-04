import Link from "next/link";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { CreateServiceForm } from "@/components/services/CreateServiceForm";
import { requireProfessionalTools } from "@/lib/auth/require-pro-tools";
import { labelForCategoryKey, type ServiceCategoryKey } from "@/lib/services/category-catalog";
import {
  isProServiceApproved,
  normalizeProServiceStatus,
  proServiceStatusCssKey,
  proServiceStatusLabelPt,
} from "@/lib/services/pro-service-status";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function formatPriceBRL(cents: number | null): string {
  if (cents == null || cents <= 0) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
    cents / 100,
  );
}

function fmtShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

type SvcRow = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number | null;
  duration_minutes: number | null;
  status: string;
  reviewer_note: string | null;
  created_at: string;
  category_key: string | null;
};

export default async function DashboardServicosPage() {
  const { user } = await requireProfessionalTools("/dashboard/servicos");
  const supabase = await getSupabaseServerClient();

  const { data: pro } = await supabase.from("professionals").select("id, slug, display_name").eq("id", user.id).maybeSingle();
  const isPro = !!pro?.id;

  const { data: svcRaw } = isPro
    ? await supabase
        .from("pro_services")
        .select(
          "id, name, description, price_cents, duration_minutes, status, reviewed_at, reviewer_note, created_at, category_key",
        )
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] as SvcRow[] };

  const svc = (svcRaw ?? []) as SvcRow[];

  const occupiedCategoryKeys = svc
    .filter((s) => {
      const n = normalizeProServiceStatus(s.status);
      return n === "pending" || n === "approved";
    })
    .map((s) => s.category_key)
    .filter((k): k is string => Boolean(k)) as ServiceCategoryKey[];

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/dashboard" backLabel="← Dashboard" />
      <div className="section">
        <div className="pro-page-card kz-svc-dashboard" style={{ maxWidth: 980 }}>
          <header className="kz-svc-page-head">
            <span className="sec-eyebrow">Painel do prestador</span>
            <div className="kz-svc-page-head__row">
              <h1 className="sec-title kz-svc-page-title">Meus serviços</h1>
              {isPro && pro?.slug ? (
                <Link className="dc-link kz-svc-page-head__link" href={`/profissional/${pro.slug}`}>
                  Ver perfil →
                </Link>
              ) : (
                <Link className="dc-link kz-svc-page-head__link" href="/dashboard/ativar-perfil">
                  Ativar perfil →
                </Link>
              )}
            </div>
          </header>

          {!isPro ? (
            <p className="sec-sub" style={{ margin: "0 0 18px" }}>
              Para cadastrar serviços e aparecer nas buscas, ative seu perfil de prestador.
            </p>
          ) : (
            <>
              <p className="sec-sub" style={{ margin: "0 0 18px", maxWidth: 720 }}>
                Cada serviço fica ligado a <strong>uma área</strong> (como na busca). O <strong>preço é obrigatório</strong>{" "}
                (valor fixo do anúncio) e a <strong>duração</strong> define quanto tempo o horário fica bloqueado na sua
                agenda. Enquanto estiver <strong>em análise</strong>, só você vê aqui.
              </p>
              <CreateServiceForm occupiedCategoryKeys={occupiedCategoryKeys} />
            </>
          )}

          {isPro ? (
            <div style={{ marginTop: 28 }}>
              <div className="kz-svc-list-head">Prévia dos seus serviços</div>
              <p className="sec-sub" style={{ margin: "0 0 14px", fontSize: 13 }}>
                Resumo de como fica organizado: texto completo e preço como no perfil público após aprovação.
              </p>
              {svc.length ? (
                <div className="kz-svc-preview-list">
                  {svc.map((s) => {
                    const cat = labelForCategoryKey(s.category_key ?? undefined);
                    const excerpt = (s.description ?? "").trim().slice(0, 160);
                    const more = (s.description ?? "").trim().length > 160;
                    const statusKey = proServiceStatusCssKey(s.status);
                    return (
                      <article key={s.id} className="kz-svc-preview-card">
                        <div className="kz-svc-preview-card__top">
                          <div className="kz-svc-preview-card__meta">
                            {cat ? <span className="kz-svc-preview-card__cat">{cat}</span> : null}
                            <span
                              className={`kz-svc-preview-card__status kz-svc-preview-card__status--${statusKey}`}
                            >
                              {proServiceStatusLabelPt(s.status)}
                            </span>
                          </div>
                          <time className="kz-svc-preview-card__time" dateTime={s.created_at}>
                            {fmtShort(s.created_at)}
                          </time>
                        </div>
                        <h3 className="kz-svc-preview-card__title">{s.name}</h3>
                        <div className="kz-svc-preview-card__price">
                          {formatPriceBRL(s.price_cents ?? null)}
                          {typeof s.duration_minutes === "number" ? (
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink50)", marginLeft: 8 }}>
                              · {s.duration_minutes} min na agenda
                            </span>
                          ) : null}
                        </div>
                        {excerpt ? (
                          <p className="kz-svc-preview-card__excerpt">
                            {excerpt}
                            {more ? "…" : ""}
                          </p>
                        ) : (
                          <p className="kz-svc-preview-card__excerpt kz-svc-preview-card__excerpt--muted">
                            Sem descrição. Você pode detalhar melhor no próximo cadastro.
                          </p>
                        )}
                        {!isProServiceApproved(s.status) && s.reviewer_note ? (
                          <div className="kz-svc-note" style={{ marginTop: 12 }}>
                            Nota da moderação: {s.reviewer_note}
                          </div>
                        ) : null}
                        {isProServiceApproved(s.status) && pro?.slug ? (
                          <Link href={`/profissional/${pro.slug}`} className="kz-svc-preview-card__link">
                            Ver no perfil público →
                          </Link>
                        ) : null}
                      </article>
                    );
                  })}
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
