"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, FormEvent } from "react";
import { ensureMinElapsedSince } from "@/lib/auth/auth-ui-timing";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { AuthSpinner } from "@/components/auth/AuthSpinner";

const EMAIL_NOT_CONFIRMED_PT = "E-mail ainda não confirmado.";
const PENDING_EMAIL_KEY = "kz_pending_confirm_email";
const INITIAL_RESEND_COOLDOWN_SEC = 28;
const AFTER_RESEND_COOLDOWN_SEC = 60;

function safeInternalPath(raw: string): string {
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//") || t.includes("://")) return "/dashboard";
  return t;
}

function ptError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return EMAIL_NOT_CONFIRMED_PT;
  if (m.includes("too many requests")) return "Muitas tentativas. Aguarde alguns minutos.";
  return message;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeInternalPath(searchParams.get("next") ?? "/dashboard");
  const cadastroOk = searchParams.get("cadastro") === "ok";
  const erroCallback = searchParams.get("erro") === "callback";
  const erroMotivo = searchParams.get("motivo")?.trim() || null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendHint, setResendHint] = useState<string | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showResendBlock =
    cadastroOk || erroCallback || error === EMAIL_NOT_CONFIRMED_PT;

  const clearCooldownTimer = useCallback(() => {
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (cadastroOk || erroCallback) {
      try {
        const pending = sessionStorage.getItem(PENDING_EMAIL_KEY)?.trim();
        if (pending) setEmail((e) => e || pending);
      } catch {
        /* ignore */
      }
      setResendCooldown(INITIAL_RESEND_COOLDOWN_SEC);
    }
  }, [cadastroOk, erroCallback]);

  /** Links antigos ?cadastro=ok: vai direto pra tela do código se soubermos o e-mail. */
  useEffect(() => {
    if (!cadastroOk) return;
    try {
      const pending = sessionStorage.getItem(PENDING_EMAIL_KEY)?.trim();
      if (pending) {
        router.replace(`/confirmar-email?email=${encodeURIComponent(pending)}&enviado=1`);
      }
    } catch {
      /* ignore */
    }
  }, [cadastroOk, router]);

  useEffect(() => {
    if (error !== EMAIL_NOT_CONFIRMED_PT || cadastroOk || erroCallback) return;
    setResendCooldown((c) => (c === 0 ? 22 : c));
  }, [error, cadastroOk, erroCallback]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      clearCooldownTimer();
      return;
    }
    clearCooldownTimer();
    cooldownTimerRef.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearCooldownTimer();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearCooldownTimer();
  }, [resendCooldown, clearCooldownTimer]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResendHint(null);
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
      try {
        sessionStorage.removeItem(PENDING_EMAIL_KEY);
      } catch {
        /* ignore */
      }
      navigated = true;
      router.push(next);
      router.refresh();
    } catch {
      setError("Falha na conexão. Tente de novo.");
    } finally {
      if (!navigated) setLoading(false);
    }
  }

  async function onResendConfirmation() {
    const em = email.trim();
    if (!em) {
      setResendHint("Informe seu e-mail no campo acima.");
      return;
    }
    setResendHint(null);
    setResendBusy(true);
    try {
      const res = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!data.ok) {
        setResendHint(data.message ?? "Não foi possível reenviar. Tente de novo.");
        return;
      }
      try {
        sessionStorage.setItem(PENDING_EMAIL_KEY, em);
      } catch {
        /* ignore */
      }
      router.push(`/confirmar-email?email=${encodeURIComponent(em)}&reenvio=1`);
      router.refresh();
    } catch {
      setResendHint("Não foi possível reenviar. Tente de novo em instantes.");
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <div className={`auth-form-shell${loading ? " auth-form-shell--busy" : ""}`}>
      <form className="auth-form" onSubmit={onSubmit} aria-busy={loading}>
        {cadastroOk || searchParams.get("conta") === "ativada" || erroCallback || searchParams.get("requer") === "admin" ? (
          <div className="auth-alerts" aria-live="polite">
            {cadastroOk ? (
              <div className="auth-banner auth-banner--ok">
                <strong style={{ display: "block", marginBottom: 8 }}>Confirmação enviada.</strong>
                Abra o e-mail e use o <strong>código de 6 números</strong> em{" "}
                <Link href="/confirmar-email" className="auth-banner-link" style={{ fontWeight: 800 }}>
                  confirmar e-mail
                </Link>{" "}
                — funciona melhor no Gmail e no Outlook. O botão do e-mail também serve se abrir no navegador.
              </div>
            ) : null}
            {searchParams.get("conta") === "ativada" ? (
              <p className="auth-banner auth-banner--ok">E-mail confirmado.</p>
            ) : null}
            {erroCallback ? (
              <div className="auth-banner auth-banner--err auth-banner--wrap">
                <strong>Não foi possível usar o link.</strong> Muito comum no Gmail/Outlook: o preview do e-mail gasta o
                token. <strong>Mais simples:</strong> use o <strong>código de 6 números</strong> do mesmo e-mail em{" "}
                <Link href="/confirmar-email" style={{ fontWeight: 800, textDecoration: "underline" }}>
                  confirmar e-mail
                </Link>
                . Ou abra o link com <strong>Abrir no navegador</strong> / peça reenvio abaixo.
                {erroMotivo ? (
                  <span style={{ display: "block", marginTop: 10, fontSize: 13, fontWeight: 600, opacity: 0.92 }}>
                    Detalhe: {erroMotivo}
                  </span>
                ) : null}
              </div>
            ) : null}
            {searchParams.get("requer") === "admin" ? (
              <p className="auth-banner auth-banner--err">
                Acesso administrativo: use uma conta autorizada. Se já estiver logado com outro perfil, troque o e-mail ou
                saia da conta.
              </p>
            ) : null}
          </div>
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

        {showResendBlock ? (
          <div className="auth-resend-block">
            <p className="auth-resend-label">Precisa de um novo e-mail? (Chega de novo o código e o link.)</p>
            <button
              type="button"
              className="btn-ghost auth-resend-btn"
              disabled={resendBusy || resendCooldown > 0 || loading}
              onClick={onResendConfirmation}
            >
              {resendBusy ? (
                <span className="auth-submit-inner">
                  <AuthSpinner className="auth-spinner" />
                  Enviando…
                </span>
              ) : resendCooldown > 0 ? (
                `Reenviar e-mail (${resendCooldown}s)`
              ) : (
                "Reenviar e-mail de confirmação"
              )}
            </button>
            <p className="auth-resend-label" style={{ marginTop: 6, fontSize: 12.5 }}>
              Tem o código de 6 números?{" "}
              <Link href="/confirmar-email" className="auth-link">
                Confirmar por código
              </Link>
            </p>
            {resendHint ? <p className="auth-resend-feedback">{resendHint}</p> : null}
          </div>
        ) : null}

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
