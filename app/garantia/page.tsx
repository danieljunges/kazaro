import type { Metadata } from "next";
import { InfoPage } from "@/components/kazaro/InfoPage";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Garantia Kazaro",
  description: `Entenda como funciona a garantia de atendimento do ${SITE_NAME}.`,
  alternates: { canonical: `${getSiteUrl()}/garantia` },
};

export default function GarantiaPage() {
  return (
    <InfoPage
      eyebrow="Confiança"
      title="Garantia Kazaro"
      subtitle="Se algo sair do combinado no atendimento, nossa equipe entra para mediar e orientar a solução."
      sections={[
        {
          heading: "Quando se aplica",
          body: "A garantia cobre divergências entre o serviço contratado no app e a execução entregue pelo prestador.",
        },
        {
          heading: "Como acionar",
          body: "Você abre o chamado na plataforma e seguimos um fluxo de análise com histórico do pedido e mensagens.",
        },
      ]}
    />
  );
}
