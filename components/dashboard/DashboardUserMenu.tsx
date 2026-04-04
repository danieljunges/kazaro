"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ensureMinElapsedSince } from "@/lib/auth/auth-ui-timing";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function initialFromEmail(email: string | null): string {
  const c = (email?.trim()?.[0] ?? "?").toUpperCase();
  return /[A-Z0-9]/.test(c) ? c : "?";
}

export function DashboardUserMenu({
  initialEmail,
  initialAvatarUrl,
  showProLinks,
}: {
  initialEmail: string | null;
  initialAvatarUrl: string | null;
  /** Serviços e ganhos (contas profissional/admin) */
  showProLinks: boolean;
}) {
  const [email, setEmail] = useState<string | null>(initialEmail);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const serverHadUser = Boolean(initialEmail);

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" && !session?.user && serverHadUser) {
        return;
      }
      setEmail(session?.user?.email ?? null);
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
  }, [initialEmail]);

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
                await ensureMinElapsedSince(t0);
                router.replace("/?saiu=1");
                router.refresh();
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

