import Link from "next/link";
import { NavUserMenuServer } from "@/components/kazaro/NavUserMenuServer";

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
          <Link className="btn-ghost" href={backHref}>
            {backLabel}
          </Link>
          <NavUserMenuServer />
          <Link href="/search" className="btn-cta">
            Agendar serviço →
          </Link>
        </div>
      </div>
    </nav>
  );
}
