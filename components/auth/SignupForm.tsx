"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { getAuthCallbackUrl } from "@/lib/auth/redirect";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AccountRole = "client" | "professional";

function ptError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered")) return "Este e-mail já está cadastrado. Entre ou use outro e-mail.";
  if (m.includes("password")) return "Senha inválida. Use pelo menos 6 caracteres.";
  if (m.includes("invalid email")) return "E-mail inválido.";
  return message;
}

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [accountRole, setAccountRole] = useState<AccountRole>("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== password2) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const nextAfterEmailConfirm = encodeURIComponent("/dashboard?conta=ativada");
      const { data, error: signError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${getAuthCallbackUrl()}?next=${nextAfterEmailConfirm}`,
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
        router.push("/dashboard");
        router.refresh();
        return;
      }

      router.push("/entrar?cadastro=ok");
      router.refresh();
    } catch {
      setError("Não foi possível conectar. Verifique sua internet e tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
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
        />
      </label>

      <label className="auth-field">
        <span className="auth-label">Senha</span>
        <input
          className="auth-input"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          placeholder="mínimo 6 caracteres"
        />
      </label>

      <label className="auth-field">
        <span className="auth-label">Confirmar senha</span>
        <input
          className="auth-input"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password2}
          onChange={(ev) => setPassword2(ev.target.value)}
          placeholder="repita a senha"
        />
      </label>

      {error ? <p className="auth-error">{error}</p> : null}

      <button type="submit" className="btn-cta auth-submit" disabled={loading}>
        {loading ? "Criando…" : "Criar conta"}
      </button>

      <p className="auth-foot">
        Já tem conta?{" "}
        <Link href="/entrar" className="auth-link">
          Entrar
        </Link>
      </p>
    </form>
  );
}
