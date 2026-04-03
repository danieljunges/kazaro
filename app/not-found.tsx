import Link from "next/link";
import { MarketingNav } from "@/components/kazaro/MarketingNav";
import { SiteFooter } from "@/components/kazaro/SiteFooter";

export default function NotFound() {
  return (
    <div className="home-editorial">
      <MarketingNav />
      <main className="public-page" style={{ padding: "max(100px, 12vw) 20px 80px", maxWidth: 560, margin: "0 auto" }}>
        <h1 className="editorial-h1" style={{ marginBottom: 16 }}>
          Página não encontrada
        </h1>
        <p style={{ color: "var(--ink60)", lineHeight: 1.6, marginBottom: 28 }}>
          O endereço pode ter sido digitado errado ou a página mudou de lugar.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link href="/" className="btn-primary">
            Início
          </Link>
          <Link href="/search" className="btn-ghost">
            Buscar profissionais
          </Link>
          <Link href="/ajuda" className="btn-ghost">
            Ajuda
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
