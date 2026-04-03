import type { Metadata } from "next";
import { InfoPage } from "@/components/kazaro/InfoPage";
import { getControllerLegalNote, getDpoTitle, getLegalContactEmail } from "@/lib/legal/contact";
import { buildPrivacySections } from "@/lib/legal/privacy-sections";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: `Política de privacidade e proteção de dados (LGPD) da plataforma ${SITE_NAME}.`,
  alternates: { canonical: `${getSiteUrl()}/privacidade` },
};

export default function PrivacidadePage() {
  const contactEmail = getLegalContactEmail();
  const sections = buildPrivacySections({
    contactEmail,
    controllerNote: getControllerLegalNote(),
    siteName: SITE_NAME,
    dpoTitle: getDpoTitle(),
  });

  return (
    <InfoPage
      eyebrow="Legal · LGPD"
      title="Política de privacidade"
      subtitle="Transparência sobre como tratamos dados pessoais na plataforma, em conformidade com a Lei nº 13.709/2018 (LGPD)."
      intro="Última revisão: abril de 2026. Este texto tem caráter informativo; recomenda-se validação jurídica para o seu caso concreto."
      sections={sections}
      showSearchCta={false}
      legalNav
    >
      <p className="legal-section-body" style={{ fontSize: 12.5, color: "var(--ink40)" }}>
        Contato para titulares:{" "}
        <a href={`mailto:${contactEmail}`} className="auth-link">
          {contactEmail}
        </a>
      </p>
    </InfoPage>
  );
}
