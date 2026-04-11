import Link from "next/link";
import { INSTAGRAM_URL } from "@/lib/site";

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              Kazaro
            </Link>
            <p className="footer-tagline">
              Encontre profissionais, veja serviços e agende em um só lugar.
            </p>
          </div>
          <div>
            <div className="footer-col-title">Serviços</div>
            <ul className="footer-links">
              <li>
                <Link href="/search?q=barbearia">Barbearia</Link>
              </li>
              <li>
                <Link href="/search?q=manicure">Manicure</Link>
              </li>
              <li>
                <Link href="/search?q=sobrancelha">Design de sobrancelha</Link>
              </li>
              <li>
                <Link href="/search?q=cilios">Extensão de cílios</Link>
              </li>
              <li>
                <Link href="/search?q=cabeleireiro">Cabelo</Link>
              </li>
              <li>
                <Link href="/search?q=tatuagem">Tatuagem</Link>
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
                <a href="/#como-funciona">Como funciona</a>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/carreiras">Carreiras</Link>
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
          <span className="footer-copy">© {new Date().getFullYear()} Kazaro.</span>
          <div className="footer-bottom-end">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social"
              aria-label="Kazaro no Instagram"
            >
              <InstagramIcon />
            </a>
            <div className="footer-legal">
              <Link href="/privacidade">Privacidade</Link>
              <Link href="/cookies">Cookies</Link>
              <Link href="/termos">Termos</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
