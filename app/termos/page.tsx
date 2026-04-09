import type { Metadata } from "next";
import { InfoPage } from "@/components/kazaro/InfoPage";
import { getLegalContactEmail } from "@/lib/legal/contact";
import { buildTermsSections } from "@/lib/legal/terms-sections";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: `Termos e condições de uso da plataforma ${SITE_NAME}.`,
  alternates: { canonical: `${getSiteUrl()}/termos` },
};

export default function TermosPage() {
  const contactEmail = getLegalContactEmail();
  const sections = buildTermsSections({ siteName: SITE_NAME, contactEmail });

  return (
    <InfoPage
      eyebrow="Legal"
      title="Termos de uso"
      subtitle="Regras para uso da plataforma por clientes e prestadores de serviços."
      intro="Última revisão: abril de 2026."
      sections={sections}
      showSearchCta={false}
      legalNav
    />
  );
}
