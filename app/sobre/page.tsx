import type { Metadata } from "next";
import { InfoPage } from "@/components/kazaro/InfoPage";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre o Kazaro",
  description: `Conheça a visão e a proposta do ${SITE_NAME}.`,
  alternates: { canonical: `${getSiteUrl()}/sobre` },
};

export default function SobrePage() {
  return (
    <InfoPage
      eyebrow="Empresa"
      title="Sobre o Kazaro"
      subtitle="Marketplace de serviços para casa com foco em clareza de preço, confiança e experiência de ponta."
      sections={[
        {
          heading: "Nossa proposta",
          body: "Conectar clientes e prestadores com um fluxo simples: descobrir, comparar, contratar e avaliar.",
        },
        {
          heading: "Como fazemos",
          body: "Combinamos design editorial, curadoria de perfis e produto orientado a desempenho real de serviço.",
        },
      ]}
    />
  );
}
