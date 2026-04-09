import type { Metadata } from "next";
import { ConfirmEmailCodeForm } from "@/components/auth/ConfirmEmailCodeForm";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Confirmar e-mail",
  description: `Confirme seu e-mail com o código enviado pelo ${SITE_NAME}.`,
  alternates: { canonical: `${getSiteUrl()}/confirmar-email` },
  robots: { index: false, follow: true },
};

export default async function ConfirmarEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const sp = await searchParams;
  const defaultEmail = typeof sp.email === "string" ? decodeURIComponent(sp.email).trim() : "";

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/entrar" backLabel="← Entrar" />
      <div className="section">
        <div className="pro-page-card auth-flow-card">
          <span className="sec-eyebrow">Conta</span>
          <h1 className="sec-title" style={{ fontSize: "clamp(32px,4vw,42px)", marginBottom: 8 }}>
            Confirmar e-mail
          </h1>
          <ConfirmEmailCodeForm defaultEmail={defaultEmail} />
        </div>
      </div>
    </div>
  );
}
