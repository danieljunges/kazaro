import type { Metadata } from "next";
import { InfoPage } from "@/components/kazaro/InfoPage";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Central de ajuda",
  description: `Suporte e respostas rápidas para usar o ${SITE_NAME}.`,
  alternates: { canonical: `${getSiteUrl()}/ajuda` },
};

export default function AjudaPage() {
  return (
    <InfoPage
      eyebrow="Suporte"
      title="Central de ajuda"
      subtitle="Dúvidas sobre agendamento, pagamento, avaliações e perfil profissional."
      sections={[
        {
          heading: "Pedidos e agendamentos",
          body: "Acompanhe status do pedido, reagende horários e consulte detalhes do serviço contratado.",
        },
        {
          heading: "Conta e reputação",
          body: "Saiba como avaliações funcionam e como resolver divergências com mediação da equipe Kazaro.",
        },
      ]}
    />
  );
}
