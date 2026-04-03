import type { Metadata } from "next";
import Link from "next/link";
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
        {
          heading: "Falar com o time",
          body: "Dúvidas ou problemas com a plataforma: com login, use Suporte no dashboard para abrir um chamado.",
        },
      ]}
    >
      <p style={{ margin: 0, color: "var(--ink50)", lineHeight: 1.7 }}>
        <Link href="/entrar?next=/dashboard/suporte" className="auth-link">
          Entrar e abrir suporte
        </Link>
      </p>
    </InfoPage>
  );
}
