import type { ReactNode } from "react";
import Link from "next/link";
import { CompactNav } from "@/components/kazaro/CompactNav";
import type { LegalSection } from "@/lib/legal/types";

type InfoPageProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Parágrafo opcional (ex.: data de revisão em documentos legais) */
  intro?: string;
  sections: LegalSection[];
  children?: ReactNode;
  /** Exibir CTA “Buscar profissionais” (páginas institucionais). Documentos legais: false. */
  showSearchCta?: boolean;
  /** Links cruzados Privacidade / Cookies / Termos */
  legalNav?: boolean;
};

export function InfoPage({
  eyebrow,
  title,
  subtitle,
  intro,
  sections,
  children,
  showSearchCta = true,
  legalNav = false,
}: InfoPageProps) {
  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/" backLabel="← Início" />
      <div className="section">
        <div style={{ maxWidth: 780 }}>
          <span className="sec-eyebrow">{eyebrow}</span>
          <h1 className="sec-title" style={{ marginBottom: 18 }}>
            {title}
          </h1>
          <p className="sec-sub" style={{ maxWidth: 680, marginBottom: intro ? 10 : 26 }}>
            {subtitle}
          </p>
          {intro ? <p className="legal-last-updated">{intro}</p> : null}
        </div>
        <div className="pro-page-card" style={{ maxWidth: 860 }}>
          {sections.map((section) => (
            <div key={section.heading} style={{ marginBottom: 22 }}>
              <h2 style={{ fontSize: 17, marginBottom: 10 }}>{section.heading}</h2>
              {Array.isArray(section.body) ? (
                section.body.map((para, i) => (
                  <p key={i} className="legal-section-body">
                    {para}
                  </p>
                ))
              ) : (
                <p className="legal-section-body">{section.body}</p>
              )}
            </div>
          ))}
          {children ? <div style={{ marginBottom: 22 }}>{children}</div> : null}
          {legalNav ? (
            <nav className="legal-doc-nav" aria-label="Documentos legais">
              <Link href="/privacidade">Política de privacidade</Link>
              <span className="legal-doc-nav-sep" aria-hidden>
                ·
              </span>
              <Link href="/cookies">Política de cookies</Link>
              <span className="legal-doc-nav-sep" aria-hidden>
                ·
              </span>
              <Link href="/termos">Termos de uso</Link>
            </nav>
          ) : null}
          {showSearchCta ? (
            <Link href="/search" className="btn-cta">
              Buscar profissionais →
            </Link>
          ) : (
            <Link href="/" className="btn-ghost" style={{ marginTop: legalNav ? 16 : 0 }}>
              Voltar ao início
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
