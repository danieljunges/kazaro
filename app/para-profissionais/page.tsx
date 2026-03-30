import type { Metadata } from "next";
import Link from "next/link";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Para profissionais",
  description: `Cadastre seu perfil profissional no ${SITE_NAME} e receba pedidos na sua região.`,
  openGraph: {
    title: `Para profissionais — ${SITE_NAME}`,
    description: "Ganhe visibilidade, organize pedidos e evolua sua reputação local.",
    url: `${getSiteUrl()}/para-profissionais`,
    type: "website",
  },
  alternates: {
    canonical: `${getSiteUrl()}/para-profissionais`,
  },
};

const BENEFITS = [
  "Perfil público com serviços, preços e agenda visível",
  "Recebimento de pedidos com histórico e avaliação",
  "Gestão de atendimento em um painel único",
];

const STEPS = [
  { title: "Crie seu perfil", desc: "Dados básicos, foto, bairros atendidos e tipos de serviço." },
  { title: "Defina valores", desc: "Informe preço inicial por serviço para gerar confiança no cliente." },
  { title: "Comece a receber", desc: "Aceite pedidos, converse no chat e construa reputação." },
];

export default function ParaProfissionaisPage() {
  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/" backLabel="← Início" />
      <section className="pro-page-hero">
        <div className="pro-page-hero__inner">
          <span className="sec-eyebrow">Área do prestador</span>
          <h1 className="sec-title">
            Transforme sua agenda
            <br />
            em um <em>negócio recorrente</em>
          </h1>
          <p className="sec-sub">
            O Kazaro conecta profissionais a clientes com intenção real de contratação. Você entra com qualidade de
            serviço e a plataforma ajuda com exposição, organização e reputação.
          </p>
          <div className="pro-page-hero__actions">
            <Link href="/dashboard" className="btn-cta">
              Criar meu perfil →
            </Link>
            <Link href="/pro" className="btn-ghost">
              Ver Perfil Pro (30 dias)
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="pro-page-grid">
          <div className="pro-page-card">
            <div className="pro-page-card__title">O que voce ja leva no plano base</div>
            <ul className="pro-page-list">
              {BENEFITS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="pro-page-card pro-page-card--ink">
            <div className="pro-page-card__title">Destaque com Perfil Pro</div>
            <p className="pro-page-card__text">
              Maior presença em resultados, selo visual diferenciado e foco em profissionais com melhor experiência de
              atendimento.
            </p>
            <Link href="/pro" className="btn-white">
              Quero destacar meu perfil
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sec-header">
          <div>
            <span className="sec-eyebrow">Como entrar</span>
            <h2 className="sec-title">
              Cadastro simples,
              <br />
              <em>resultado claro</em>
            </h2>
          </div>
        </div>
        <div className="how-grid">
          {STEPS.map((step, index) => (
            <div key={step.title}>
              <div className="how-num">{`0${index + 1}`}</div>
              <div className="how-title">{step.title}</div>
              <p className="how-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
