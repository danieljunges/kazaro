import Link from "next/link";
import { CompactNav } from "@/components/kazaro/CompactNav";

export default function DashboardReceitaPage() {
  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/dashboard" backLabel="← Dashboard" />
      <div className="section">
        <div className="pro-page-card" style={{ maxWidth: 860 }}>
          <span className="sec-eyebrow">Dashboard</span>
          <h1 className="sec-title" style={{ fontSize: "clamp(32px,4vw,42px)" }}>
            Receita detalhada
          </h1>
          <p className="sec-sub" style={{ marginBottom: 18 }}>
            Visão mensal, comparação por período e composição por serviço serão integradas com dados reais no backend.
          </p>
          <Link href="/dashboard" className="btn-cta">
            Voltar para visão geral →
          </Link>
        </div>
      </div>
    </div>
  );
}
