import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { getAllBlogPostsSorted } from "@/lib/blog/posts";
import {
  getSiteUrl,
  INSTAGRAM_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/site";

const url = `${getSiteUrl()}/blog`;

const blogDescription =
  "Guias sobre contratação local, precificação e reputação para profissionais: acervo Kazaro com foco crescente em beleza, barbearia e estética em Florianópolis.";

export const metadata: Metadata = {
  title: "Blog",
  description: blogDescription,
  keywords: [
    "blog barbearia Florianópolis",
    "dicas salão beleza",
    "prestador serviços Florianópolis",
    "reputação online profissional",
    "agendamento beleza",
    SITE_NAME,
  ],
  authors: [{ name: SITE_NAME, url: getSiteUrl() }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url,
    siteName: SITE_NAME,
    title: `Blog: guias para clientes e profissionais | ${SITE_NAME}`,
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

function categoryLabel(c: "clientes" | "prestadores") {
  return c === "clientes" ? "Clientes" : "Prestadores";
}

export default function BlogPage() {
  const site = getSiteUrl();
  const posts = getAllBlogPostsSorted();

  const itemListElements = posts.map((post, i) => ({
    "@type": "ListItem" as const,
    position: i + 1,
    name: post.title,
    url: `${site}/blog/${post.slug}`,
  }));

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
        blogPost: posts.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: `${site}/blog/${p.slug}`,
          datePublished: `${p.publishedAt}T08:00:00-03:00`,
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${url}#itemlist`,
        name: `Artigos do blog ${SITE_NAME}`,
        numberOfItems: posts.length,
        itemListElement: itemListElements,
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
      <div className="home-editorial public-page">
        <CompactNav backHref="/" backLabel="← Início" />
        <div className="section">
          <div style={{ maxWidth: 780 }}>
            <span className="sec-eyebrow">Conteúdo</span>
            <h1 className="sec-title" style={{ marginBottom: 14 }}>
              Blog Kazaro
            </h1>
            <p className="sec-sub" style={{ maxWidth: 680, marginBottom: 8 }}>
              {posts.length} artigos com dicas para quem contrata na cidade e para profissionais que querem perfil forte, preço
              claro e avaliações reais. O Kazaro hoje é vitrine e agenda para beleza e barbearia.
            </p>
          </div>
          <div className="pro-page-card" style={{ maxWidth: 860 }}>
            <div className="kz-blog-filters" aria-hidden>
              <span className="kz-blog-filter">Guias por tema</span>
            </div>
            <div className="kz-blog-list">
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="kz-blog-row">
                  <div className="kz-blog-row-title">{post.title}</div>
                  <p className="kz-blog-row-excerpt">{post.excerpt}</p>
                  <div className="kz-blog-row-meta">
                    <span
                      className={`kz-blog-pill${post.category === "prestadores" ? " kz-blog-pill--prestadores" : ""}`}
                    >
                      {categoryLabel(post.category)}
                    </span>
                    <span>
                      {new Intl.DateTimeFormat("pt-BR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(`${post.publishedAt}T12:00:00`))}
                    </span>
                    <span>{post.readTimeMin} min</span>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ marginTop: 28 }}>
              <Link href="/search" className="btn-cta">
                Buscar profissionais →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
