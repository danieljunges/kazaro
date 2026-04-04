"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ITEMS_PRO = [
  { label: "Visão geral", href: "/dashboard" },
  { label: "Meus serviços", href: "/dashboard/servicos" },
  { label: "Mensagens", href: "/dashboard/mensagens" },
  { label: "Suporte", href: "/dashboard/suporte" },
  { label: "Ganhos", href: "/dashboard/ganhos" },
  { label: "Configurações", href: "/dashboard/configuracoes" },
] as const;

const ITEMS_CLIENT = [
  { label: "Visão geral", href: "/dashboard" },
  { label: "Buscar profissionais", href: "/search" },
  { label: "Histórico de serviços", href: "/dashboard/historico" },
  { label: "Mensagens", href: "/dashboard/mensagens" },
  { label: "Suporte", href: "/dashboard/suporte" },
  { label: "Configurações", href: "/dashboard/configuracoes" },
] as const;

function itemActive(pathname: string, href: string): boolean {
  if (href === "/search") return pathname === "/search";
  if (href === "/dashboard") return pathname === "/dashboard" || pathname.startsWith("/dashboard/pedidos");
  if (href === "/dashboard/mensagens") return pathname.startsWith("/dashboard/mensagens");
  if (href === "/dashboard/suporte") return pathname.startsWith("/dashboard/suporte");
  if (href === "/dashboard/historico") return pathname.startsWith("/dashboard/historico");
  return pathname === href;
}

export function DashboardMobileMenu({ accountKind }: { accountKind: "client" | "professional" | "admin" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isProfessional = accountKind === "professional" || accountKind === "admin";
  const items = isProfessional ? ITEMS_PRO : ITEMS_CLIENT;

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
            {items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className={`dash-mnav-link${itemActive(pathname, i.href) ? " on" : ""}`}
                aria-current={itemActive(pathname, i.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {i.label}
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
