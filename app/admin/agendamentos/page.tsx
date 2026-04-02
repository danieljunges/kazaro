import { requireAdmin } from "@/lib/admin/requireAdmin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function fmt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}

export default async function AdminAgendamentosPage() {
  await requireAdmin("/admin/agendamentos");
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, scheduled_at, status, client_name_snapshot, client_email_snapshot, service_name_snapshot")
    .order("scheduled_at", { ascending: false })
    .limit(300);

  return (
    <>
      <div className="dash-topbar">
        <div>
          <div className="dt-title">Agendamentos</div>
          <div className="dt-sub">Auditoria e suporte</div>
        </div>
      </div>
      <div className="dash-content">
        <div className="dash-card">
          <div className="dc-head">Últimos</div>
          {!data?.length ? (
            <p style={{ margin: 0, color: "var(--ink60)", fontSize: 14 }}>Sem agendamentos.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Contato</th>
                    <th>Serviço</th>
                    <th>Data</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((b: any) => (
                    <tr key={b.id}>
                      <td className="o-client">{b.client_name_snapshot}</td>
                      <td style={{ fontSize: 12 }}>{b.client_email_snapshot ?? "—"}</td>
                      <td>{b.service_name_snapshot ?? "A combinar"}</td>
                      <td>{fmt(b.scheduled_at)}</td>
                      <td style={{ fontWeight: 800 }}>{b.status}</td>
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

