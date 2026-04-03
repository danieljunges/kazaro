"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";
import { ensureMinElapsedSince } from "@/lib/auth/auth-ui-timing";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { AuthSpinner } from "@/components/auth/AuthSpinner";

function ptError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "E-mail ainda não confirmado.";
  if (m.includes("too many requests")) return "Muitas tentativas. Aguarde alguns minutos.";
  return message;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    let navigated = false;
    const t0 = Date.now();

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signError) {
        setError(ptError(signError.message));
        return;
      }
      await ensureMinElapsedSince(t0);
      navigated = true;
      router.push(next.startsWith("/") ? next : `/${next}`);
      router.refresh();
    } catch {
      setError("Falha na conexão. Tente de novo.");
    } finally {
      if (!navigated) setLoading(false);
    }
  }

  return (
    <div className={`auth-form-shell${loading ? " auth-form-shell--busy" : ""}`}>
      <form className="auth-form" onSubmit={onSubmit} aria-busy={loading}>
        {searchParams.get("cadastro") === "ok" ? (
          <p className="auth-banner auth-banner--ok">Confirmação enviada por e-mail.</p>
        ) : null}
        {searchParams.get("conta") === "ativada" ? (
          <p className="auth-banner auth-banner--ok">E-mail confirmado.</p>
        ) : null}
        {searchParams.get("erro") === "callback" ? (
          <p className="auth-banner auth-banner--err">Link inválido ou expirado.</p>
        ) : null}
        {searchParams.get("requer") === "admin" ? (
          <p className="auth-banner auth-banner--err">
            Acesso administrativo: entre com uma conta autorizada. Se você já está logado com outro perfil, use outro
            e-mail ou saia da conta atual.
          </p>
        ) : null}

        <label className="auth-field">
          <span className="auth-label">E-mail</span>
          <input
            className="auth-input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder="seu@email.com"
            disabled={loading}
          />
        </label>

        <label className="auth-field">
          <span className="auth-label">Senha</span>
          <input
            className="auth-input"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            placeholder="••••••••"
            disabled={loading}
          />
        </label>

        {error ? <p className="auth-error">{error}</p> : null}

        <button type="submit" className="btn-cta auth-submit" disabled={loading}>
          <span className="auth-submit-inner">
            {loading ? <AuthSpinner className="auth-spinner" /> : null}
            {loading ? "Entrando" : "Entrar"}
          </span>
        </button>

        <p className="auth-foot">
          Ainda não tem conta?{" "}
          <Link href="/criar-conta" className="auth-link" tabIndex={loading ? -1 : 0}>
            Criar conta
          </Link>
        </p>
      </form>
    </div>
  );
}
