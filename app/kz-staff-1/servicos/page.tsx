import { adminPath } from "@/lib/admin/panel-path";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ServiceReviewButtons } from "@/components/admin/ServiceReviewButtons";

function formatBRLFromCents(cents: number | null): string {
  if (cents == null || cents <= 0) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
    cents / 100,
  );
}

export default async function AdminServicosPage() {
  await requireAdmin(adminPath("/servicos"));
  const supabase = await getSupabaseServerClient();
  const { data: pending } = await supabase
    .from("pro_services")
    .select("id, name, description, price_cents, status, created_at, professional_id")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(200);

  return (
    <>
      <div className="dash-topbar">
        <div>
          <div className="dt-title">Serviços</div>
          <div className="dt-sub">Aprovar ou rejeitar serviços pendentes</div>
        </div>
      </div>
      <div className="dash-content">
        <div className="dash-card">
          <div className="dc-head">Pendentes</div>
          {!pending?.length ? (
            <p style={{ margin: 0, color: "var(--ink60)", fontSize: 14 }}>Nada pendente no momento.</p>
          ) : (
            <div className="kz-table-scroll">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Serviço</th>
                    <th>Preço</th>
                    <th>Descrição</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((s: any) => (
                    <tr key={s.id}>
                      <td className="o-client">{s.name}</td>
                      <td className="o-price">{formatBRLFromCents(s.price_cents ?? null)}</td>
                      <td style={{ maxWidth: 420, fontSize: 12 }}>{(s.description ?? "—").slice(0, 180)}</td>
                      <td style={{ minWidth: 320 }}>
                        <ServiceReviewButtons serviceId={s.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

