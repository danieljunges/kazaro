import { Suspense } from "react";
import Link from "next/link";
import { CompactNavContextChip } from "@/components/kazaro/CompactNavContextChip";
import { CompactNavAccountCluster } from "@/components/kazaro/PublicNavRight";

type Props = {
  backHref: string;
  backLabel: string;
};

function NavRightFallback() {
  return (
    <div className="nav-right nav-right--pending" aria-busy="true" aria-label="Carregando menu da conta">
      <span className="nav-pending-label">Carregando…</span>
    </div>
  );
}

export function CompactNav({ backHref, backLabel }: Props) {
  return (
    <nav>
      <div className="nav-inner">
        <div className="nav-brand-cluster">
          <Link href="/" className="logo" aria-label="Kazaro, início">
            Kazaro
          </Link>
          <CompactNavContextChip backHref={backHref} backLabel={backLabel} />
        </div>
        <div className="nav-right">
          <Suspense fallback={<NavRightFallback />}>
            <CompactNavAccountCluster backHref={backHref} backLabel={backLabel} />
          </Suspense>
          <Link className="btn-ghost nav-compact-back-desktop" href={backHref}>
            {backLabel}
          </Link>
          <Link href="/search" className="btn-cta">
            <span className="nav-cta-long">Agendar serviço →</span>
            <span className="nav-cta-short">Agendar →</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
