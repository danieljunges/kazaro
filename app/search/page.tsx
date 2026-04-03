import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/kazaro/MarketingNav";
import { SiteFooter } from "@/components/kazaro/SiteFooter";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { SEARCH_GRID_PROS, type ProfessionalCard } from "@/lib/professionals";
import {
  filterProfessionalsByQuery,
  foldSearchText,
  resolveSearchQuery,
} from "@/lib/search/filterProfessionals";
import { fetchProfessionalsForSearch } from "@/lib/supabase/professionals-public";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

/** Rótulo exibido e termo enviado em `q` (alinha com roleLine / dados reais). */
const FILTER_CHIPS: { label: string; query: string }[] = [
  { label: "Todos", query: "" },
  { label: "Encanamento", query: "encanador" },
  { label: "Elétrica", query: "eletricista" },
  { label: "Limpeza", query: "limpeza" },
  { label: "Montagem", query: "montagem" },
  { label: "Pintura", query: "pintor" },
  { label: "Reforma", query: "reforma" },
  { label: "Jardinagem", query: "jardin" },
];

const PER_PAGE = 12;

function firstString(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function buildSearchPath(
  base: { vazio?: string; empty?: string },
  opts: { q?: string; page?: number },
): string {
  const p = new URLSearchParams();
  const q = opts.q?.trim();
  if (q) p.set("q", q);
  if (opts.page && opts.page > 1) p.set("page", String(opts.page));
  if (base.vazio === "1") p.set("vazio", "1");
  if (base.empty === "1") p.set("empty", "1");
  const s = p.toString();
  return s ? `/search?${s}` : "/search";
}

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
  searchParams: Promise<{ vazio?: string; empty?: string; q?: string | string[]; page?: string | string[] }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const showEmpty = sp.vazio === "1" || sp.empty === "1";
  const qRaw = firstString(sp.q) ?? "";
  const qResolved = resolveSearchQuery(qRaw);
  const pageRaw = firstString(sp.page);
  const pageParsed = Math.max(1, parseInt(pageRaw || "1", 10) || 1);

  const fromDb = showEmpty ? null : await fetchProfessionalsForSearch();
  const rows: ProfessionalCard[] = showEmpty
    ? []
    : fromDb === null
      ? SEARCH_GRID_PROS
      : fromDb.length > 0
        ? fromDb
        : [];
  const showDemoFallback = !showEmpty && fromDb !== null && fromDb.length === 0;

  const filtered =
    showEmpty || showDemoFallback ? rows : filterProfessionalsByQuery(rows, qResolved);
  const filteredCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(filteredCount / PER_PAGE));
  const currentPage = Math.min(pageParsed, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const qResolvedFold = foldSearchText(qResolved);
  const baseSp = { vazio: sp.vazio, empty: sp.empty };

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
            {sp.vazio === "1" ? (
              <input type="hidden" name="vazio" value="1" />
            ) : sp.empty === "1" ? (
              <input type="hidden" name="empty" value="1" />
            ) : null}
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
              defaultValue={qRaw}
              aria-label="Buscar serviço"
              autoComplete="off"
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
          {FILTER_CHIPS.map(({ label, query: chipQ }) => {
            const isAll = !chipQ;
            const href = isAll ? buildSearchPath(baseSp, {}) : buildSearchPath(baseSp, { q: chipQ });
            const active = isAll ? !qResolvedFold : foldSearchText(chipQ) === qResolvedFold;
            return (
              <Link
                key={label}
                href={href}
                className={`kz-filter-chip${active ? " active" : ""}`}
                aria-current={active ? "page" : undefined}
                scroll={false}
              >
                {label}
              </Link>
            );
          })}
          <div className="kz-filter-sep" aria-hidden />
          <button type="button" className="kz-filter-sort" disabled aria-disabled title="Em breve">
            Ordenar: Relevância ↕
          </button>
        </div>
      </div>

      <div className="kz-busca-main">
        <aside className="kz-sidebar" aria-label="Filtros">
          <p className="kz-sidebar-soon">
            Disponibilidade, preço e bairro abaixo são visuais por enquanto; a busca por texto e as categorias do
            topo já filtram a lista.
          </p>
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
              <strong>{showEmpty || showDemoFallback ? 0 : filteredCount}</strong> profissionais em Florianópolis
              {qRaw && !showEmpty && !showDemoFallback ? (
                <>
                  {" "}
                  <span style={{ fontWeight: 400, color: "var(--ink50)" }}>(busca: “{qRaw}”)</span>
                </>
              ) : null}
            </div>
          </div>

          {showEmpty || showDemoFallback ? (
            <SearchEmptyState variant={showDemoFallback ? "database-empty" : "qa"} />
          ) : filteredCount === 0 ? (
            <SearchEmptyState variant="no-match" query={qRaw || qResolved} />
          ) : (
            <>
              <div className="kz-results-grid">
                {pageRows.map((r) => (
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
              {totalPages > 1 ? (
                <nav className="kz-pagination" aria-label="Paginação">
                  {currentPage > 1 ? (
                    <Link
                      href={buildSearchPath(baseSp, { q: qRaw, page: currentPage - 1 })}
                      className="kz-page-btn"
                      aria-label="Página anterior"
                      scroll={false}
                    >
                      ←
                    </Link>
                  ) : (
                    <span className="kz-page-btn kz-page-btn--disabled" aria-disabled>
                      ←
                    </span>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) =>
                    n === currentPage ? (
                      <span key={n} className="kz-page-btn active" aria-current="page">
                        {n}
                      </span>
                    ) : (
                      <Link
                        key={n}
                        href={buildSearchPath(baseSp, { q: qRaw, page: n })}
                        className="kz-page-btn"
                        scroll={false}
                      >
                        {n}
                      </Link>
                    ),
                  )}
                  {currentPage < totalPages ? (
                    <Link
                      href={buildSearchPath(baseSp, { q: qRaw, page: currentPage + 1 })}
                      className="kz-page-btn"
                      aria-label="Próxima página"
                      scroll={false}
                    >
                      →
                    </Link>
                  ) : (
                    <span className="kz-page-btn kz-page-btn--disabled" aria-disabled>
                      →
                    </span>
                  )}
                </nav>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
