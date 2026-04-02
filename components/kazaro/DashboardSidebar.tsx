"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { LogoIcon } from "./Brand";

const NAV = [
  { label: "Visão geral", href: "/dashboard", icon: "grid" as const },
  { label: "Meus serviços", href: "/dashboard/servicos", icon: "wrench" as const },
  { label: "Mensagens", href: "/dashboard/mensagens", icon: "msg" as const },
  { label: "Ganhos", href: "/dashboard/ganhos", icon: "money" as const },
] as const;

function Icon({ name }: { name: (typeof NAV)[number]["icon"] }) {
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
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export function DashboardSidebar({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="dash-sidebar">
      <Link href="/dashboard" className="ds-logo" aria-label="Kazaro — Dashboard">
        <div className="ds-logo-icon">
          <LogoIcon />
        </div>
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
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`ds-link${pathname === item.href ? " on" : ""}`}
          aria-current={pathname === item.href ? "page" : undefined}
        >
          <Icon name={item.icon} />
          {item.label}
        </Link>
      ))}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        {userEmail ? <SignOutButton /> : null}
        <Link href="/pro" className="ds-link" style={{ fontSize: "12.5px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Ativar Perfil Pro
        </Link>
        <Link href="/" className="ds-link" style={{ fontSize: "12.5px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Ver site público
        </Link>
      </div>
    </aside>
  );
}
