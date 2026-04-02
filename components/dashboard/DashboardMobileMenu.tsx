"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ITEMS = [
  { label: "Visão geral", href: "/dashboard" },
  { label: "Meus serviços", href: "/dashboard/servicos" },
  { label: "Mensagens", href: "/dashboard/mensagens" },
  { label: "Ganhos", href: "/dashboard/ganhos" },
  { label: "Configurações", href: "/dashboard/configuracoes" },
] as const;

export function DashboardMobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="dash-mnav">
      <button
        type="button"
        className="dash-mnav-btn"
        aria-expanded={open}
        aria-label={open ? "Fechar menu do dashboard" : "Abrir menu do dashboard"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="dash-mnav-bun" aria-hidden />
        <span className="dash-mnav-bun" aria-hidden />
        <span className="dash-mnav-bun" aria-hidden />
      </button>

      {open ? (
        <>
          <div className="dash-mnav-backdrop" aria-hidden onClick={() => setOpen(false)} />
          <div className="dash-mnav-panel" role="dialog" aria-modal="true" aria-label="Menu do dashboard">
            <div className="dash-mnav-head">
              <span className="dash-mnav-title">Dashboard</span>
              <button type="button" className="dash-mnav-close" onClick={() => setOpen(false)} aria-label="Fechar">
                ×
              </button>
            </div>
            {ITEMS.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className={`dash-mnav-link${pathname === i.href ? " on" : ""}`}
                aria-current={pathname === i.href ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {i.label}
              </Link>
            ))}
            <Link href="/" className="dash-mnav-link dash-mnav-link--muted" onClick={() => setOpen(false)}>
              Ver site público
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
