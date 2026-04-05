import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { InfoPage } from "@/components/kazaro/InfoPage";
import {
  getSiteUrl,
  INSTAGRAM_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/site";

const url = `${getSiteUrl()}/blog`;

const blogDescription =
  "Artigos e guias sobre contratação de serviços para casa em Florianópolis, precificação e reputação para prestadores no Kazaro.";

export const metadata: Metadata = {
  title: "Blog",
  description: blogDescription,
  keywords: [
    "blog serviços para casa",
    "dicas encanador eletricista",
    "prestador de serviços Florianópolis",
    "reputação online profissional",
    "marketplace serviços",
    SITE_NAME,
  ],
  authors: [{ name: SITE_NAME, url: getSiteUrl() }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url,
    siteName: SITE_NAME,
    title: `Blog — dicas para clientes e prestadores | ${SITE_NAME}`,
    description: blogDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `Blog | ${SITE_NAME}`,
    description: blogDescription,
  },
  alternates: {
    canonical: url,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BlogPage() {
  const site = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site}/#organization`,
        name: SITE_NAME,
        url: site,
        description: SITE_DESCRIPTION,
        sameAs: [INSTAGRAM_URL],
      },
      {
        "@type": "Blog",
        "@id": `${url}#blog`,
        name: `Blog ${SITE_NAME}`,
        description: blogDescription,
        url,
        inLanguage: "pt-BR",
        publisher: { "@id": `${site}/#organization` },
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: site },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `Blog | ${SITE_NAME}`,
        description: blogDescription,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: site },
        inLanguage: "pt-BR",
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: SITE_NAME, item: site },
            { "@type": "ListItem", position: 2, name: "Blog", item: url },
          ],
        },
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
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
    </>
  );
}
