import { getSiteUrl, INSTAGRAM_URL, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

/** JSON-LD da home: organização, site e busca (rich results / Discover). */
export function HomeJsonLd() {
  const base = getSiteUrl();
  const graph = [
    {
      "@type": "Organization",
      "@id": `${base}/#organization`,
      name: SITE_NAME,
      url: base,
      description: SITE_DESCRIPTION,
      sameAs: [INSTAGRAM_URL],
    },
    {
      "@type": "WebSite",
      "@id": `${base}/#website`,
      name: SITE_NAME,
      url: base,
      description: SITE_DESCRIPTION,
      inLanguage: "pt-BR",
      publisher: { "@id": `${base}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${base}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];

  const payload = { "@context": "https://schema.org", "@graph": graph };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
