import Link from "next/link";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { requireProfessionalTools } from "@/lib/auth/require-pro-tools";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchEarningsThisMonth } from "@/lib/supabase/earnings";

function formatBRLFromCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
    cents / 100,
  );
}

export default async function DashboardGanhosPage() {
  const { user } = await requireProfessionalTools("/dashboard/ganhos");
  const supabase = await getSupabaseServerClient();

  const { totalCents, completedCount } = await fetchEarningsThisMonth(user.id);

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/dashboard" backLabel="← Dashboard" />
      <div className="section">
        <div className="pro-page-card" style={{ maxWidth: 980 }}>
          <div className="dc-head" style={{ marginBottom: 12 }}>
            Ganhos
            <Link href="/dashboard" className="dc-link">
              ← Dashboard
            </Link>
          </div>

          <div className="kz-earn-grid">
            <div className="kz-earn-card">
              <div className="kz-earn-label">Este mês</div>
              <div className="kz-earn-val">{formatBRLFromCents(totalCents)}</div>
              <div className="kz-earn-sub">{completedCount} serviços concluídos</div>
            </div>
            <div className="kz-earn-card kz-earn-card--hint">
              <div className="kz-earn-label">Como isso é calculado</div>
              <p className="kz-earn-copy">
                Soma dos agendamentos com status <strong>concluído</strong>. Por enquanto, usamos o preço do serviço
                selecionado no pedido. Depois entraremos com pagamentos e repasses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

