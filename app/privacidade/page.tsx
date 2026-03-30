import type { Metadata } from "next";
import { InfoPage } from "@/components/kazaro/InfoPage";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: `Política de privacidade da plataforma ${SITE_NAME}.`,
  alternates: { canonical: `${getSiteUrl()}/privacidade` },
};

export default function PrivacidadePage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Política de privacidade"
      subtitle="Transparência sobre coleta, uso e proteção de dados pessoais na plataforma."
      sections={[
        {
          heading: "Dados coletados",
          body: "Coletamos informações essenciais para cadastro, contratação de serviços e segurança da operação.",
        },
        {
          heading: "Uso e proteção",
          body: "Dados são utilizados para operação da plataforma, suporte e melhoria de experiência, com medidas de segurança.",
        },
      ]}
    />
  );
}
