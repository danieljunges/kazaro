import type { Metadata } from "next";
import { InfoPage } from "@/components/kazaro/InfoPage";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: `Termos e condições de uso do ${SITE_NAME}.`,
  alternates: { canonical: `${getSiteUrl()}/termos` },
};

export default function TermosPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Termos de uso"
      subtitle="Regras para uso da plataforma por clientes e prestadores."
      sections={[
        {
          heading: "Responsabilidades",
          body: "Clientes e prestadores devem manter informações corretas e respeitar as políticas de atendimento e conduta.",
        },
        {
          heading: "Condições da plataforma",
          body: "O uso da plataforma implica concordância com fluxos de contratação, mediação e políticas vigentes.",
        },
      ]}
    />
  );
}
