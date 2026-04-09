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
      subtitle="Plataforma de agendamento e vitrine para barbearia, estética e beleza em Florianópolis, com foco em preço claro, confiança e experiência digna de estúdio."
      sections={[
        {
          heading: "Nossa proposta",
          body: "Conectar quem quer agendar um procedimento a profissionais com perfil transparente: serviços, valores e reputação visíveis antes de fechar.",
        },
        {
          heading: "Como fazemos",
          body: "Design editorial, curadoria de perfis e produto pensado para o ritmo de salões, barbearias e estúdios, sem diluir em categorias genéricas.",
        },
      ]}
    />
  );
}
