import type { Metadata } from "next";
import { InfoPage } from "@/components/kazaro/InfoPage";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description: `Conteúdos e dicas para clientes e prestadores no ${SITE_NAME}.`,
  alternates: { canonical: `${getSiteUrl()}/blog` },
};

export default function BlogPage() {
  return (
    <InfoPage
      eyebrow="Conteúdo"
      title="Blog Kazaro"
      subtitle="Guias práticos para contratar melhor e para prestadores melhorarem operação, reputação e receita."
      sections={[
        {
          heading: "Para clientes",
          body: "Checklists de contratação, estimativa de valores e boas práticas para evitar surpresas.",
        },
        {
          heading: "Para prestadores",
          body: "Estratégias de perfil, precificação e atendimento para gerar recorrência e avaliações 5 estrelas.",
        },
      ]}
    />
  );
}
