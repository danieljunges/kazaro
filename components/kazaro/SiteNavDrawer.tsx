"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ProfileRole } from "@/lib/supabase/profile";

type Props = {
  variant: "marketing" | "compact";
  backHref?: string;
  backLabel?: string;
  /** null = visitante (não logado) */
  accountKind: ProfileRole | null;
};

export function SiteNavDrawer({ variant, backHref, backLabel, accountKind }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const onDoc = (ev: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (ev.target instanceof Node && !el.contains(ev.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const isProNav = accountKind === "professional" || accountKind === "admin";
  /** No painel (CompactNav) o prestador já está no produto — não misturar com vitrine “Para profissionais” em destaque. */
  const dashboardCompact = variant === "compact" && accountKind != null;

  return (
    <div className="kz-site-drawer-root" ref={rootRef}>
      <button
        type="button"
        className="kz-site-drawer-btn"
        aria-expanded={open}
        aria-controls="kz-site-drawer-panel"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="kz-site-drawer-bun" aria-hidden />
        <span className="kz-site-drawer-bun" aria-hidden />
        <span className="kz-site-drawer-bun" aria-hidden />
      </button>

      {open ? (
        <>
          <div className="kz-site-drawer-backdrop" aria-hidden onClick={() => setOpen(false)} />
          <div id="kz-site-drawer-panel" className="kz-site-drawer-panel" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="kz-site-drawer-head">
              <span className="kz-site-drawer-title">{dashboardCompact && isProNav ? "Dashboard" : "Menu"}</span>
              <button type="button" className="kz-site-drawer-close" onClick={() => setOpen(false)} aria-label="Fechar">
                ×
              </button>
            </div>

            {variant === "compact" && backHref && backLabel ? (
              <Link href={backHref} className="kz-site-drawer-link kz-site-drawer-link--back" onClick={() => setOpen(false)}>
                {backLabel}
              </Link>
            ) : null}

            {dashboardCompact && isProNav ? (
              <>
                <div className="kz-site-drawer-section">Painel</div>
                <Link href="/dashboard" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Visão geral
                </Link>
                <Link href="/dashboard/agenda" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Agenda
                </Link>
                <Link href="/dashboard/servicos" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Meus serviços
                </Link>
                <Link href="/dashboard/mensagens" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Mensagens
                </Link>
                <Link href="/dashboard/suporte" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Suporte
                </Link>
                <Link href="/dashboard/ganhos" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Ganhos
                </Link>
                <Link href="/dashboard/configuracoes" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Configurações
                </Link>
                <div className="kz-site-drawer-section">Explorar o Kazaro</div>
                <Link href="/" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Página inicial
                </Link>
                <Link href="/search" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Buscar profissionais
                </Link>
              </>
            ) : dashboardCompact && !isProNav ? (
              <>
                <div className="kz-site-drawer-section">Minha conta</div>
                <Link href="/search" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Buscar profissionais
                </Link>
                <Link href="/dashboard/historico" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Histórico de serviços
                </Link>
                <Link href="/dashboard/mensagens" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Mensagens
                </Link>
                <Link href="/dashboard/suporte" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Suporte
                </Link>
                <Link href="/dashboard/configuracoes" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Configurações
                </Link>
                <div className="kz-site-drawer-section">Site</div>
                <Link href="/" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Página inicial
                </Link>
                <Link href="/#servicos" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Serviços
                </Link>
                <Link href="/#como-funciona" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Como funciona
                </Link>
                <Link href="/para-profissionais" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Para profissionais
                </Link>
              </>
            ) : (
              <>
                <div className="kz-site-drawer-section">Site</div>
                <Link href="/#servicos" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Serviços
                </Link>
                <Link href="/#como-funciona" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Como funciona
                </Link>
                <Link href="/para-profissionais" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Para profissionais
                </Link>
                <Link href="/search" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                  Buscar profissionais
                </Link>

                <div className="kz-site-drawer-section">Conta</div>
                {accountKind == null ? (
                  <>
                    <Link href="/entrar" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                      Entrar
                    </Link>
                    <Link href="/criar-conta" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                      Criar conta
                    </Link>
                  </>
                ) : isProNav ? (
                  <>
                    <Link href="/dashboard" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                      Dashboard
                    </Link>
                    <Link href="/dashboard/agenda" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                      Agenda
                    </Link>
                    <Link href="/dashboard/servicos" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                      Meus serviços
                    </Link>
                    <Link href="/dashboard/mensagens" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                      Mensagens
                    </Link>
                    <Link href="/dashboard/suporte" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                      Suporte
                    </Link>
                    <Link href="/dashboard/ganhos" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                      Ganhos
                    </Link>
                    <Link href="/dashboard/configuracoes" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                      Configurações
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard/historico" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                      Histórico de serviços
                    </Link>
                    <Link href="/dashboard/mensagens" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                      Mensagens
                    </Link>
                    <Link href="/dashboard/suporte" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                      Suporte
                    </Link>
                    <Link href="/dashboard" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                      Visão geral
                    </Link>
                    <Link href="/dashboard/configuracoes" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
                      Configurações
                    </Link>
                  </>
                )}
              </>
            )}

            <div className="kz-site-drawer-section">Legal</div>
            <Link href="/privacidade" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
              Política de privacidade
            </Link>
            <Link href="/cookies" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
              Política de cookies
            </Link>
            <Link href="/termos" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
              Termos de uso
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
