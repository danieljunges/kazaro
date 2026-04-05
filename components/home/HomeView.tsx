import Link from "next/link";
import type { ProfessionalCard } from "@/lib/professionals";
import { availBadge, proSurfaceClass, starsFromRatingPt } from "@/lib/home/spotlight-helpers";

const TRUST_LINE = [
  "Profissionais com verificação de antecedentes",
  "Valor combinado antes do serviço",
  "Média 4,8 em avaliações",
  "Suporte e mediação pelo Kazaro",
  "Preços transparentes no perfil",
];

const SERVICES: { name: string; price: string; hint: string }[] = [
  {
    name: "Encanamento",
    price: "R$ 120",
    hint: "Vazamento, troca de torneira, desentupimento: o que aparece no dia a dia.",
  },
  {
    name: "Elétrica",
    price: "R$ 90",
    hint: "Tomadas, disjuntor, lâmpadas e pequenos reparos sem surpresa na conta.",
  },
  {
    name: "Limpeza",
    price: "R$ 130",
    hint: "Residência ou temporada: rotina sob medida para o seu imóvel na Ilha.",
  },
  {
    name: "Montagem de móveis",
    price: "R$ 80",
    hint: "Montador vai até você, ideal depois de compra ou mudança.",
  },
  {
    name: "Pintura",
    price: "R$ 200",
    hint: "Cômodo ou apartamento completo, com orçamento fechado antes de começar.",
  },
  {
    name: "Frete e mudança",
    price: "R$ 180",
    hint: "Carreto local, retirada em loja e pequenas mudanças com agendamento rápido.",
  },
  {
    name: "Ar-condicionado",
    price: "R$ 160",
    hint: "Instalação, manutenção e limpeza técnica para split residencial.",
  },
];

const HOW_STEPS: { num: string; title: string; desc: string }[] = [
  {
    num: "01",
    title: "Escolha com calma",
    desc: "Perfil com histórico, preço por tipo de serviço e disponibilidade real, sem pressa de chat genérico ou formulário interminável.",
  },
  {
    num: "02",
    title: "Combine data e horário",
    desc: "Reserva com confirmação do profissional. Você sabe quem vem, quando vem e quanto vai pagar antes de qualquer compromisso.",
  },
  {
    num: "03",
    title: "Pague e avalie",
    desc: "Pagamento pelo app. Se algo fugir do combinado, nosso time te ajuda a resolver com agilidade.",
  },
];

function PbCheck() {
  return (
    <div className="pb-check">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
        <polyline
          points="2,6 5,9 10,3"
          stroke="#158c79"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function HomeView({
  spotlightPros,
  proTotalListed,
}: {
  spotlightPros: ProfessionalCard[];
  /** Total de linhas em `professionals` (para estatística na faixa). */
  proTotalListed: number;
}) {
  const trustLoop = [...TRUST_LINE, ...TRUST_LINE];
  const featured = spotlightPros[0];
  const gridPros = spotlightPros.slice(0, 6);
  const heroAvail = featured ? availBadge(featured.avail) : null;
  const heroSurface = featured ? proSurfaceClass(featured.phClass) : "ph-green";

  return (
    <>
      <section>
        <div className="hero">
          <div>
            <h1 className="hero-headline">
              O profissional
              <br />
              certo para o
              <br />
              seu <em>lar.</em>
            </h1>
            <p className="hero-sub">
              Serviços para casa com transparência: perfis revisados, preços claros e profissionais pontuais.
            </p>
            <div className="search-wrap">
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
              <input placeholder="Qual serviço você precisa?" aria-label="Buscar serviço" />
              <div className="search-sep" />
              <div className="search-loc">
                <span className="loc-pin" aria-hidden>
                  ⦿
                </span>
                Florianópolis, SC
              </div>
              <Link href="/search" className="search-btn">
                Buscar
              </Link>
            </div>
            <div className="hero-pills">
              <span className="pills-label">Em alta:</span>
              {["Encanador", "Eletricista", "Faxina", "Frete", "Ar-condicionado", "Jardinagem"].map((p) => (
                <Link key={p} href="/search" className="pill">
                  {p}
                </Link>
              ))}
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-card-main">
              {featured ? (
                <>
                  <div className="hcm-img">
                    <div className={`hcm-img-placeholder ${heroSurface}`}>
                      <span className="avail-tag">{heroAvail?.label}</span>
                    </div>
                  </div>
                  <div className="hcm-body">
                    <div className="hcm-top">
                      <div className="hcm-ava-fallback" aria-hidden>
                        {featured.initials}
                      </div>
                      <div>
                        <div className="hcm-name">{featured.name}</div>
                        <div className="hcm-role">{featured.roleLine}</div>
                      </div>
                    </div>
                    <div className="hcm-stars">
                      <span className="stars">{starsFromRatingPt(featured.rating)}</span>
                      <span className="hcm-rating">{featured.rating}</span>
                      <span className="hcm-count">· {featured.reviewsCount} avaliações</span>
                    </div>
                    <div className="hcm-divider" />
                    <div className="hcm-footer">
                      <div>
                        <div className="hcm-price-label">a partir de</div>
                        <div className="hcm-price">{featured.price}</div>
                      </div>
                      <Link href={`/profissional/${featured.slug}`} className="btn-ver">
                        Ver perfil →
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="hcm-img">
                    <div className="hcm-img-placeholder ph-green">
                      <span className="avail-tag">Rede Kazaro</span>
                    </div>
                  </div>
                  <div className="hcm-body">
                    <p className="sec-sub" style={{ margin: 0, lineHeight: 1.55 }}>
                      Ainda não há perfis públicos na vitrine. Se você presta serviço em Florianópolis, pode ser o primeiro a
                      aparecer aqui.
                    </p>
                    <div className="hcm-divider" style={{ margin: "16px 0" }} />
                    <Link href="/para-profissionais" className="btn-ver" style={{ width: "100%", justifyContent: "center" }}>
                      Criar perfil profissional →
                    </Link>
                  </div>
                </>
              )}
            </div>
            <div className="float-badge">
              <div className="fb-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#158c79"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <div className="fb-label">Garantia Kazaro</div>
                <div className="fb-sub">Suporte dedicado se divergir</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="trust-bar">
        <div className="trust-scroll">
          {trustLoop.map((text, i) => (
            <div key={`${text}-${i}`} className="trust-item">
              <div className="trust-dot" />
              {text}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white" id="servicos">
        <div className="section">
          <div className="sec-header">
            <div>
              <div className="sec-eyebrow">Na prática</div>
              <h2 className="sec-title">
                O que mais pedem
                <br />
                <em>por aqui</em>
              </h2>
              <p className="sec-sub" style={{ marginTop: 14 }}>
                Valores de entrada para Floripa: cada profissional fecha o detalhe no perfil, antes de você comprometer.
              </p>
            </div>
            <Link className="link-arrow" href="/search">
              Ver tudo na busca →
            </Link>
          </div>
          <div className="services-rail">
            {SERVICES.map((s, i) => (
              <Link key={s.name} href="/search" className="rail-row">
                <span className="rail-idx">{String(i + 1).padStart(2, "0")}</span>
                <div className="rail-main">
                  <div className="rail-name">{s.name}</div>
                  <div className="rail-hint">{s.hint}</div>
                </div>
                <div className="rail-price">
                  <span className="rail-from">a partir de</span>
                  <div className="rail-val">{s.price}</div>
                </div>
                <span className="rail-go" aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div id="como-funciona">
        <div className="section">
          <div className="sec-eyebrow">Como funciona</div>
          <h2 className="sec-title">
            Três passos,
            <br />
            <em>direto ao ponto</em>
          </h2>
          <div className="how-grid">
            {HOW_STEPS.map((step) => (
              <div key={step.num}>
                <div className="how-num">{step.num}</div>
                <div className="how-title">{step.title}</div>
                <p className="how-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="section">
          <div className="sec-header">
            <div>
              <div className="sec-eyebrow">Quem está na rede</div>
              <h2 className="sec-title">
                Profissionais com
                <br />
                <em>histórico na cidade</em>
              </h2>
              <p className="sec-sub" style={{ marginTop: 14 }}>
                Quem aparece aqui passou por checagem e tem avaliação de quem mora ou aluga na região.
              </p>
            </div>
            <Link className="link-arrow" href="/search">
              Ver lista completa →
            </Link>
          </div>
          <div className="pros-grid">
            <Link href="/profissional/carlos-eduardo-machado" className="pro-card">
              <div className="pro-img-placeholder ph-green">
                CM
                <span className="pro-avail avail-today">Disponível hoje</span>
              </div>
              <div className="pro-body">
                <div className="pro-name">Carlos Eduardo Machado</div>
                <div className="pro-role">Encanador · Trindade</div>
                <div className="pro-meta">
                  <span className="pro-rating">4,9</span>
                  <span className="sep">·</span>
                  <span>127 avaliações</span>
                  <span className="sep">·</span>
                  <span className="pro-verified">Verificado</span>
                </div>
                <div className="pro-divider" />
                <div className="pro-footer">
                  <div>
                    <div className="pro-price-label">a partir de</div>
                    <div className="pro-price">R$ 120</div>
                  </div>
                  <span className="btn-perfil">Perfil</span>
                </div>
              </div>
            </Link>
            <Link href="/profissional/rodrigo-bittencourt" className="pro-card">
              <div className="pro-img-placeholder ph-blue">
                RB
                <span className="pro-avail avail-today">Disponível hoje</span>
              </div>
              <div className="pro-body">
                <div className="pro-name">Rodrigo Bittencourt</div>
                <div className="pro-role">Eletricista · Córrego Grande</div>
                <div className="pro-meta">
                  <span className="pro-rating">4,8</span>
                  <span className="sep">·</span>
                  <span>89 avaliações</span>
                  <span className="sep">·</span>
                  <span className="pro-verified">Verificado</span>
                </div>
                <div className="pro-divider" />
                <div className="pro-footer">
                  <div>
                    <div className="pro-price-label">a partir de</div>
                    <div className="pro-price">R$ 150</div>
                  </div>
                  <span className="btn-perfil">Perfil</span>
                </div>
              </div>
            </Link>
            <Link href="/profissional/ana-paula-ferreira" className="pro-card">
              <div className="pro-img-placeholder ph-amber">
                AP
                <span className="pro-avail avail-tom">Disponível amanhã</span>
              </div>
              <div className="pro-body">
                <div className="pro-name">Ana Paula Ferreira</div>
                <div className="pro-role">Limpeza · Lagoa da Conceição</div>
                <div className="pro-meta">
                  <span className="pro-rating">5,0</span>
                  <span className="sep">·</span>
                  <span>203 avaliações</span>
                  <span className="sep">·</span>
                  <span className="pro-verified">Verificado</span>
                </div>
                <div className="pro-divider" />
                <div className="pro-footer">
                  <div>
                    <div className="pro-price-label">a partir de</div>
                    <div className="pro-price">R$ 150</div>
                  </div>
                  <span className="btn-perfil">Perfil</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="stat-bar">
        <div className="stat-inner">
          <div className="stat-item">
            <div className="stat-num">
              4<span>,8</span>
            </div>
            <div className="stat-label">
              Média de avaliação
              <br />
              na plataforma
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-num">
              {proTotalListed > 0 ? (
                <>
                  +<span>{proTotalListed}</span>
                </>
              ) : (
                <>
                  +<span>0</span>
                </>
              )}
            </div>
            <div className="stat-label">
              Profissionais
              <br />
              na plataforma
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-num">
              +<span>40</span>
            </div>
            <div className="stat-label">
              Bairros atendidos
              <br />
              em Florianópolis
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-num">
              0<span>%</span>
            </div>
            <div className="stat-label">
              Custo de cadastro
              <br />
              para profissionais
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="section">
          <div className="why-grid">
            <div className="why-visual">
              <div className="why-quote">
                &ldquo;Do pedido ao serviço feito: <em>clareza em cada etapa.</em>&rdquo;
              </div>
              <div className="why-attrib">Kazaro</div>
            </div>
            <div>
              <div className="sec-eyebrow">Por que o Kazaro</div>
              <h2 className="sec-title" style={{ fontSize: "clamp(28px, 3.5vw, 44px)", marginBottom: 32 }}>
                Ambição de cidade,
                <br />
                <em>execução de produto</em>
              </h2>
              <div className="why-items">
                <div className="why-item">
                  <div className="wi-line" />
                  <div>
                    <div className="wi-title">Curadoria de perfis</div>
                    <div className="wi-desc">
                      Checagem documental e consistência entre o anunciado e o entregue no serviço.
                    </div>
                  </div>
                </div>
                <div className="why-item">
                  <div className="wi-line wi-line-lime" />
                  <div>
                    <div className="wi-title">Preço alinhado no perfil</div>
                    <div className="wi-desc">
                      O valor combinado no app é a referência. Alterações só com o seu aceite explícito.
                    </div>
                  </div>
                </div>
                <div className="why-item">
                  <div className="wi-line wi-line-ink" />
                  <div>
                    <div className="wi-title">Mediação e suporte</div>
                    <div className="wi-desc">
                      Time local para resolver divergências e orientar próximos passos com agilidade.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="section">
          <div className="sec-eyebrow">Depoimentos</div>
          <h2 className="sec-title">
            Quem já usou
            <br />
            <em>por aqui</em>
          </h2>
          <div className="testim-grid">
            <div className="testim-card">
              <div className="tc-score">Serviço: elétrica · 5/5</div>
              <p className="tc-text">
                &ldquo;Eletricista em menos de uma hora, pontual e com o mesmo valor do perfil.&rdquo;
              </p>
              <div className="tc-author">
                <div className="tc-initial">M</div>
                <div>
                  <div className="tc-name">Mariana S.</div>
                  <div className="tc-info">Trindade</div>
                </div>
              </div>
            </div>
            <div className="testim-card">
              <div className="tc-score">Serviço: limpeza · 5/5</div>
              <p className="tc-text">
                &ldquo;Uso no apartamento de temporada: padrão alto e casa sempre pronta para hóspedes.&rdquo;
              </p>
              <div className="tc-author">
                <div className="tc-initial">P</div>
                <div>
                  <div className="tc-name">Pedro M.</div>
                  <div className="tc-info">Campeche</div>
                </div>
              </div>
            </div>
            <div className="testim-card">
              <div className="tc-score">Serviço: pintura · 5/5</div>
              <p className="tc-text">
                &ldquo;Acabamento impecável e prazo cumprido. Resolver obra ficou objetivo.&rdquo;
              </p>
              <div className="tc-author">
                <div className="tc-initial">R</div>
                <div>
                  <div className="tc-name">Renata B.</div>
                  <div className="tc-info">Lagoa da Conceição</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pro-banner" id="profissionais">
        <div className="pb-inner">
          <div>
            <h2 className="pb-heading">
              Presta serviço
              <br />
              na região?
              <br />
              Seu próximo cliente
              <br />
              <em>pode ser aqui.</em>
            </h2>
            <p className="pb-sub">
              Ferramentas para pedidos, reputação e visibilidade junto a moradores da sua região.
            </p>
          </div>
          <div className="pb-right">
            <div className="pb-lines">
              <div className="pb-line">
                <PbCheck />
                Sem custo de cadastro para novos profissionais
              </div>
              <div className="pb-line">
                <PbCheck />
                Taxa da plataforma reduzida nos primeiros 90 dias
              </div>
              <div className="pb-line">
                <PbCheck />
                Selo de perfil verificado após análise
              </div>
            </div>
            <Link href="/para-profissionais" className="btn-white">
              Criar perfil profissional →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
