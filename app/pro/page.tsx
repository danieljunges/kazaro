import type { Metadata } from "next";
import Link from "next/link";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Perfil Pro",
  description: `Plano de destaque para prestadores no ${SITE_NAME}, com renovacao a cada 30 dias.`,
  openGraph: {
    title: `Perfil Pro | ${SITE_NAME}`,
    description: "Mais visibilidade para prestadores que querem escalar atendimentos.",
    url: `${getSiteUrl()}/pro`,
    type: "website",
  },
  alternates: {
    canonical: `${getSiteUrl()}/pro`,
  },
};

const PRO_FEATURES = [
  "Selo Pro no perfil e em resultados de busca",
  "Prioridade de exibicao em categorias elegiveis",
  "Bloco de destaque para melhores avaliacoes",
  "Insights de desempenho para ajustar sua oferta",
];

export default function ProPage() {
  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/para-profissionais" backLabel="← Para profissionais" />
      <section className="section">
        <div className="pro-plan">
          <div className="pro-plan__left">
            <span className="sec-eyebrow">Plano para prestador</span>
            <h1 className="sec-title">
              Perfil Pro
              <br />
              por <em>30 dias</em>
            </h1>
            <p className="sec-sub">
              Um upgrade de visibilidade para quem quer acelerar captação de clientes. Sem fidelidade longa: ativa por
              30 dias e decide renovar conforme performance.
            </p>
            <ul className="pro-page-list">
              {PRO_FEATURES.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>

          <aside className="pro-plan__card">
            <div className="pro-plan__label">Assinatura mensal</div>
            <div className="pro-plan__price">
              R$ 79<span>/30 dias</span>
            </div>
            <p className="pro-plan__copy">Valor promocional de lancamento. Cancele quando quiser ao fim do ciclo.</p>
            <Link href="/dashboard" className="btn-cta pro-plan__cta">
              Ativar Perfil Pro agora →
            </Link>
            <p className="pro-plan__foot">Pagamento e recorrência serão conectados com Stripe na etapa backend.</p>
          </aside>
        </div>
      </section>
    </div>
  );
}
