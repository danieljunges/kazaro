import type { Metadata } from "next";
import Link from "next/link";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { fetchMyProfileRole } from "@/lib/supabase/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

const url = `${getSiteUrl()}/convite`;

export const metadata: Metadata = {
  title: "Convite para profissionais",
  description:
    "Entenda em poucos minutos como o Kazaro ajuda profissionais de beleza em Florianópolis: vitrine com preço, agenda e menos ida e volta no direct.",
  openGraph: {
    title: `Convite para profissionais | ${SITE_NAME}`,
    description:
      "Vitrine pública, serviços com valor e agendamento organizado. Feito para quem cansa de responder o mesmo preço no WhatsApp.",
    url,
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
  },
  alternates: { canonical: url },
  robots: { index: true, follow: true },
};

const PAINS = [
  "Várias mensagens no direct só para descobrir se você atende e quanto custa.",
  "Cliente sem contexto: você explica tudo de novo a cada conversa.",
  "Agenda espalhada entre stories, planilha e coração, sem um lugar único para fechar horário.",
];

const WINS = [
  "Perfil público com o que você faz, fotos e valores visíveis antes do contato.",
  "Cliente chega com intenção: já viu serviço, faixa de preço e pode seguir para o agendamento.",
  "Painel para organizar pedidos, histórico e avaliações em um só fluxo.",
  "Curadoria: serviços novos passam por análise antes de ir para a vitrine pública; há selo de perfil verificado após esse fluxo.",
];

const STEPS = [
  { title: "Crie sua conta de prestador", desc: "Nome, foto, cidade e as categorias que você atende em Florianópolis." },
  {
    title: "Publique seus serviços",
    desc: "Tempo, valor e descrição: quem busca entende na hora o que está contratando. Cada serviço novo entra em análise; aprovado, aparece no perfil público com preço para agendamento.",
  },
  {
    title: "Receba e confirme pedidos",
    desc: "Você confirma horário, prefira alinhar pelo chat do Kazaro (fica o histórico) e fortalece sua reputação com avaliações após o atendimento.",
  },
];

export default async function ConviteProfissionaisPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let ctaHref = "/criar-conta?tipo=prestador&ref=convite";
  let ctaLabel = "Quero criar meu perfil";
  if (user?.id) {
    const role = await fetchMyProfileRole(user.id);
    if (role === "admin") {
      ctaHref = "/dashboard";
      ctaLabel = "Ir para o painel";
    } else if (role === "professional") {
      const { data: pro } = await supabase.from("professionals").select("id").eq("id", user.id).maybeSingle();
      ctaHref = pro ? "/dashboard" : "/dashboard/ativar-perfil";
      ctaLabel = pro ? "Abrir meu painel" : "Ativar meu perfil";
    }
  }

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/" backLabel="← Início" />
      <section className="pro-page-hero">
        <div className="pro-page-hero__inner">
          <span className="sec-eyebrow">Leitura rápida</span>
          <h1 className="sec-title">
            Menos &quot;quanto custa?&quot; no direct.
            <br />
            Mais <em>cliente informado</em> na hora de agendar.
          </h1>
          <p className="sec-sub">
            O {SITE_NAME} é uma vitrine com agenda para profissionais de beleza e bem-estar em Florianópolis. Você
            mostra serviço e preço com clareza. Quem entra já sabe o básico e você ganha tempo para trabalhar.
          </p>
          <div className="pro-page-hero__actions">
            <Link href={ctaHref} className="btn-cta">
              {ctaLabel} →
            </Link>
            <p className="convite-hero-note">
              Leva poucos minutos. Se preferir só explorar, role a página e leia na ordem.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="sec-header">
          <div>
            <span className="sec-eyebrow">Se isso é familiar</span>
            <h2 className="sec-title">
              A gente montou o produto
              <br />
              <em>pensando nisso</em>
            </h2>
          </div>
        </div>
        <div className="pro-page-grid pro-page-grid--single">
          <div className="pro-page-card pro-page-card--ink">
            <ul className="pro-page-list">
              {PAINS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sec-header">
          <div>
            <span className="sec-eyebrow">O que muda na prática</span>
            <h2 className="sec-title">
              Vitrine pública,
              <br />
              <em>agenda no mesmo lugar</em>
            </h2>
          </div>
        </div>
        <div className="pro-page-grid pro-page-grid--single">
          <div className="pro-page-card">
            <div className="pro-page-card__title">O que você leva no {SITE_NAME}</div>
            <ul className="pro-page-list">
              {WINS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="sec-header">
          <div>
            <span className="sec-eyebrow">Como funciona</span>
            <h2 className="sec-title">
              Três passos,
              <br />
              <em>sem complicação</em>
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

      <section className="section bg-white convite-cta-strip">
        <div className="pro-page-hero__inner convite-cta-inner">
          <h2 className="sec-title convite-cta-title">Pronta para testar no seu ritmo?</h2>
          <p className="sec-sub convite-cta-sub">
            Abre o cadastro, monta um serviço com preço e vê como fica na vitrine. Se não fizer sentido, você para por
            aí.
          </p>
          <Link href={ctaHref} className="btn-cta">
            {ctaLabel} →
          </Link>
          <p className="convite-footer-links">
            <Link href="/para-profissionais">Versão completa da área do prestador</Link>
            {" · "}
            <Link href="/termos">Termos de uso</Link>
            {" · "}
            <Link href="/contato">Falar com o time</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
