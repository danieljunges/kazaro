import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Entrar",
  description: `Acesse sua conta no ${SITE_NAME}.`,
  alternates: { canonical: `${getSiteUrl()}/entrar` },
};

function LoginFallback() {
  return (
    <p className="sec-sub" style={{ margin: 0 }}>
      Carregando formulário…
    </p>
  );
}

export default function EntrarPage() {
  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/" backLabel="← Início" />
      <div className="section">
        <div className="pro-page-card" style={{ maxWidth: 480, margin: "0 auto" }}>
          <span className="sec-eyebrow">Conta</span>
          <h1 className="sec-title" style={{ fontSize: "clamp(32px,4vw,42px)", marginBottom: 8 }}>
            Entrar no Kazaro
          </h1>
          <p className="sec-sub" style={{ marginBottom: 8 }}>
            Use o mesmo e-mail e senha do cadastro. Sessão protegida com Supabase Auth.
          </p>
          <Suspense fallback={<LoginFallback />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
