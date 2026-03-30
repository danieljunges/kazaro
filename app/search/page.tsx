import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/kazaro/MarketingNav";
import { SiteFooter } from "@/components/kazaro/SiteFooter";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { SEARCH_GRID_PROS, type ProfessionalCard } from "@/lib/professionals";
import { fetchProfessionalsForSearch } from "@/lib/supabase/professionals-public";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

const FILTER_CHIPS = [
  "Todos",
  "Encanamento",
  "Elétrica",
  "Limpeza",
  "Montagem",
  "Pintura",
  "Reforma",
  "Jardinagem",
];

function phClass(c: ProfessionalCard["phClass"]) {
  return `kz-${c}`;
}

function AvailBadge({ avail }: { avail: ProfessionalCard["avail"] }) {
  if (avail === "today") {
    return <span className="kz-avail-badge kz-avail-today">Disponível hoje</span>;
  }
  if (avail === "tomorrow") {
    return <span className="kz-avail-badge kz-avail-tom">Disponível amanhã</span>;
  }
  return <span className="kz-avail-badge kz-avail-tom">Esta semana</span>;
}

export const metadata: Metadata = {
  title: "Buscar profissionais",
  description: `Encontre profissionais verificados, compare preços e disponibilidade no ${SITE_NAME}.`,
  openGraph: {
    title: `Buscar profissionais — ${SITE_NAME}`,
    description: "Filtre por disponibilidade, preço e avaliação em poucos cliques.",
    url: `${getSiteUrl()}/search`,
    type: "website",
  },
  alternates: {
    canonical: `${getSiteUrl()}/search`,
  },
};

type PageProps = {
  searchParams: Promise<{ vazio?: string; empty?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const showEmpty = sp.vazio === "1" || sp.empty === "1";
  const fromDb = showEmpty ? null : await fetchProfessionalsForSearch();
  const rows: ProfessionalCard[] = showEmpty
    ? []
    : fromDb === null
      ? SEARCH_GRID_PROS
      : fromDb.length > 0
        ? fromDb
        : [];
  const count = rows.length;
  const showDemoFallback = !showEmpty && fromDb !== null && fromDb.length === 0;

  return (
    <div className="home-editorial kz-busca">
      <MarketingNav />

      <header className="kz-search-header">
        <div className="kz-sh-inner">
          <p className="kz-sh-label">Florianópolis e região</p>
          <h1 className="kz-sh-title">
            Encontre o <em>profissional</em>
            <br />
            certo para você
          </h1>
          <form className="kz-sh-searchbar" action="/search" method="get" role="search">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "#A0A090", flexShrink: 0 }}
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="kz-sh-input"
              name="q"
              placeholder="Qual serviço você precisa?"
              defaultValue="Encanador"
              aria-label="Buscar serviço"
            />
            <div className="kz-sh-sep" aria-hidden />
            <div className="kz-sh-loc">
              <span className="kz-sh-loc-dot" aria-hidden />
              Florianópolis, SC
            </div>
            <button type="submit" className="kz-sh-btn">
              Buscar
            </button>
          </form>
        </div>
      </header>

      <div className="kz-filters-bar">
        <div className="kz-fb-inner">
          {FILTER_CHIPS.map((label, i) => (
            <button
              key={label}
              type="button"
              className={`kz-filter-chip${i === 0 ? " active" : ""}`}
              aria-pressed={i === 0}
            >
              {label}
            </button>
          ))}
          <div className="kz-filter-sep" aria-hidden />
          <button type="button" className="kz-filter-sort">
            Ordenar: Relevância ↕
          </button>
        </div>
      </div>

      <div className="kz-busca-main">
        <aside className="kz-sidebar" aria-label="Filtros">
          <div className="kz-sidebar-section">
            <div className="kz-sidebar-title">Disponibilidade</div>
            <div className="kz-avail-opts">
              <div className="kz-avail-opt selected">
                <div className="kz-avail-dot green" aria-hidden />
                <span className="kz-avail-label">Disponível hoje</span>
              </div>
              <div className="kz-avail-opt">
                <div className="kz-avail-dot green" style={{ opacity: 0.6 }} aria-hidden />
                <span className="kz-avail-label">Disponível amanhã</span>
              </div>
              <div className="kz-avail-opt">
                <div className="kz-avail-dot gray" aria-hidden />
                <span className="kz-avail-label">Qualquer data</span>
              </div>
            </div>
          </div>

          <div className="kz-sidebar-section">
            <div className="kz-sidebar-title">Faixa de preço</div>
            <div className="kz-price-range">
              <input className="kz-price-input" placeholder="R$ mín" defaultValue="80" aria-label="Preço mínimo" />
              <input className="kz-price-input" placeholder="R$ máx" defaultValue="300" aria-label="Preço máximo" />
            </div>
          </div>

          <div className="kz-sidebar-section">
            <div className="kz-sidebar-title">Avaliação mínima</div>
            <div className="kz-rating-opts">
              <label className="kz-rating-opt">
                <input type="radio" name="rating" defaultChecked />
                <span className="kz-stars-mini">★★★★★</span>
                <span className="kz-rating-label">5,0</span>
              </label>
              <label className="kz-rating-opt">
                <input type="radio" name="rating" />
                <span className="kz-stars-mini">★★★★☆</span>
                <span className="kz-rating-label">4,0 ou mais</span>
              </label>
              <label className="kz-rating-opt">
                <input type="radio" name="rating" />
                <span className="kz-stars-mini">★★★☆☆</span>
                <span className="kz-rating-label">3,0 ou mais</span>
              </label>
            </div>
          </div>

          <div className="kz-sidebar-section">
            <div className="kz-sidebar-title">Bairro</div>
            <div className="kz-sidebar-options">
              {[
                ["Trindade", "24"],
                ["Lagoa da Conceição", "18"],
                ["Córrego Grande", "15"],
                ["Campeche", "12"],
                ["Ingleses", "9"],
                ["Jurerê", "7"],
              ].map(([bairro, n], idx) => (
                <label key={bairro} className="kz-sidebar-opt">
                  <input type="checkbox" defaultChecked={idx === 0} />
                  <span className="kz-sidebar-opt-label">{bairro}</span>
                  <span className="kz-sidebar-opt-count">{n}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="kz-sidebar-section">
            <div className="kz-sidebar-title">Perfil</div>
            <div className="kz-sidebar-options">
              <label className="kz-sidebar-opt">
                <input type="checkbox" defaultChecked />
                <span className="kz-sidebar-opt-label">Verificado</span>
              </label>
              <label className="kz-sidebar-opt">
                <input type="checkbox" />
                <span className="kz-sidebar-opt-label">Com foto</span>
              </label>
              <label className="kz-sidebar-opt">
                <input type="checkbox" />
                <span className="kz-sidebar-opt-label">Mais de 50 avaliações</span>
              </label>
            </div>
          </div>
        </aside>

        <div className="kz-results">
          <div className="kz-results-header">
            <div className="kz-results-count">
              <strong>{showEmpty ? 0 : count}</strong> profissionais em Florianópolis
            </div>
          </div>

          {showEmpty || showDemoFallback ? (
            <SearchEmptyState variant={showDemoFallback ? "database-empty" : "qa"} />
          ) : (
            <>
              <div className="kz-results-grid">
                {rows.map((r) => (
                  <Link key={r.slug} href={`/profissional/${r.slug}`} className="kz-grid-card">
                    <div className="kz-pro-img">
                      <div className={`kz-pro-img-ph ${phClass(r.phClass)}`}>
                        {r.initials}
                        <AvailBadge avail={r.avail} />
                        {r.verified ? <span className="kz-verified-badge">Verificado</span> : null}
                      </div>
                    </div>
                    <div className="kz-grid-body">
                      <div className="kz-grid-name">{r.name}</div>
                      <div className="kz-grid-role">{r.roleLine}</div>
                      <div className="kz-grid-meta">
                        <span className="kz-grid-rating">{r.rating}</span>
                        <span className="kz-grid-sep">·</span>
                        <span>{r.reviewsCount} avaliações</span>
                        {r.verified ? (
                          <>
                            <span className="kz-grid-sep">·</span>
                            <span className="kz-grid-verified-txt">Verificado</span>
                          </>
                        ) : null}
                      </div>
                      <div className="kz-grid-divider" />
                      <div className="kz-grid-footer">
                        <div>
                          <div className="kz-grid-price-from">a partir de</div>
                          <div className="kz-grid-price">{r.price}</div>
                        </div>
                        <span className="kz-btn-ver-grid">Ver perfil</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <nav className="kz-pagination" aria-label="Paginação">
                <span className="kz-page-btn active">1</span>
                <span className="kz-page-btn">2</span>
                <span className="kz-page-btn">3</span>
                <span className="kz-page-btn" aria-label="Próxima">
                  →
                </span>
              </nav>
            </>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
