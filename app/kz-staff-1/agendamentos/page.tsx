import { adminPath } from "@/lib/admin/panel-path";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { BookingStatusButtons } from "@/components/dashboard/BookingStatusButtons";
import { bookingStatusLabelShort } from "@/lib/booking/workflow";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function fmt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}

function statusPt(status: string): string {
  return bookingStatusLabelShort(status);
}

export default async function AdminAgendamentosPage() {
  await requireAdmin(adminPath("/agendamentos"));
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
            Fluxo no painel do prestador: <strong>Pendente</strong> → <strong>Confirmado</strong> →{" "}
            <strong>Em andamento</strong> ao iniciar → <strong>Concluído</strong> com foto de comprovação, ou{" "}
            <strong>Arquivar</strong> a qualquer momento (sai dos ativos, sem ser concluído).{" "}
            <strong>Cancelar</strong> comunica cancelamento; <strong>Arquivar</strong> é organização da lista. No admin
            você pode concluir sem foto. E-mails ao cliente se o Resend estiver configurado.
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
                      <td style={{ fontSize: 12 }}>{b.client_email_snapshot ?? "-"}</td>
                      <td>{b.service_name_snapshot?.trim() || "Serviço"}</td>
                      <td>{fmt(b.scheduled_at)}</td>
                      <td style={{ fontWeight: 800 }}>{statusPt(b.status)}</td>
                      <td style={{ textAlign: "right" }}>
                        <BookingStatusButtons bookingId={b.id} currentStatus={b.status} adminBypassProof />
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

