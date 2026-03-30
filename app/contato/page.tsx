import type { Metadata } from "next";
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
          body: "Use a central de ajuda para demandas de pedidos em andamento ou ajustes de perfil.",
        },
        {
          heading: "Parcerias e comercial",
          body: "Para parcerias regionais e oportunidades comerciais, o canal de contato será integrado no backend.",
        },
      ]}
    />
  );
}
