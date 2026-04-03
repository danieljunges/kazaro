import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { fetchMyProfileRole } from "@/lib/supabase/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Entrar",
  description: `Acesse sua conta no ${SITE_NAME}.`,
  alternates: { canonical: `${getSiteUrl()}/entrar` },
};

function LoginFallback() {
  return (
    <div className="auth-skeleton" aria-busy="true" aria-label="Carregando">
      <div className="auth-skel-line" />
      <div className="auth-skel-line" />
      <div className="auth-skel-btn" />
    </div>
  );
}

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; requer?: string }>;
}) {
  const sp = await searchParams;
  if (sp.requer === "admin") {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id) {
      const role = await fetchMyProfileRole(user.id);
      if (role === "admin") {
        const next = sp.next?.trim();
        if (next && next.startsWith("/")) redirect(next);
        redirect("/admin");
      }
      redirect("/dashboard?admin=negado");
    }
  }

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
            Acesso com e-mail e senha.
          </p>
          <Suspense fallback={<LoginFallback />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
