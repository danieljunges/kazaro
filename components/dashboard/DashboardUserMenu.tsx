"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AUTH_SIGNOUT_MIN_MS, ensureMinElapsedSince } from "@/lib/auth/auth-ui-timing";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function initialFromEmail(email: string | null): string {
  const c = (email?.trim()?.[0] ?? "?").toUpperCase();
  return /[A-Z0-9]/.test(c) ? c : "?";
}

/**
 * Menu da conta na topbar do dashboard.
 * Dados vêm só do servidor (página já exige login), sem `onAuthStateChange` que limpava e-mail
 * antes do redirect no logout e gerava UI estranha.
 */
export function DashboardUserMenu({
  initialEmail,
  initialAvatarUrl,
  showProLinks,
}: {
  initialEmail: string | null;
  initialAvatarUrl: string | null;
  showProLinks: boolean;
}) {
  const [email, setEmail] = useState<string | null>(initialEmail);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setEmail(initialEmail);
    setAvatarUrl(initialAvatarUrl);
  }, [initialEmail, initialAvatarUrl]);

  useEffect(() => {
    const onDoc = (ev: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (ev.target instanceof Node && !el.contains(ev.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="kz-dash-user" ref={rootRef}>
      <button
        type="button"
        className="kz-dash-ava-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu da conta"
      >
        <span className="kz-dash-ava" aria-hidden>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" />
          ) : (
            initialFromEmail(email)
          )}
        </span>
      </button>

      {open ? (
        <div className="kz-dash-user-pop" role="menu">
          <div className="kz-dash-user-email">{email ?? "-"}</div>
          {showProLinks ? (
            <Link className="kz-dash-user-link" role="menuitem" href="/dashboard/servicos">
              Meus serviços
            </Link>
          ) : null}
          <Link className="kz-dash-user-link" role="menuitem" href="/dashboard/mensagens">
            Mensagens
          </Link>
          {!showProLinks ? (
            <Link className="kz-dash-user-link" role="menuitem" href="/dashboard/historico">
              Histórico de serviços
            </Link>
          ) : null}
          <Link className="kz-dash-user-link" role="menuitem" href="/dashboard/suporte">
            Suporte
          </Link>
          {showProLinks ? (
            <Link className="kz-dash-user-link" role="menuitem" href="/dashboard/ganhos">
              Ganhos
            </Link>
          ) : null}
          <Link className="kz-dash-user-link" role="menuitem" href="/dashboard/configuracoes">
            Configurações
          </Link>
          {!showProLinks ? (
            <Link className="kz-dash-user-link" role="menuitem" href="/para-profissionais">
              Virar prestador →
            </Link>
          ) : null}
          <button
            type="button"
            className="kz-dash-user-link kz-dash-user-link--danger"
            role="menuitem"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const t0 = Date.now();
              try {
                await getSupabaseBrowserClient().auth.signOut();
                await ensureMinElapsedSince(t0, AUTH_SIGNOUT_MIN_MS);
                window.location.assign("/?saiu=1");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Saindo…" : "Sair da conta"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
