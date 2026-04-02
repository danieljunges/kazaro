import Link from "next/link";
import { NavUserMenuServer } from "@/components/kazaro/NavUserMenuServer";
import { SiteNavDrawer } from "@/components/kazaro/SiteNavDrawer";

type Props = {
  backHref: string;
  backLabel: string;
};

export function CompactNav({ backHref, backLabel }: Props) {
  return (
    <nav>
      <div className="nav-inner">
        <Link href="/" className="logo">
          <div className="logo-k">
            <span>K</span>
          </div>
          Kazaro
        </Link>
        <div className="nav-right">
          <SiteNavDrawer variant="compact" backHref={backHref} backLabel={backLabel} />
          <Link className="btn-ghost nav-compact-back-desktop" href={backHref}>
            {backLabel}
          </Link>
          <NavUserMenuServer />
          <Link href="/search" className="btn-cta">
            <span className="nav-cta-long">Agendar serviço →</span>
            <span className="nav-cta-short">Agendar →</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
