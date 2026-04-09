import type { Metadata } from "next";
import { InfoPage } from "@/components/kazaro/InfoPage";
import { buildCookiesSections } from "@/lib/legal/cookies-sections";
import { getLegalContactEmail } from "@/lib/legal/contact";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: `Uso de cookies e tecnologias similares no ${SITE_NAME}.`,
  alternates: { canonical: `${getSiteUrl()}/cookies` },
};

export default function CookiesPage() {
  const email = getLegalContactEmail();
  const sections = buildCookiesSections(SITE_NAME);

  return (
    <InfoPage
      eyebrow="Legal · Cookies"
      title="Política de cookies"
      subtitle="Informações sobre cookies, armazenamento local e tecnologias usadas para operar o site com segurança."
      intro="Última revisão: abril de 2026."
      sections={sections}
      showSearchCta={false}
      legalNav
    >
      <p className="legal-section-body" style={{ fontSize: 12.5, color: "var(--ink40)" }}>
        Dúvidas:{" "}
        <a href={`mailto:${email}`} className="auth-link">
          {email}
        </a>
      </p>
    </InfoPage>
  );
}
