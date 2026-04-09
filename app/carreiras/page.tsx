import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/kazaro/InfoPage";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Carreiras",
  description: `Trabalhe com o time do ${SITE_NAME}. Vagas e cultura.`,
  alternates: { canonical: `${getSiteUrl()}/carreiras` },
  openGraph: {
    title: `Carreiras | ${SITE_NAME}`,
    description: "Conheça o Kazaro e acompanhe oportunidades futuras.",
    url: `${getSiteUrl()}/carreiras`,
    type: "website",
  },
};

export default function CarreirasPage() {
  return (
    <InfoPage
      eyebrow="Time"
      title="Carreiras no Kazaro"
      subtitle="Quer construir com a gente um marketplace de serviços mais humano e confiável? Fique de olho nesta página."
      sections={[
        {
          heading: "Vagas abertas",
          body: "No momento não temos posições abertas. Quando houver oportunidades, divulgaremos aqui com descrição do papel e como se candidatar.",
        },
        {
          heading: "Enquanto isso",
          body: "Se quiser deixar seu interesse registrado ou falar sobre parcerias, use o canal de contato. Assim conseguimos te avisar quando surgir algo alinhado ao seu perfil.",
        },
      ]}
    >
      <p style={{ margin: 0, color: "var(--ink50)", lineHeight: 1.7 }}>
        <Link href="/contato" className="auth-link">
          Ir para contato
        </Link>
        {" · "}
        <Link href="/sobre" className="auth-link">
          Sobre o Kazaro
        </Link>
      </p>
    </InfoPage>
  );
}
