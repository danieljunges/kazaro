"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRole } from "@/lib/supabase/profile";

type SessionUser = { email: string | null; avatarUrl: string | null };

function initialFromEmail(email: string | null): string {
  const c = (email?.trim()?.[0] ?? "?").toUpperCase();
  return /[A-Z0-9]/.test(c) ? c : "?";
}

export function NavUserMenu({
  initialEmail,
  initialAvatarUrl,
  accountKind,
}: {
  initialEmail?: string | null;
  initialAvatarUrl?: string | null;
  /** Papel da conta (servidor); só usado quando há sessão */
  accountKind?: ProfileRole | null;
}) {
  const [checked, setChecked] = useState(initialEmail !== undefined);
  const [user, setUser] = useState<SessionUser | null>(() => {
    if (initialEmail === undefined) return null;
    return { email: initialEmail ?? null, avatarUrl: initialAvatarUrl ?? null };
  });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseBrowserClient();

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!cancelled) {
        setUser(
          data.session?.user
            ? { email: data.session.user.email ?? null, avatarUrl: initialAvatarUrl ?? null }
            : null,
        );
        setChecked(true);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email ?? null, avatarUrl: initialAvatarUrl ?? null } : null);
      setChecked(true);
      setOpen(false);
    });

    const onDoc = (ev: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (ev.target instanceof Node && !el.contains(ev.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      document.removeEventListener("mousedown", onDoc);
    };
  }, []);

  if (!checked) return null;

  if (!user) {
    return (
      <>
        <Link href="/entrar" className="btn-ghost">
          Entrar
        </Link>
        <Link href="/criar-conta" className="btn-ghost">
          Criar conta
        </Link>
      </>
    );
  }

  const email = user.email;
  const label = email ? email.split("@")[0] : "Minha conta";
  const isProNav = accountKind === "professional" || accountKind === "admin";

  return (
    <div className="nav-user" ref={rootRef}>
      <button
        type="button"
        className="nav-user-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="nav-user-ava" aria-hidden>
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" />
          ) : (
            initialFromEmail(email)
          )}
        </span>
        <span className="nav-user-name">{label}</span>
        <span className="nav-user-caret" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div className="nav-user-pop" role="menu" aria-label="Conta">
          <div className="nav-user-email">{email ?? "—"}</div>
          {isProNav ? (
            <Link className="nav-user-link" role="menuitem" href="/dashboard">
              Dashboard
            </Link>
          ) : (
            <Link className="nav-user-link" role="menuitem" href="/dashboard/historico">
              Histórico de serviços
            </Link>
          )}
          <Link className="nav-user-link" role="menuitem" href="/dashboard/mensagens">
            Mensagens
          </Link>
          <Link className="nav-user-link" role="menuitem" href="/dashboard/suporte">
            Suporte
          </Link>
          <Link className="nav-user-link" role="menuitem" href="/dashboard/configuracoes">
            Configurações
          </Link>
          <button
            type="button"
            className="nav-user-link nav-user-link--danger"
            role="menuitem"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const supabase = getSupabaseBrowserClient();
                await supabase.auth.signOut();
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Saindo…" : "Sair"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

