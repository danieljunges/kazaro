import { Suspense } from "react";
import Link from "next/link";
import { PublicNavRight } from "@/components/kazaro/PublicNavRight";

function NavRightFallback() {
  return (
    <div className="nav-right nav-right--pending" aria-busy="true" aria-label="Carregando menu da conta">
      <span className="nav-pending-label">Carregando…</span>
    </div>
  );
}

export function MarketingNav() {
  return (
    <nav>
      <div className="nav-inner">
        <Link href="/" className="logo" aria-label="Kazaro — início">
          Kazaro
        </Link>
        <ul className="nav-links">
          <li>
            <Link href="/#servicos">Serviços</Link>
          </li>
          <li>
            <a href="/#como-funciona">Como funciona</a>
          </li>
          <li>
            <Link href="/para-profissionais">Para profissionais</Link>
          </li>
        </ul>
        <div className="nav-right">
          <Suspense fallback={<NavRightFallback />}>
            <PublicNavRight variant="marketing" />
          </Suspense>
          <Link href="/search" className="btn-cta">
            <span className="nav-cta-long">Agendar serviço →</span>
            <span className="nav-cta-short">Agendar →</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
