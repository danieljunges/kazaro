import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { getBlogPostBySlug, getAllBlogSlugs } from "@/lib/blog/posts";
import {
  getSiteUrl,
  INSTAGRAM_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

function categoryLabel(c: "clientes" | "prestadores") {
  return c === "clientes" ? "Para clientes" : "Para prestadores";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Post" };

  const site = getSiteUrl();
  const url = `${site}/blog/${post.slug}`;
  const title = post.title;
  const description = post.excerpt;

  return {
    title,
    description,
    keywords: post.keywords,
    authors: [{ name: SITE_NAME, url: site }],
    openGraph: {
      type: "article",
      locale: "pt_BR",
      url,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      publishedTime: `${post.publishedAt}T08:00:00-03:00`,
      modifiedTime: post.updatedAt ? `${post.updatedAt}T08:00:00-03:00` : undefined,
      section: categoryLabel(post.category),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
    alternates: { canonical: url },
    robots: { index: true, follow: true },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const site = getSiteUrl();
  const url = `${site}/blog/${post.slug}`;
  const publishedIso = `${post.publishedAt}T08:00:00-03:00`;

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
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.excerpt,
        datePublished: publishedIso,
        dateModified: post.updatedAt ? `${post.updatedAt}T08:00:00-03:00` : publishedIso,
        author: { "@type": "Organization", name: SITE_NAME, url: site },
        publisher: { "@id": `${site}/#organization` },
        mainEntityOfPage: { "@type": "WebPage", "@id": `${url}#webpage` },
        url,
        inLanguage: "pt-BR",
        articleSection: categoryLabel(post.category),
        wordCount: post.sections.reduce((n, s) => n + s.paragraphs.join(" ").length, 0),
        keywords: post.keywords?.join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: site },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${site}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="home-editorial public-page">
        <CompactNav backHref="/blog" backLabel="← Blog" />
        <div className="section">
          <article className="pro-page-card kz-blog-article" style={{ maxWidth: 720 }}>
            <nav aria-label="Navegação estrutural" style={{ marginBottom: 18 }}>
              <Link href="/" className="auth-link" style={{ fontSize: 13 }}>
                Início
              </Link>
              <span style={{ color: "var(--ink30)", margin: "0 8px" }}>/</span>
              <Link href="/blog" className="auth-link" style={{ fontSize: 13 }}>
                Blog
              </Link>
            </nav>
            <span className="sec-eyebrow">Blog · {categoryLabel(post.category)}</span>
            <h1 className="sec-title" style={{ marginBottom: 12 }}>
              {post.title}
            </h1>
            <p className="kz-blog-article-lead">{post.excerpt}</p>
            <p className="legal-last-updated" style={{ marginBottom: 24 }}>
              Publicado em{" "}
              {new Intl.DateTimeFormat("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date(`${post.publishedAt}T12:00:00`))}{" "}
              · {post.readTimeMin} min de leitura
            </p>
            {post.sections.map((sec, si) => (
              <section key={sec.heading} aria-labelledby={`blog-sec-${si}`}>
                <h2 id={`blog-sec-${si}`}>{sec.heading}</h2>
                {sec.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </section>
            ))}
            <div style={{ marginTop: 36, paddingTop: 22, borderTop: "1px solid var(--border)" }}>
              <Link href="/blog" className="btn-ghost" style={{ marginRight: 12 }}>
                ← Todos os posts
              </Link>
              <Link href="/search" className="btn-cta">
                Buscar profissionais →
              </Link>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
