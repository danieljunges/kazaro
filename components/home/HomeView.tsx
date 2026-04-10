import Link from "next/link";
import type { ProfessionalCard } from "@/lib/professionals";
import { availBadge, proSurfaceClass, starsFromRatingPt } from "@/lib/home/spotlight-helpers";

const TRUST_LINE = [
  "Profissionais com verificação de antecedentes",
  "Agendamento com data e horário combinados",
  "Preços publicados no perfil",
  "Pagamento e suporte pelo Kazaro",
  "Barbearia, estética, beleza e arte na pele",
];

const SERVICES: { name: string; price: string; hint: string }[] = [
  {
    name: "Barbearia",
    price: "R$ 45",
    hint: "Corte, barba e acabamento: agenda o horário e chega sabendo o valor base.",
  },
  {
    name: "Manicure & nails",
    price: "R$ 65",
    hint: "Esmaltação, gel, alongamento de unha e nail art: duração e estilo combinados no perfil.",
  },
  {
    name: "Design de sobrancelha",
    price: "R$ 70",
    hint: "Design com pinça, henna, brow lamination ou micropigmentação: veja o estilo no perfil antes de agendar.",
  },
  {
    name: "Extensão de cílios",
    price: "R$ 120",
    hint: "Fio a fio, volume ou lifting, com manutenção programada: referências e tempo claros no perfil.",
  },
  {
    name: "Cabelo",
    price: "R$ 90",
    hint: "Corte, coloração, tratamentos e penteados com transparência de pacotes.",
  },
  {
    name: "Maquiagem",
    price: "R$ 150",
    hint: "Social, noiva ou editorial: prova e referências no perfil quando disponível.",
  },
  {
    name: "Tatuagem",
    price: "R$ 200",
    hint: "Flash, traço fino ou projeto maior: orçamento e referências alinhados no perfil.",
  },
  {
    name: "Podologia",
    price: "R$ 85",
    hint: "Cuidado com pés e unhas com foco em saúde e conforto, com horário reservado.",
  },
];

const HOW_STEPS: { num: string; title: string; desc: string }[] = [
  {
    num: "01",
    title: "Escolhe o estúdio",
    desc: "Perfil com foto, portfólio do trabalho, serviços com preço e avaliações, sem caixa-preta.",
  },
  {
    num: "02",
    title: "Reserva o horário",
    desc: "Agendamento com confirmação. Você sabe quem atende, quando e quanto custa o que combinaram.",
  },
  {
    num: "03",
    title: "Paga e avalia",
    desc: "Pagamento pelo app quando aplicável. Se algo fugir do combinado, o time do Kazaro ajuda a alinhar o próximo passo.",
  },
];

function PbCheck() {
  return (
    <div className="pb-check">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
        <polyline
          points="2,6 5,9 10,3"
          stroke="var(--lime, #0f766e)"
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
            <h1 className="hero-headline">O seu estilo merece quem entende o recado.</h1>
            <p className="hero-sub">
              Busque por serviço, veja preço no perfil e marque data e horário com tudo combinado na mesma conversa. Em
              Florianópolis, no seu ritmo.
            </p>
            <div className="hero-search-stack">
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
                  style={{ color: "#a8a29e", flexShrink: 0 }}
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input placeholder="O que você quer agendar?" aria-label="Buscar serviço" />
                <div className="search-sep" />
                <div className="search-loc">
                  <span className="loc-pin" aria-hidden>
                    ⦿
                  </span>
                  Florianópolis, SC
                </div>
              </div>
              <Link href="/search" className="hero-search-cta">
                Ver profissionais
              </Link>
            </div>
            <div className="hero-pills">
              <span className="pills-label">Em alta:</span>
              {(
                [
                  { label: "Barbearia", q: "barbearia" },
                  { label: "Manicure", q: "manicure" },
                  { label: "Sobrancelha", q: "sobrancelha" },
                  { label: "Cílios", q: "cilios" },
                  { label: "Cabelo", q: "cabeleireiro" },
                  { label: "Tatuagem", q: "tatuagem" },
                ] as const
              ).map(({ label, q }) => (
                <Link key={label} href={`/search?q=${encodeURIComponent(q)}`} className="pill">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-card-main">
              {featured ? (
                <div className="hcm-body hcm-body--spotlight">
                  <div className="hcm-photo-block">
                    {featured.avatarPublicUrl ? (
                      <img
                        src={featured.avatarPublicUrl}
                        alt=""
                        className="hcm-photo-main"
                        width={112}
                        height={112}
                      />
                    ) : (
                      <div className={`hcm-photo-fallback ${heroSurface}`} aria-hidden>
                        {featured.initials}
                      </div>
                    )}
                    {heroAvail ? <span className="hcm-avail-pill">{heroAvail.label}</span> : null}
                  </div>
                  <div className="hcm-name">{featured.name}</div>
                  <div className="hcm-role">{featured.roleLine}</div>
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
              ) : (
                <div className="hcm-body hcm-body--spotlight">
                  <div className="hcm-photo-block">
                    <div className="hcm-photo-fallback ph-green" aria-hidden>
                      K
                    </div>
                    <span className="hcm-avail-pill">Rede Kazaro</span>
                  </div>
                  <p className="sec-sub hcm-empty-copy">
                    Ainda não há perfis na vitrine. Se você atende em Florianópolis, pode ser o primeiro.
                  </p>
                  <div className="hcm-divider" />
                  <Link href="/para-profissionais" className="btn-ver hcm-empty-cta">
                    Criar perfil profissional →
                  </Link>
                </div>
              )}
            </div>
            <div className="float-badge">
              <div className="fb-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--lime, #0f766e)"
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
                Categorias que
                <br />
                <em>movem a cidade</em>
              </h2>
              <p className="sec-sub" style={{ marginTop: 14 }}>
                Valores de referência na região. Cada profissional detalha tempo, combos e, em breve, portfólio por serviço
                antes de você fechar.
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

      <div className="bg-white" id="como-funciona">
        <div className="section section--how">
          <div className="sec-eyebrow">Como funciona</div>
          <h2 className="sec-title">
            Três passos,
            <br />
            <em>direto ao ponto</em>
          </h2>
          <div className="how-grid">
            {HOW_STEPS.map((step) => (
              <div className="how-step" key={step.num}>
                <div className="how-num">{step.num}</div>
                <div className="how-step-body">
                  <div className="how-title">{step.title}</div>
                  <p className="how-desc">{step.desc}</p>
                </div>
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
                Estúdios e salões
                <br />
                <em>com reputação</em>
              </h2>
              <p className="sec-sub" style={{ marginTop: 14 }}>
                Quem aparece aqui passou por checagem e acumula avaliação de clientes na Ilha.
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
                <div className="pro-role">Barbearia · Trindade</div>
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
                    <div className="pro-price">R$ 45</div>
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
                <div className="pro-role">Manicure & nails · Córrego Grande</div>
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
                    <div className="pro-price">R$ 65</div>
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
                <div className="pro-role">Extensão de cílios · Lagoa da Conceição</div>
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
                    <div className="pro-price">R$ 120</div>
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
                &ldquo;Da escolha do profissional ao resultado: <em>transparência em cada etapa.</em>&rdquo;
              </div>
              <div className="why-attrib">Kazaro</div>
            </div>
            <div>
              <div className="sec-eyebrow">Por que o Kazaro</div>
              <h2 className="sec-title" style={{ fontSize: "clamp(28px, 3.5vw, 44px)", marginBottom: 32 }}>
                Beleza com ritmo
                <br />
                <em>de cidade grande</em>
              </h2>
              <div className="why-items">
                <div className="why-item">
                  <div className="wi-line" />
                  <div>
                    <div className="wi-title">Curadoria de perfis</div>
                    <div className="wi-desc">
                      Checagem e consistência entre o que está na vitrine e a experiência no atendimento.
                    </div>
                  </div>
                </div>
                <div className="why-item">
                  <div className="wi-line wi-line-lime" />
                  <div>
                    <div className="wi-title">Preço visível na vitrine</div>
                    <div className="wi-desc">
                      Valores de entrada e pacotes claros. O combinado no app é a referência até você aceitar qualquer
                      ajuste.
                    </div>
                  </div>
                </div>
                <div className="why-item">
                  <div className="wi-line wi-line-ink" />
                  <div>
                    <div className="wi-title">Suporte quando precisar</div>
                    <div className="wi-desc">
                      Time do Kazaro para alinhar divergências e próximos passos com agilidade.
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
              <div className="tc-score">Serviço: barbearia · 5/5</div>
              <p className="tc-text">
                &ldquo;Marquei pelo perfil, mesmo preço do anúncio e zero enrolação na hora do corte.&rdquo;
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
              <div className="tc-score">Serviço: manicure · 5/5</div>
              <p className="tc-text">
                &ldquo;Consegui ver o trabalho no perfil antes de fechar. A unha ficou igual à referência.&rdquo;
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
              <div className="tc-score">Serviço: extensão de cílios · 5/5</div>
              <p className="tc-text">
                &ldquo;Fio a fio exatamente como combinei no perfil; manutenção fácil de remarcar.&rdquo;
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
              Você é
              <br />
              beleza ou
              <br />
              barbearia?
              <br />
              <em>Mostra o teu trabalho.</em>
            </h2>
            <p className="pb-sub">
              Perfil público com serviços, agenda e reputação, com foco em estética, barbearia e arte na pele na região.
            </p>
          </div>
          <div className="pb-right">
            <div className="pb-lines">
              <div className="pb-line">
                <PbCheck />
                Cadastro sem custo para novos profissionais
              </div>
              <div className="pb-line">
                <PbCheck />
                Condições comerciais favoráveis nos primeiros 90 dias
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
