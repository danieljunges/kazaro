"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";

type NavIcon = "grid" | "wrench" | "msg" | "money" | "search" | "help" | "list";

const NAV_PRO = [
  { label: "Visão geral", href: "/dashboard", icon: "grid" as const },
  { label: "Meus serviços", href: "/dashboard/servicos", icon: "wrench" as const },
  { label: "Mensagens", href: "/dashboard/mensagens", icon: "msg" as const },
  { label: "Suporte", href: "/dashboard/suporte", icon: "help" as const },
  { label: "Ganhos", href: "/dashboard/ganhos", icon: "money" as const },
] as const;

const NAV_CLIENT = [
  { label: "Visão geral", href: "/dashboard", icon: "grid" as const },
  { label: "Buscar profissionais", href: "/search", icon: "search" as const },
  { label: "Histórico de serviços", href: "/dashboard/historico", icon: "list" as const },
  { label: "Mensagens", href: "/dashboard/mensagens", icon: "msg" as const },
  { label: "Suporte", href: "/dashboard/suporte", icon: "help" as const },
] as const;

function Icon({ name }: { name: NavIcon }) {
  if (name === "grid") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }
  if (name === "search") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    );
  }
  if (name === "wrench") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    );
  }
  if (name === "msg") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  if (name === "help") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  if (name === "list") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function navLinkActive(pathname: string, href: string): boolean {
  if (href === "/search") return pathname === "/search";
  if (href === "/dashboard") return pathname === "/dashboard" || pathname.startsWith("/dashboard/pedidos");
  if (href === "/dashboard/mensagens") return pathname.startsWith("/dashboard/mensagens");
  if (href === "/dashboard/suporte") return pathname.startsWith("/dashboard/suporte");
  if (href === "/dashboard/historico") return pathname.startsWith("/dashboard/historico");
  return pathname === href;
}

export function DashboardSidebar({
  userEmail,
  accountKind,
}: {
  userEmail: string | null;
  accountKind: "client" | "professional" | "admin";
}) {
  const pathname = usePathname();
  const isProfessional = accountKind === "professional" || accountKind === "admin";
  const nav = isProfessional ? NAV_PRO : NAV_CLIENT;
  const accountLabel = accountKind === "admin" ? "Admin" : accountKind === "professional" ? "Profissional" : "Cliente";

  return (
    <aside className="dash-sidebar">
      <Link href="/dashboard" className="ds-logo" aria-label="Kazaro — Dashboard">
        <span className="ds-logo-name">Kazaro</span>
      </Link>
      <div className="ds-profile">
        {userEmail ? (
          <>
            <div className="ds-ava-letter" aria-hidden>
              {(userEmail[0] ?? "?").toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="ds-pname">{userEmail.split("@")[0]}</div>
              <div className="ds-prole" style={{ wordBreak: "break-all" }}>
                {userEmail}
              </div>
              <span className={`ds-role-pill${accountKind !== "client" ? " ds-role-pill--pro" : ""}`}>{accountLabel}</span>
            </div>
          </>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://i.pravatar.cc/80?img=11" alt="" />
            <div>
              <div className="ds-pname">Modo demonstração</div>
              <div className="ds-prole">
                <Link href="/entrar">Entrar</Link>
                {" · "}
                <Link href="/criar-conta">Criar conta</Link>
              </div>
            </div>
          </>
        )}
      </div>
      <span className="ds-nav-label">Menu</span>
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`ds-link${navLinkActive(pathname, item.href) ? " on" : ""}`}
          aria-current={navLinkActive(pathname, item.href) ? "page" : undefined}
        >
          <Icon name={item.icon} />
          {item.label}
        </Link>
      ))}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        {userEmail ? (
          <Link href="/dashboard/configuracoes" className="ds-link" style={{ fontSize: "12.5px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            Configurações
          </Link>
        ) : null}
        {userEmail ? <SignOutButton /> : null}
        {isProfessional ? (
          <Link href="/pro" className="ds-link" style={{ fontSize: "12.5px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Ativar Perfil Pro
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
