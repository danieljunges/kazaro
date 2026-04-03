"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Visão geral", href: "/admin" },
  { label: "Serviços", href: "/admin/servicos" },
  { label: "Usuários", href: "/admin/usuarios" },
  { label: "Agendamentos", href: "/admin/agendamentos" },
  { label: "Suporte", href: "/admin/suporte" },
  { label: "Relatórios", href: "/admin/relatorios" },
] as const;

function adminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ email }: { email: string | null }) {
  const pathname = usePathname();
  return (
    <aside className="dash-sidebar">
      <Link href="/admin" className="ds-logo" aria-label="Kazaro — Admin">
        <div className="ds-logo-icon">
          <span style={{ color: "var(--lime)", fontWeight: 900, fontSize: 14 }}>K</span>
        </div>
        <span className="ds-logo-name">Admin</span>
      </Link>

      <div className="ds-profile">
        <div className="ds-ava-letter" aria-hidden>
          {(email?.[0] ?? "A").toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="ds-pname">Administrador</div>
          <div className="ds-prole" style={{ wordBreak: "break-all" }}>
            {email ?? "—"}
          </div>
        </div>
      </div>

      <span className="ds-nav-label">Admin</span>
      {NAV.map((i) => (
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

