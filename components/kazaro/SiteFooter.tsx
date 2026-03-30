import Link from "next/link";

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              Kazaro
            </Link>
            <p className="footer-tagline">Marketplace de serviços para casa com profissionais verificados.</p>
          </div>
          <div>
            <div className="footer-col-title">Serviços</div>
            <ul className="footer-links">
              <li>
                <Link href="/search">Encanamento</Link>
              </li>
              <li>
                <Link href="/search">Elétrica</Link>
              </li>
              <li>
                <Link href="/search">Limpeza</Link>
              </li>
              <li>
                <Link href="/search">Montagem</Link>
              </li>
              <li>
                <Link href="/search">Pintura</Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Empresa</div>
            <ul className="footer-links">
              <li>
                <a href="#">Sobre o Kazaro</a>
              </li>
              <li>
                <Link href="/dashboard">Para profissionais</Link>
              </li>
              <li>
                <a href="/#como-funciona">Como funciona</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Suporte</div>
            <ul className="footer-links">
              <li>
                <a href="#">Central de ajuda</a>
              </li>
              <li>
                <a href="#">Fale conosco</a>
              </li>
              <li>
                <a href="#">Garantia Kazaro</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© {new Date().getFullYear()} Kazaro. Florianópolis, SC.</span>
          <div className="footer-legal">
            <a href="#">Privacidade</a>
            <a href="#">Termos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
