import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Criar conta",
  description: `Cadastre-se no ${SITE_NAME} para agendar serviços ou gerenciar seu perfil profissional.`,
  alternates: { canonical: `${getSiteUrl()}/criar-conta` },
};

export default async function CriarContaPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const sp = await searchParams;
  const tipo = (sp.tipo ?? "").toLowerCase();
  const defaultRole = tipo === "prestador" || tipo === "profissional" ? ("professional" as const) : ("client" as const);

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/" backLabel="← Início" />
      <div className="section">
        <div className="pro-page-card auth-flow-card">
          <span className="sec-eyebrow">Conta</span>
          <h1 className="sec-title" style={{ fontSize: "clamp(32px,4vw,42px)", marginBottom: 16 }}>
            Criar conta
          </h1>
          <SignupForm defaultRole={defaultRole} />
        </div>
      </div>
    </div>
  );
}
