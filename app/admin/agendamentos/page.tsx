import { requireAdmin } from "@/lib/admin/requireAdmin";
import { BookingStatusButtons } from "@/components/dashboard/BookingStatusButtons";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function fmt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}

function statusPt(status: string): string {
  switch (status) {
    case "pending":
      return "Pendente";
    case "confirmed":
      return "Confirmado";
    case "cancelled":
      return "Cancelado";
    case "completed":
      return "Concluído";
    default:
      return status;
  }
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
          <p style={{ margin: "0 0 14px", color: "var(--ink60)", fontSize: 14, lineHeight: 1.55 }}>
            Pedidos criados pelos clientes aparecem como <strong>Pendente</strong> até o profissional (ou você) confirmar.
            Ao mudar o status, o cliente recebe e-mail se o Resend estiver configurado.
          </p>
          {!data?.length ? (
            <p style={{ margin: 0, color: "var(--ink60)", fontSize: 14 }}>Sem agendamentos.</p>
          ) : (
            <div className="kz-table-scroll">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Contato</th>
                    <th>Serviço</th>
                    <th>Data</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((b: { id: string; scheduled_at: string; status: string; client_name_snapshot: string; client_email_snapshot: string | null; service_name_snapshot: string | null }) => (
                    <tr key={b.id}>
                      <td className="o-client">{b.client_name_snapshot}</td>
                      <td style={{ fontSize: 12 }}>{b.client_email_snapshot ?? "—"}</td>
                      <td>{b.service_name_snapshot ?? "A combinar"}</td>
                      <td>{fmt(b.scheduled_at)}</td>
                      <td style={{ fontWeight: 800 }}>{statusPt(b.status)}</td>
                      <td style={{ textAlign: "right" }}>
                        <BookingStatusButtons bookingId={b.id} currentStatus={b.status} />
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

