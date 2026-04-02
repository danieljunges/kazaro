"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function ptError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (m.includes("too many requests")) return "Muitas tentativas. Tente de novo em alguns minutos.";
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

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signError) {
        setError(ptError(signError.message));
        return;
      }
      router.push(next.startsWith("/") ? next : `/${next}`);
      router.refresh();
    } catch {
      setError("Não foi possível conectar. Verifique sua internet e tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      {searchParams.get("cadastro") === "ok" ? (
        <p className="auth-banner auth-banner--ok">
          Conta criada. Enviamos um link para o seu e-mail: abra a mensagem, confirme e depois entre com e-mail e senha.
        </p>
      ) : null}
      {searchParams.get("conta") === "ativada" ? (
        <p className="auth-banner auth-banner--ok">
          Conta ativada. Entre com e-mail e senha para continuar.
        </p>
      ) : null}
      {searchParams.get("erro") === "callback" ? (
        <p className="auth-banner auth-banner--err">Não foi possível validar o link. Tente entrar de novo ou peça um novo e-mail.</p>
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
        />
      </label>

      {error ? <p className="auth-error">{error}</p> : null}

      <button type="submit" className="btn-cta auth-submit" disabled={loading}>
        {loading ? "Entrando…" : "Entrar"}
      </button>

      <p className="auth-foot">
        Ainda não tem conta?{" "}
        <Link href="/criar-conta" className="auth-link">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
