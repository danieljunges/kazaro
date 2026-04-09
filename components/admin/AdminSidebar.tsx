"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

function adminNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ email, adminBase }: { email: string | null; adminBase: string }) {
  const pathname = usePathname();
  const nav = useMemo(
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

  return (
    <aside className="dash-sidebar">
      <Link href={adminBase} className="ds-logo" aria-label="Kazaro, administração">
        <span className="ds-logo-name">Kazaro</span>
      </Link>

      <div className="ds-profile">
        <div className="ds-ava-letter" aria-hidden>
          {(email?.[0] ?? "A").toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="ds-pname">Administrador</div>
          <div className="ds-prole" style={{ wordBreak: "break-all" }}>
            {email ?? "-"}
          </div>
        </div>
      </div>

      <span className="ds-nav-label">Admin</span>
      {nav.map((i) => (
        <Link key={i.href} href={i.href} className={`ds-link${adminNavActive(pathname, i.href) ? " on" : ""}`}>
          {i.label}
        </Link>
      ))}

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <Link href="/dashboard" className="ds-link" style={{ fontSize: "12.5px" }}>
          ← Voltar ao dashboard
        </Link>
      </div>
    </aside>
  );
}
