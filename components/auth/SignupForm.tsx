"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { checkSignupEmailAvailable } from "@/app/criar-conta/actions";
import { ensureMinElapsedSince } from "@/lib/auth/auth-ui-timing";
import { getPasswordPolicyError, PASSWORD_POLICY_HINT } from "@/lib/auth/password-policy";
import { getEmailConfirmationRedirectUrlClient } from "@/lib/auth/redirect";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { AuthSpinner } from "@/components/auth/AuthSpinner";

type AccountRole = "client" | "professional";

function ptError(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("already registered") ||
    m.includes("already been registered") ||
    m.includes("user already registered") ||
    m.includes("email address is already") ||
    m.includes("email already exists") ||
    m.includes("duplicate key") ||
    m.includes("unique constraint")
  ) {
    return "E-mail já cadastrado.";
  }
  if (m.includes("password")) return `Senha inválida. ${PASSWORD_POLICY_HINT}`;
  if (m.includes("invalid email")) return "E-mail inválido.";
  return message;
}

export function SignupForm({ defaultRole = "client" as AccountRole }: { defaultRole?: AccountRole }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [accountRole, setAccountRole] = useState<AccountRole>(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== password2) {
      setError("As senhas não coincidem.");
      return;
    }
    const policyErr = getPasswordPolicyError(password);
    if (policyErr) {
      setError(policyErr);
      return;
    }

    setLoading(true);
    let navigated = false;
    const t0 = Date.now();

    try {
      const emailTrim = email.trim();
      const dup = await checkSignupEmailAvailable(emailTrim);
      if (!dup.available) {
        setError(dup.message);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { data, error: signError } = await supabase.auth.signUp({
        email: emailTrim,
        password,
        options: {
          emailRedirectTo: getEmailConfirmationRedirectUrlClient(),
          data: {
            full_name: fullName.trim() || undefined,
            role: accountRole,
          },
        },
      });

      if (signError) {
        setError(ptError(signError.message));
        return;
      }

      if (data.session) {
        await ensureMinElapsedSince(t0);
        navigated = true;
        router.push(accountRole === "professional" ? "/dashboard/ativar-perfil" : "/dashboard");
        router.refresh();
        return;
      }

      await ensureMinElapsedSince(t0);
      try {
        sessionStorage.setItem("kz_pending_confirm_email", emailTrim);
      } catch {
        /* ignore */
      }
      navigated = true;
      router.push("/entrar?cadastro=ok");
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
        <div className="auth-field">
          <span className="auth-label">Tipo de conta</span>
          <div className="auth-role-row" role="radiogroup" aria-label="Tipo de conta">
            <label className={`auth-role-opt${accountRole === "client" ? " auth-role-opt--on" : ""}`}>
              <input
                type="radio"
                name="accountRole"
                value="client"
                checked={accountRole === "client"}
                onChange={() => setAccountRole("client")}
                disabled={loading}
              />
              <span className="auth-role-title">Cliente</span>
              <span className="auth-role-hint">Buscar e agendar serviços</span>
            </label>
            <label className={`auth-role-opt${accountRole === "professional" ? " auth-role-opt--on" : ""}`}>
              <input
                type="radio"
                name="accountRole"
                value="professional"
                checked={accountRole === "professional"}
                onChange={() => setAccountRole("professional")}
                disabled={loading}
              />
              <span className="auth-role-title">Profissional</span>
              <span className="auth-role-hint">Pedidos, ganhos e perfil público</span>
            </label>
          </div>
        </div>

        <label className="auth-field">
          <span className="auth-label">Nome completo</span>
          <input
            className="auth-input"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(ev) => setFullName(ev.target.value)}
            placeholder="Como quer ser chamado(a)"
            disabled={loading}
          />
        </label>

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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            placeholder="ex.: Kazaro2026!"
            disabled={loading}
          />
          <p className="auth-password-hint">{PASSWORD_POLICY_HINT}</p>
        </label>

        <label className="auth-field">
          <span className="auth-label">Confirmar senha</span>
          <input
            className="auth-input"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password2}
            onChange={(ev) => setPassword2(ev.target.value)}
            placeholder="repita a senha"
            disabled={loading}
          />
        </label>

        {error ? <p className="auth-error">{error}</p> : null}

        <button type="submit" className="btn-cta auth-submit" disabled={loading}>
          <span className="auth-submit-inner">
            {loading ? <AuthSpinner className="auth-spinner" /> : null}
            {loading ? "Criando conta" : "Criar conta"}
          </span>
        </button>

        <p className="auth-foot">
          Já tem conta?{" "}
          <Link href="/entrar" className="auth-link" tabIndex={loading ? -1 : 0}>
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
