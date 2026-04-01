import Link from "next/link";
import { NavUserMenu } from "@/components/kazaro/NavUserMenu";

export function MarketingNav() {
  return (
    <nav>
      <div className="nav-inner">
        <Link href="/" className="logo">
          <div className="logo-k">
            <span>K</span>
          </div>
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
          <NavUserMenu />
          <Link href="/search" className="btn-cta">
            Agendar agora →
          </Link>
        </div>
      </div>
    </nav>
  );
}
