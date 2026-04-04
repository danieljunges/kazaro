"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMyAccount } from "@/app/dashboard/configuracoes/actions";
import { ensureMinElapsedSince } from "@/lib/auth/auth-ui-timing";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function ptPasswordError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("password")) return "A nova senha não atende às regras (mín. 6 caracteres).";
  if (m.includes("same")) return "A nova senha deve ser diferente da atual.";
  return message;
}

type Props = {
  userEmail: string;
  /** Conta com login e-mail/senha (pode trocar senha). */
  hasEmailPasswordProvider: boolean;
  /** Exclusão automática da conta disponível no servidor. */
  accountDeletionConfigured: boolean;
};

export function AccountSecuritySection({
  userEmail,
  hasEmailPasswordProvider,
  accountDeletionConfigured,
}: Props) {
  const router = useRouter();

  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [passBusy, setPassBusy] = useState(false);
  const [passErr, setPassErr] = useState<string | null>(null);
  const [passOk, setPassOk] = useState<string | null>(null);

  const [delPass, setDelPass] = useState("");
  const [delEmail, setDelEmail] = useState("");
  const [delPhrase, setDelPhrase] = useState("");
  const [delBusy, setDelBusy] = useState(false);
  const [delErr, setDelErr] = useState<string | null>(null);

  const DELETE_PHRASE = "EXCLUIR MINHA CONTA";

  async function onChangePassword(e: FormEvent) {
    e.preventDefault();
    setPassErr(null);
    setPassOk(null);
    if (newPass.length < 6) {
      setPassErr("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPass !== newPass2) {
      setPassErr("A confirmação da nova senha não confere.");
      return;
    }
    setPassBusy(true);
    const t0 = Date.now();
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: e0 } = await supabase.auth.signInWithPassword({
        email: userEmail.trim(),
        password: curPass,
      });
      if (e0) {
        setPassErr("Senha atual incorreta.");
        return;
      }
      const { error: e1 } = await supabase.auth.updateUser({ password: newPass });
      if (e1) {
        setPassErr(ptPasswordError(e1.message));
        return;
      }
      await ensureMinElapsedSince(t0, 500);
      setPassOk("Senha atualizada.");
      setCurPass("");
      setNewPass("");
      setNewPass2("");
      router.refresh();
    } finally {
      setPassBusy(false);
    }
  }

  async function onDeleteAccount(e: FormEvent) {
    e.preventDefault();
    setDelErr(null);
    if (delPhrase.trim() !== DELETE_PHRASE) {
      setDelErr(`Digite exatamente: ${DELETE_PHRASE}`);
      return;
    }
    setDelBusy(true);
    try {
      const res = await deleteMyAccount({
        password: hasEmailPasswordProvider ? delPass : undefined,
        confirmationEmail: hasEmailPasswordProvider ? undefined : delEmail.trim(),
      });
      if (!res.ok) {
        setDelErr(res.message);
        return;
      }
      await getSupabaseBrowserClient().auth.signOut();
      window.location.href = "/?conta=excluida";
    } finally {
      setDelBusy(false);
    }
  }

  return (
    <div className="kz-prof-stack">
      <div className="kz-prof-form">
        <div className="kz-prof-title">E-mail da conta</div>
        <p className="kz-prof-sub" style={{ marginBottom: 10 }}>
          Usado para entrar e receber avisos. Para mudar o e-mail é preciso suporte ou fluxo dedicado no futuro.
        </p>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--ink)", wordBreak: "break-all" }}>
          {userEmail}
        </p>
      </div>

      {hasEmailPasswordProvider ? (
        <form className="kz-prof-form" onSubmit={onChangePassword}>
          <div className="kz-prof-title">Senha</div>
          <p className="kz-prof-sub" style={{ marginBottom: 14 }}>
            Confirme a senha atual e escolha uma nova.
          </p>

          <div className="kz-prof-row">
            <label className="auth-field">
              <span className="auth-label">Senha atual</span>
              <input
                className="auth-input"
                type="password"
                autoComplete="current-password"
                value={curPass}
                onChange={(ev) => setCurPass(ev.target.value)}
                disabled={passBusy}
                minLength={6}
              />
            </label>
          </div>
          <div className="kz-prof-row kz-prof-grid">
            <label className="auth-field">
              <span className="auth-label">Nova senha</span>
              <input
                className="auth-input"
                type="password"
                autoComplete="new-password"
                value={newPass}
                onChange={(ev) => setNewPass(ev.target.value)}
                disabled={passBusy}
                minLength={6}
              />
            </label>
            <label className="auth-field">
              <span className="auth-label">Confirmar nova senha</span>
              <input
                className="auth-input"
                type="password"
                autoComplete="new-password"
                value={newPass2}
                onChange={(ev) => setNewPass2(ev.target.value)}
                disabled={passBusy}
                minLength={6}
              />
            </label>
          </div>
          {passErr ? <p className="auth-error">{passErr}</p> : null}
          {passOk ? <p className="auth-banner auth-banner--ok">{passOk}</p> : null}
          <button type="submit" className="btn-cta auth-submit" style={{ marginTop: 12 }} disabled={passBusy}>
            {passBusy ? "Atualizando…" : "Atualizar senha"}
          </button>
        </form>
      ) : (
        <div className="kz-prof-form">
          <div className="kz-prof-title">Senha</div>
          <p className="kz-prof-sub" style={{ margin: 0 }}>
            Esta conta usa login social (ex.: Google). Não há senha para alterar aqui.
          </p>
        </div>
      )}

      <div className="kz-prof-form kz-prof-form--danger">
        <div className="kz-prof-title">Zona de risco</div>
        <p className="kz-prof-sub" style={{ marginBottom: 14 }}>
          Excluir a conta remove seu perfil, agendamentos e dados vinculados no Kazaro. Esta ação não pode ser desfeita.
        </p>

        {!accountDeletionConfigured ? (
          <p className="auth-banner auth-banner--err" style={{ margin: 0 }}>
            A exclusão automática pela página ainda não está disponível. Para encerrar sua conta, fale com o suporte do
            Kazaro e informe o e-mail da conta. A equipe orienta o próximo passo.
          </p>
        ) : (
          <form onSubmit={onDeleteAccount}>
            <label className="auth-field">
              <span className="auth-label">Confirmação</span>
              <input
                className="auth-input"
                value={delPhrase}
                onChange={(ev) => setDelPhrase(ev.target.value)}
                placeholder={DELETE_PHRASE}
                disabled={delBusy}
                autoComplete="off"
              />
            </label>
            {hasEmailPasswordProvider ? (
              <label className="auth-field" style={{ marginTop: 12 }}>
                <span className="auth-label">Sua senha atual</span>
                <input
                  className="auth-input"
                  type="password"
                  autoComplete="current-password"
                  value={delPass}
                  onChange={(ev) => setDelPass(ev.target.value)}
                  disabled={delBusy}
                  minLength={6}
                />
              </label>
            ) : (
              <label className="auth-field" style={{ marginTop: 12 }}>
                <span className="auth-label">Digite seu e-mail completo</span>
                <input
                  className="auth-input"
                  type="email"
                  autoComplete="email"
                  value={delEmail}
                  onChange={(ev) => setDelEmail(ev.target.value)}
                  disabled={delBusy}
                />
              </label>
            )}
            {delErr ? <p className="auth-error">{delErr}</p> : null}
            <button
              type="submit"
              className="btn-ghost"
              style={{
                marginTop: 14,
                borderColor: "var(--coral)",
                color: "var(--coral)",
                fontWeight: 800,
              }}
              disabled={delBusy}
            >
              {delBusy ? "Excluindo…" : "Excluir minha conta permanentemente"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
