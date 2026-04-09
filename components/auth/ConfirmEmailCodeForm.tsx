"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { AuthSpinner } from "@/components/auth/AuthSpinner";

function ptVerifyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("expired") || m.includes("invalid") || m.includes("otp")) {
    return "Esse código não vale mais — muito comum quando o Gmail/Outlook abriu algum link do e-mail sozinho, ou quando passou do tempo. Toque em “Enviar novo código” abaixo e use só os números do e-mail novo.";
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
  const [resendBusy, setResendBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function normalizeOtpToken(raw: string): string {
    const compact = raw.trim().replace(/\s/g, "");
    const digits = compact.replace(/\D/g, "");
    if (digits.length >= 6) return digits.slice(0, 8);
    const alnum = compact.replace(/[^a-zA-Z0-9]/g, "");
    if (alnum.length >= 6) return alnum.slice(0, 8);
    return digits.slice(0, 8);
  }

  async function onResendCode() {
    const em = email.trim().toLowerCase();
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setErr("Preencha seu e-mail acima para reenviar o código.");
      return;
    }
    setErr(null);
    setResendBusy(true);
    try {
      const res = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!data.ok) {
        setErr(data.message ?? "Não foi possível reenviar.");
        return;
      }
      setCode("");
      router.replace(`/confirmar-email?email=${encodeURIComponent(em)}&reenvio=1`);
      router.refresh();
    } catch {
      setErr("Falha ao reenviar. Tente de novo.");
    } finally {
      setResendBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    const em = email.trim().toLowerCase();
    const token = normalizeOtpToken(code);
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setErr("Informe o e-mail cadastrado.");
      return;
    }
    if (token.length < 6) {
      setErr("Digite o código completo que aparece no e-mail (geralmente 6 números).");
      return;
    }

    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      /** Doc Supabase (OTP no e-mail): `type: 'email'`; `signup` cobre projetos/configs antigas. */
      const tryTypes = ["email", "signup"] as const;
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
          maxLength={10}
          value={code}
          onChange={(ev) => setCode(ev.target.value.replace(/[^\d]/g, "").slice(0, 8))}
          placeholder="000000"
          style={{ letterSpacing: "0.2em", fontSize: 20, fontWeight: 700 }}
          disabled={busy}
          aria-describedby="confirm-code-hint"
        />
        <p id="confirm-code-hint" className="auth-password-hint" style={{ marginTop: 8 }}>
          Use o código mais recente. Se o Gmail abriu algum link do e-mail sozinho, peça um código novo abaixo.
        </p>
      </label>

      {err ? <p className="auth-error">{err}</p> : null}

      <div style={{ marginBottom: 14 }}>
        <button
          type="button"
          className="btn-ghost auth-resend-btn"
          style={{ width: "100%", justifyContent: "center" }}
          disabled={busy || resendBusy}
          onClick={() => void onResendCode()}
        >
          {resendBusy ? "Enviando…" : "Enviar novo código por e-mail"}
        </button>
      </div>

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
