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
                <Link href="/sobre">Sobre o Kazaro</Link>
              </li>
              <li>
                <Link href="/para-profissionais">Para profissionais</Link>
              </li>
              <li>
                <Link href="/pro">Perfil Pro (30 dias)</Link>
              </li>
              <li>
                <a href="/#como-funciona">Como funciona</a>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Suporte</div>
            <ul className="footer-links">
              <li>
                <Link href="/ajuda">Central de ajuda</Link>
              </li>
              <li>
                <Link href="/contato">Fale conosco</Link>
              </li>
              <li>
                <Link href="/garantia">Garantia Kazaro</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© {new Date().getFullYear()} Kazaro. Florianópolis, SC.</span>
          <div className="footer-legal">
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/termos">Termos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
