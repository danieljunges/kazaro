import Link from "next/link";
import { CompactNav } from "@/components/kazaro/CompactNav";

export default function DashboardMensagensPage() {
  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/dashboard" backLabel="← Dashboard" />
      <div className="section">
        <div className="pro-page-card" style={{ maxWidth: 860 }}>
          <span className="sec-eyebrow">Dashboard</span>
          <h1 className="sec-title" style={{ fontSize: "clamp(32px,4vw,42px)" }}>
            Caixa de mensagens
          </h1>
          <p className="sec-sub" style={{ marginBottom: 18 }}>
            Histórico de conversa, filtros e respostas rápidas serão conectados no backend com dados reais.
          </p>
          <Link href="/dashboard" className="btn-cta">
            Voltar para visão geral →
          </Link>
        </div>
      </div>
    </div>
  );
}
