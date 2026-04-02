"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Props = {
  variant: "marketing" | "compact";
  backHref?: string;
  backLabel?: string;
};

export function SiteNavDrawer({ variant, backHref, backLabel }: Props) {
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
              <span className="kz-site-drawer-title">Menu</span>
              <button type="button" className="kz-site-drawer-close" onClick={() => setOpen(false)} aria-label="Fechar">
                ×
              </button>
            </div>

            {variant === "compact" && backHref && backLabel ? (
              <Link href={backHref} className="kz-site-drawer-link kz-site-drawer-link--back" onClick={() => setOpen(false)}>
                {backLabel}
              </Link>
            ) : null}

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
            <Link href="/dashboard" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
              Dashboard
            </Link>
            <Link href="/dashboard/servicos" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
              Meus serviços
            </Link>
            <Link href="/dashboard/mensagens" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
              Mensagens
            </Link>
            <Link href="/dashboard/ganhos" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
              Ganhos
            </Link>
            <Link href="/dashboard/configuracoes" className="kz-site-drawer-link" onClick={() => setOpen(false)}>
              Configurações
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
