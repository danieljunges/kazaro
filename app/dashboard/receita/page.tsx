import Link from "next/link";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { requireProfessionalTools } from "@/lib/auth/require-pro-tools";

export default async function DashboardReceitaPage() {
  await requireProfessionalTools("/dashboard/receita");
  // Mantido por compatibilidade: "Receita" agora aponta para Ganhos (dados reais).
  // (Página simples, sem depender de gráfico ainda.)
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
            A visão detalhada (gráficos e composição) vem depois. Por enquanto, veja os ganhos calculados a partir dos
            serviços concluídos.
          </p>
          <Link href="/dashboard/ganhos" className="btn-cta">
            Ver ganhos →
          </Link>
        </div>
      </div>
    </div>
  );
}
