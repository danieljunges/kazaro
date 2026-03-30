import type { Metadata } from "next";
import Link from "next/link";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { ProfileTabs } from "@/components/kazaro/ProfileTabs";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

function titleFromSlug(id: string): string {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const name = titleFromSlug(id);
  const base = getSiteUrl();
  const url = `${base}/profissional/${id}`;
  return {
    title: name,
    description: `Perfil de ${name} no ${SITE_NAME}. Serviços, preços e disponibilidade em um só lugar.`,
    openGraph: {
      title: `${name} — ${SITE_NAME}`,
      description: "Perfil profissional com avaliações e serviços detalhados.",
      url,
      type: "website",
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function ProfissionalPage({ params }: Props) {
  await params;
  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/search" backLabel="← Busca" />
      <div className="pp-bg">
        <div className="pp-band">
          <div className="pp-band-fade" />
        </div>
        <div className="pp-main">
          <div className="pp-header">
            <div className="pp-pic">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://i.pravatar.cc/400?img=11" alt="Carlos" />
              <span className="pp-verified-pill">✓ Verificado</span>
            </div>
            <div className="pp-info">
              <h1 className="pp-name">Carlos Eduardo Machado</h1>
              <div className="pp-role-line">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: "var(--ink40)" }}
                  aria-hidden
                >
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
                Encanador · Trindade, Florianópolis · Desde Jan 2022
              </div>
              <div className="pp-pills">
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>4,9</span>
                <span style={{ fontSize: 12.5, color: "var(--ink60)" }}>· 127 avaliações</span>
                <span className="avail-badge avail-today" style={{ position: "static", backdropFilter: "none" }}>
                  Disponível hoje
                </span>
                <span style={{ fontSize: 12, color: "var(--ink60)", fontWeight: 500 }}>
                  ⚡ Responde em menos de 30 min
                </span>
              </div>
            </div>
            <div className="pp-actions">
              <button type="button" className="btn-outline-ink">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Mensagem
              </button>
              <button type="button" className="btn-book-now">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Agendar agora
              </button>
            </div>
          </div>
          <div className="pp-stats">
            <div className="pp-stat">
              <div className="pp-stat-val">312</div>
              <div className="pp-stat-label">Trabalhos concluídos</div>
            </div>
            <div className="pp-stat">
              <div className="pp-stat-val">4.9</div>
              <div className="pp-stat-label">Avaliação média</div>
            </div>
            <div className="pp-stat">
              <div className="pp-stat-val">{"<30min"}</div>
              <div className="pp-stat-label">Tempo de resposta</div>
            </div>
          </div>
          <ProfileTabs />
          <div className="services-list">
            {[
              {
                name: "Conserto de vazamento",
                desc: "Identificação e reparo de vazamentos visíveis e ocultos. Material incluso na visita.",
                price: "R$ 120",
                unit: "/ serviço",
              },
              {
                name: "Instalação de torneira",
                desc: "Instalação completa com material incluso. Qualquer modelo e marca.",
                price: "R$ 80",
                unit: "/ unidade",
              },
              {
                name: "Desentupimento",
                desc: "Pia, vaso sanitário, ralo — todos os tipos. Rápido e sem sujeira.",
                price: "R$ 150",
                unit: "/ serviço",
              },
              {
                name: "Instalação de aquecedor",
                desc: "A gás ou elétrico, com registro incluso. Garantia de 6 meses no serviço.",
                price: "R$ 280",
                unit: "/ serviço",
              },
            ].map((s) => (
              <div key={s.name} className="service-item">
                <div className="si-name">{s.name}</div>
                <div className="si-desc">{s.desc}</div>
                <div className="si-footer">
                  <div>
                    <span className="si-price">{s.price}</span> <span className="si-unit">{s.unit}</span>
                  </div>
                  <button type="button" className="btn-contratar">
                    Contratar →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "var(--ink40)" }}>
            <Link href="/search">← Voltar para a busca</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
