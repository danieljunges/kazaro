import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/kazaro/InfoPage";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contato",
  description: `Fale com o time do ${SITE_NAME}.`,
  alternates: { canonical: `${getSiteUrl()}/contato` },
};

export default function ContatoPage() {
  return (
    <InfoPage
      eyebrow="Atendimento"
      title="Fale com a equipe Kazaro"
      subtitle="Atendimento para clientes, prestadores e parceiros comerciais."
      sections={[
        {
          heading: "Suporte operacional",
          body: "Com conta no Kazaro, abra um chamado no painel (menu Suporte). A equipe responde por lá e você pode receber e-mail quando houver retorno.",
        },
        {
          heading: "Parcerias e comercial",
          body: "Para parcerias regionais e oportunidades comerciais, o canal de contato será integrado no backend.",
        },
      ]}
    >
      <p style={{ margin: 0, color: "var(--ink50)", lineHeight: 1.7 }}>
        Já tem conta?{" "}
        <Link href="/dashboard/suporte" className="auth-link">
          Abrir suporte no painel
        </Link>{" "}
        (é preciso estar logado). Sem conta,{" "}
        <Link href="/entrar?next=/dashboard/suporte" className="auth-link">
          entre
        </Link>{" "}
        ou{" "}
        <Link href="/criar-conta" className="auth-link">
          crie uma
        </Link>
        .
      </p>
    </InfoPage>
  );
}
