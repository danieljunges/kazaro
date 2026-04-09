"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, FormEvent } from "react";
import { ensureMinElapsedSince } from "@/lib/auth/auth-ui-timing";
import { getEmailConfirmationRedirectUrl } from "@/lib/auth/redirect";
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
      const supabase = getSupabaseBrowserClient();
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: em,
        options: {
          emailRedirectTo: getEmailConfirmationRedirectUrl(),
        },
      });
      if (resendError) {
        setResendHint(ptError(resendError.message));
        return;
      }
      try {
        sessionStorage.setItem(PENDING_EMAIL_KEY, em);
      } catch {
        /* ignore */
      }
      setResendHint("Enviamos outro e-mail. Abra o link no celular; se usar Gmail ou Outlook, pode ser preciso tocar em “visitar site” em vez de abrir o preview automático.");
      setResendCooldown(AFTER_RESEND_COOLDOWN_SEC);
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
              <p className="auth-banner auth-banner--ok">
                Confirmação enviada por e-mail. Use o link da mensagem para ativar a conta (verifique spam).
              </p>
            ) : null}
            {searchParams.get("conta") === "ativada" ? (
              <p className="auth-banner auth-banner--ok">E-mail confirmado.</p>
            ) : null}
            {erroCallback ? (
              <div className="auth-banner auth-banner--err auth-banner--wrap">
                <strong>Não foi possível usar o link.</strong> Isso é comum quando o app de e-mail abre o link sozinho
                (só vale uma vez) ou quando ele já foi usado. Peça outro e-mail abaixo e, ao abrir, use “abrir no
                navegador” se aparecer.
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
            <p className="auth-resend-label">Precisa de um novo link de confirmação?</p>
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
