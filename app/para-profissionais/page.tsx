import type { Metadata } from "next";
import Link from "next/link";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { fetchMyProfileRole } from "@/lib/supabase/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Para profissionais",
  description: `Cadastre seu perfil no ${SITE_NAME}, publique serviços e receba agendamentos de clientes em Florianópolis.`,
  openGraph: {
    title: `Para profissionais | ${SITE_NAME}`,
    description: "Perfil público, serviços com preço e agenda para quem trabalha com beleza e bem-estar.",
    url: `${getSiteUrl()}/para-profissionais`,
    type: "website",
  },
  alternates: {
    canonical: `${getSiteUrl()}/para-profissionais`,
  },
};

const BENEFITS = [
  "Perfil público com serviços, preços e agenda visível",
  "Pedidos e histórico com avaliação (portfolio por serviço em breve)",
  "Painel único para atendimento e organização",
];

const STEPS = [
  { title: "Crie seu perfil", desc: "Dados, foto, bairro ou estúdio e as categorias que você atende." },
  { title: "Monte seus serviços", desc: "Tempo, valor inicial e descrição: o cliente decide com clareza." },
  { title: "Receba agendamentos", desc: "Confirme horários, converse quando precisar e fortaleça a reputação." },
];

export default async function ParaProfissionaisPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let createProfileHref = "/criar-conta?tipo=prestador";
  if (user?.id) {
    const role = await fetchMyProfileRole(user.id);
    if (role === "admin") {
      createProfileHref = "/dashboard";
    } else if (role === "professional") {
      const { data: pro } = await supabase.from("professionals").select("id").eq("id", user.id).maybeSingle();
      createProfileHref = pro ? "/dashboard" : "/dashboard/ativar-perfil";
    }
  }

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
            <Link href={createProfileHref} className="btn-cta">
              Criar meu perfil →
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="pro-page-grid pro-page-grid--single">
          <div className="pro-page-card">
            <div className="pro-page-card__title">O que você leva na plataforma</div>
            <ul className="pro-page-list">
              {BENEFITS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
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
