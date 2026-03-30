import type { Metadata } from "next";
import Link from "next/link";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { SearchChips } from "@/components/kazaro/SearchChips";
import { SearchFilters } from "@/components/kazaro/SearchFilters";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

const ROWS = [
  {
    slug: "carlos-eduardo-machado",
    img: "https://i.pravatar.cc/200?img=11",
    name: "Carlos Eduardo Machado",
    role: "Encanador · Trindade, Floripa",
    rating: "4,9",
    count: "127",
    price: "R$ 120",
    tags: ["t", "v"] as const,
  },
  {
    slug: "rodrigo-bittencourt",
    img: "https://i.pravatar.cc/200?img=52",
    name: "Rodrigo Bittencourt",
    role: "Eletricista · Córrego Grande, Floripa",
    rating: "4,8",
    count: "89",
    price: "R$ 150",
    tags: ["t", "v"] as const,
  },
  {
    slug: "ana-paula-ferreira",
    img: "https://i.pravatar.cc/200?img=48",
    name: "Ana Paula Ferreira",
    role: "Faxineira · Lagoa da Conceição",
    rating: "5,0",
    count: "203",
    price: "R$ 150",
    tags: ["m", "v"] as const,
  },
  {
    slug: "thiago-pereira-lima",
    img: "https://i.pravatar.cc/200?img=55",
    name: "Thiago Pereira Lima",
    role: "Pintor · Ingleses, Floripa",
    rating: "4,7",
    count: "64",
    price: "R$ 200",
    tags: ["w"] as const,
  },
  {
    slug: "rafael-gomes-santos",
    img: "https://i.pravatar.cc/200?img=61",
    name: "Rafael Gomes Santos",
    role: "Montador · Kobrasol, SC",
    rating: "4,9",
    count: "312",
    price: "R$ 80",
    tags: ["t", "v"] as const,
  },
  {
    slug: "vinicius-costa-fretes",
    img: "https://i.pravatar.cc/200?img=33",
    name: "Vinícius Costa",
    role: "Frete e mudança · Estreito",
    rating: "4,8",
    count: "58",
    price: "R$ 180",
    tags: ["m", "v"] as const,
  },
];

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

function Tag({ kind }: { kind: "t" | "m" | "w" | "v" }) {
  if (kind === "t") {
    return <span className="tag tag-t">Hoje</span>;
  }
  if (kind === "m") {
    return <span className="tag tag-m">Amanhã</span>;
  }
  if (kind === "w") {
    return <span className="tag tag-w">Esta semana</span>;
  }
  return <span className="tag tag-v">Verificado</span>;
}

type PageProps = {
  searchParams: Promise<{ vazio?: string; empty?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const showEmpty = sp.vazio === "1" || sp.empty === "1";
  const count = showEmpty ? 0 : ROWS.length;

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/" backLabel="← Início" />
      <div className="public-page__intro">
        <span className="public-page__eyebrow">Busca</span>
        <h1 className="public-page__title">Profissionais disponíveis</h1>
        <p className="public-page__sub">
          Compare disponibilidade, avaliações e preço por tipo de serviço antes de agendar.
        </p>
      </div>
      <div className="sp-topbar">
        <div className="sp-search-row">
          <div className="sp-input">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: "var(--ink40)", flexShrink: 0 }}
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="Buscar serviço ou profissional..." aria-label="Buscar" />
          </div>
          <div className="sp-loc-box">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ color: "var(--ember)" }}
              aria-hidden
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Florianópolis, SC</span>
          </div>
        </div>
        <SearchChips />
      </div>
      <div className="sp-body">
        <aside className="sp-sidebar">
          <div className="sp-sidebar-title">Filtros</div>
          <SearchFilters />
        </aside>
        <div className="sp-results">
          <div className="sp-toolbar">
            <span className="sp-count">
              <strong>{count}</strong> profissionais encontrados
            </span>
            <select className="sp-sort" aria-label="Ordenar" disabled={showEmpty}>
              <option>Mais relevantes</option>
              <option>Melhor avaliação</option>
              <option>Menor preço</option>
            </select>
          </div>
          {showEmpty ? (
            <SearchEmptyState />
          ) : (
            <div className="sp-list">
              {ROWS.map((r) => (
                <Link key={r.name} href={`/profissional/${r.slug}`} className="sp-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.img} alt="" />
                  <div className="sp-item-info">
                    <div className="sp-item-name">{r.name}</div>
                    <div className="sp-item-role">{r.role}</div>
                    <div className="sp-item-meta">
                      <span className="sp-rating-inline">
                        {r.rating} · {r.count} aval. ·
                      </span>
                      {r.tags.map((t, i) => (
                        <Tag key={`${r.name}-${i}`} kind={t} />
                      ))}
                    </div>
                  </div>
                  <div className="sp-item-price">
                    <div className="sp-item-from">a partir de</div>
                    <div className="sp-item-val">{r.price}</div>
                  </div>
                  <span className="btn-ver" style={{ flexShrink: 0 }}>
                    Ver perfil
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

