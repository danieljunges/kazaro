"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { AuthSpinner } from "@/components/auth/AuthSpinner";

function ptVerifyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("expired") || m.includes("invalid")) {
    return "Código inválido ou expirado. Peça um novo e-mail em Entrar → Reenviar confirmação.";
  }
  if (m.includes("too many")) return "Muitas tentativas. Aguarde alguns minutos.";
  return message;
}

type Props = {
  defaultEmail?: string;
  /** Vindo da URL após cadastro ou reenvio — mostra que o código foi mandado por e-mail. */
  notice?: "enviado" | "reenvio" | null;
};

/**
 * Confirmação sem depender do link do e-mail (Gmail/Outlook queimam o token no preview).
 * O código de 6 dígitos vem no e-mail (variável {{ .Token }} no template do Supabase).
 */
export function ConfirmEmailCodeForm({ defaultEmail = "", notice = null }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);

  useEffect(() => {
    if (defaultEmail.trim()) setEmail(defaultEmail.trim());
  }, [defaultEmail]);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    const em = email.trim().toLowerCase();
    const token = code.replace(/\D/g, "").slice(0, 6);
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setErr("Informe o e-mail cadastrado.");
      return;
    }
    if (token.length !== 6) {
      setErr("Digite os 6 números que aparecem no e-mail.");
      return;
    }

    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const tryTypes = ["signup", "email"] as const;
      let lastError: string | null = null;
      for (const type of tryTypes) {
        const { error } = await supabase.auth.verifyOtp({ email: em, token, type });
        if (!error) {
          router.push("/dashboard?conta=ativada");
          router.refresh();
          return;
        }
        lastError = error.message;
      }
      setErr(ptVerifyError(lastError ?? "Não foi possível confirmar."));
    } catch {
      setErr("Falha na conexão. Tente de novo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={onSubmit} aria-busy={busy}>
      {notice === "enviado" ? (
        <div className="auth-banner auth-banner--ok" style={{ marginBottom: 18, textAlign: "left", lineHeight: 1.55 }}>
          <strong>Mandamos um código para o seu e-mail.</strong>{" "}
          {email.trim() ? (
            <>
              Confira a caixa de entrada de <strong>{email.trim()}</strong> (e o spam). Digite os <strong>6 números</strong>{" "}
              abaixo — não precisa clicar em nenhum link.
            </>
          ) : (
            <>
              Confira sua caixa de entrada (e o spam). Digite os <strong>6 números</strong> abaixo — não precisa clicar em
              nenhum link.
            </>
          )}
        </div>
      ) : null}
      {notice === "reenvio" ? (
        <div className="auth-banner auth-banner--ok" style={{ marginBottom: 18, textAlign: "left", lineHeight: 1.55 }}>
          <strong>Enviamos outro e-mail</strong> com um código novo
          {email.trim() ? (
            <>
              {" "}
              para <strong>{email.trim()}</strong>
            </>
          ) : null}
          . Use os 6 números da mensagem abaixo.
        </div>
      ) : null}
      {!notice ? (
        <p className="sec-sub" style={{ margin: "0 0 18px", lineHeight: 1.55 }}>
          Digite o <strong>código de 6 números</strong> que veio no e-mail de confirmação do Kazaro. Não precisa abrir
          link no app de e-mail.
        </p>
      ) : null}

      <label className="auth-field">
        <span className="auth-label">E-mail cadastrado</span>
        <input
          className="auth-input"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          placeholder="seu@email.com"
          disabled={busy}
        />
      </label>

      <label className="auth-field">
        <span className="auth-label">Código de 6 dígitos</span>
        <input
          className="auth-input"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          maxLength={8}
          value={code}
          onChange={(ev) => setCode(ev.target.value.replace(/[^\d]/g, "").slice(0, 6))}
          placeholder="000000"
          style={{ letterSpacing: "0.2em", fontSize: 20, fontWeight: 700 }}
          disabled={busy}
          aria-describedby="confirm-code-hint"
        />
        <p id="confirm-code-hint" className="auth-password-hint" style={{ marginTop: 8 }}>
          Está no assunto ou no corpo do e-mail &quot;Confirme seu e-mail&quot;, ao lado da frase de confirmação.
        </p>
      </label>

      {err ? <p className="auth-error">{err}</p> : null}

      <button type="submit" className="btn-cta auth-submit" disabled={busy}>
        <span className="auth-submit-inner">
          {busy ? <AuthSpinner className="auth-spinner" /> : null}
          {busy ? "Confirmando…" : "Confirmar e entrar"}
        </span>
      </button>

      <p className="auth-foot" style={{ marginTop: 18 }}>
        <Link href="/entrar?cadastro=ok" className="auth-link">
          Voltar para Entrar
        </Link>
        {" · "}
        <Link href="/criar-conta" className="auth-link">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
