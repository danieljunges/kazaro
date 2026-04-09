"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AUTH_SIGNOUT_MIN_MS, ensureMinElapsedSince } from "@/lib/auth/auth-ui-timing";
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
  initialEmail: string | null;
  initialAvatarUrl?: string | null;
  accountKind?: ProfileRole | null;
}) {
  const serverLoggedIn = Boolean(initialEmail);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  /* 1) Alinha com o servidor: visitante no HTML nunca mostra nome por causa de sessão antiga no browser. */
  useLayoutEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!serverLoggedIn) {
        setUser(null);
      } else if (session?.user) {
        setUser({
          email: session.user.email ?? null,
          avatarUrl: initialAvatarUrl ?? null,
        });
      } else {
        setUser({ email: initialEmail, avatarUrl: initialAvatarUrl ?? null });
      }
      setReady(true);
    });
  }, [serverLoggedIn, initialEmail, initialAvatarUrl]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!serverLoggedIn) {
        if (event === "SIGNED_IN" && session?.user) {
          setUser({
            email: session.user.email ?? null,
            avatarUrl: initialAvatarUrl ?? null,
          });
        } else if (!session?.user) {
          setUser(null);
        }
      } else {
        if (event === "INITIAL_SESSION" && !session?.user) {
          return;
        }
        if (session?.user) {
          setUser({
            email: session.user.email ?? null,
            avatarUrl: initialAvatarUrl ?? null,
          });
        } else {
          setUser(null);
        }
      }
      setOpen(false);
    });

    const onDoc = (ev: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (ev.target instanceof Node && !el.contains(ev.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);

    return () => {
      sub.subscription.unsubscribe();
      document.removeEventListener("mousedown", onDoc);
    };
  }, [serverLoggedIn, initialEmail, initialAvatarUrl]);

  if (!ready) {
    return (
      <div className="nav-user nav-user--hydrating" aria-busy="true" aria-label="Carregando conta">
        <span className="nav-pending-label">Carregando…</span>
      </div>
    );
  }

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
          <div className="nav-user-email">{email ?? "-"}</div>
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
              const t0 = Date.now();
              try {
                const supabase = getSupabaseBrowserClient();
                await supabase.auth.signOut();
                await ensureMinElapsedSince(t0, AUTH_SIGNOUT_MIN_MS);
                window.location.assign("/?saiu=1");
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
