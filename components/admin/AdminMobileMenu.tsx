"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function adminNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

export function AdminMobileMenu({ adminBase }: { adminBase: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () => [
      { label: "Visão geral", href: adminBase },
      { label: "Serviços", href: `${adminBase}/servicos` },
      { label: "Usuários", href: `${adminBase}/usuarios` },
      { label: "Agendamentos", href: `${adminBase}/agendamentos` },
      { label: "Suporte", href: `${adminBase}/suporte` },
      { label: "Relatórios", href: `${adminBase}/relatorios` },
    ],
    [adminBase],
  );

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
    <div className="dash-mnav dash-mnav--admin">
      <button
        type="button"
        className="dash-mnav-btn"
        aria-expanded={open}
        aria-label={open ? "Fechar menu admin" : "Abrir menu admin"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="dash-mnav-bun" aria-hidden />
        <span className="dash-mnav-bun" aria-hidden />
        <span className="dash-mnav-bun" aria-hidden />
      </button>

      {open ? (
        <>
          <div className="dash-mnav-backdrop" aria-hidden onClick={() => setOpen(false)} />
          <div className="dash-mnav-panel" role="dialog" aria-modal="true" aria-label="Menu administrativo">
            <div className="dash-mnav-head">
              <span className="dash-mnav-title">Admin</span>
              <button type="button" className="dash-mnav-close" onClick={() => setOpen(false)} aria-label="Fechar">
                ×
              </button>
            </div>
            {items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className={`dash-mnav-link${adminNavActive(pathname, i.href) ? " on" : ""}`}
                aria-current={adminNavActive(pathname, i.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {i.label}
              </Link>
            ))}
            <Link href="/dashboard" className="dash-mnav-link dash-mnav-link--muted" onClick={() => setOpen(false)}>
              ← Voltar ao dashboard
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
