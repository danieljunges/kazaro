import Link from "next/link";
import { adminPath } from "@/lib/admin/panel-path";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { bookingStatusLabelShort } from "@/lib/booking/workflow";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function fmt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function statusPt(status: string): string {
  return bookingStatusLabelShort(status);
}

export default async function AdminHome() {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const [
    { count: pendingServices },
    { count: approvedServices },
    { count: users },
    { count: bookingsTotal },
    { count: bookingsPending },
    { count: ticketsOpen },
    recentBookingsRes,
    openTicketsRes,
  ] = await Promise.all([
    supabase.from("pro_services").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("pro_services").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase
      .from("bookings")
      .select("id, scheduled_at, status, client_name_snapshot, service_name_snapshot")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("support_tickets")
      .select("id, subject, updated_at")
      .eq("status", "open")
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const recentBookings = recentBookingsRes.data ?? [];
  const openTickets = openTicketsRes.data ?? [];

  const needsAttention = (pendingServices ?? 0) > 0 || (ticketsOpen ?? 0) > 0 || (bookingsPending ?? 0) > 0;

  return (
    <>
      <div className="dash-topbar">
        <div>
          <div className="dt-title">Painel administrativo</div>
          <div className="dt-sub">Visão geral da plataforma: filas, números e acesso a todos os módulos</div>
        </div>
        <div className="dt-right" style={{ flexWrap: "wrap", gap: 10 }}>
          <Link href={adminPath("/servicos")} className="btn-cta" style={{ textDecoration: "none" }}>
            Fila de serviços →
          </Link>
          <Link href={adminPath("/suporte")} className="btn-ghost" style={{ textDecoration: "none" }}>
            Suporte →
          </Link>
        </div>
      </div>

      <div className="dash-content">
        {needsAttention ? (
          <div className="admin-hub-alert" role="status">
            <strong>Requer atenção:</strong>
            {(pendingServices ?? 0) > 0 ? (
              <span>
                {" "}
                <Link href={adminPath("/servicos")} className="dc-link">
                  {pendingServices} serviço(s) aguardando aprovação
                </Link>
              </span>
            ) : null}
            {(ticketsOpen ?? 0) > 0 ? (
              <span>
                {(pendingServices ?? 0) > 0 ? " · " : " "}
                <Link href={adminPath("/suporte")} className="dc-link">
                  {ticketsOpen} chamado(s) de suporte aberto(s)
                </Link>
              </span>
            ) : null}
            {(bookingsPending ?? 0) > 0 ? (
              <span>
                {(pendingServices ?? 0) > 0 || (ticketsOpen ?? 0) > 0 ? " · " : " "}
                <Link href={adminPath("/agendamentos")} className="dc-link">
                  {bookingsPending} agendamento(s) pendente(s)
                </Link>
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="kpi-grid">
          <Link href={adminPath("/servicos")} className="kpi-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="kpi-top">
              <span className={`kpi-pill ${(pendingServices ?? 0) > 0 ? "pill-warn" : "pill-up"}`}>
                {(pendingServices ?? 0) > 0 ? "fila" : "ok"}
              </span>
            </div>
            <div className="kpi-val">{pendingServices ?? 0}</div>
            <div className="kpi-label">Serviços pendentes</div>
          </Link>
          <Link href={adminPath("/suporte")} className="kpi-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="kpi-top">
              <span className={`kpi-pill ${(ticketsOpen ?? 0) > 0 ? "pill-warn" : "pill-up"}`}>
                {(ticketsOpen ?? 0) > 0 ? "abertos" : "zerado"}
              </span>
            </div>
            <div className="kpi-val">{ticketsOpen ?? 0}</div>
            <div className="kpi-label">Chamados suporte</div>
          </Link>
          <Link href={adminPath("/agendamentos")} className="kpi-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="kpi-top">
              <span className={`kpi-pill ${(bookingsPending ?? 0) > 0 ? "pill-warn" : "pill-up"}`}>
                na fila
              </span>
            </div>
            <div className="kpi-val">{bookingsPending ?? 0}</div>
            <div className="kpi-label">Agend. pendentes</div>
          </Link>
          <Link href={adminPath("/usuarios")} className="kpi-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="kpi-top">
              <span className="kpi-pill pill-up">base</span>
            </div>
            <div className="kpi-val">{users ?? 0}</div>
            <div className="kpi-label">Usuários</div>
          </Link>
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-pill pill-up">catálogo</span>
            </div>
            <div className="kpi-val">{approvedServices ?? 0}</div>
            <div className="kpi-label">Serviços aprovados</div>
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink50)", fontWeight: 600 }}>
              {bookingsTotal ?? 0} agendamentos no total
            </div>
          </div>
        </div>

        <div className="admin-hub-grid">
          <Link href={adminPath("/servicos")} className="admin-hub-card admin-hub-card--servicos">
            <div className="admin-hub-card-title">Serviços</div>
            <p className="admin-hub-card-desc">Aprovar ou rejeitar o que prestadores cadastraram antes de ir ao ar.</p>
            <span
              className={`admin-hub-card-meta ${(pendingServices ?? 0) > 0 ? "admin-hub-card-meta--warn" : ""}`}
            >
              {(pendingServices ?? 0) > 0
                ? `${pendingServices} na fila de moderação`
                : "Nada pendente no momento"}
            </span>
            <span className="admin-hub-card-arrow" aria-hidden>
              →
            </span>
          </Link>
          <Link href={adminPath("/usuarios")} className="admin-hub-card admin-hub-card--usuarios">
            <div className="admin-hub-card-title">Usuários</div>
            <p className="admin-hub-card-desc">Perfis, papéis (cliente / prestador / admin) e suporte à conta.</p>
            <span className="admin-hub-card-meta">{users ?? 0} cadastrados</span>
            <span className="admin-hub-card-arrow" aria-hidden>
              →
            </span>
          </Link>
          <Link href={adminPath("/agendamentos")} className="admin-hub-card admin-hub-card--agenda">
            <div className="admin-hub-card-title">Agendamentos</div>
            <p className="admin-hub-card-desc">Auditar pedidos, status e ajudar em conflitos entre cliente e profissional.</p>
            <span className={`admin-hub-card-meta ${(bookingsPending ?? 0) > 0 ? "admin-hub-card-meta--warn" : ""}`}>
              {(bookingsPending ?? 0) > 0
                ? `${bookingsPending} aguardando confirmação`
                : "Nenhum pendente"}
            </span>
            <span className="admin-hub-card-arrow" aria-hidden>
              →
            </span>
          </Link>
          <Link href={adminPath("/suporte")} className="admin-hub-card admin-hub-card--suporte">
            <div className="admin-hub-card-title">Suporte</div>
            <p className="admin-hub-card-desc">Tickets abertos pelos usuários; respostas também por e-mail (Resend).</p>
            <span className={`admin-hub-card-meta ${(ticketsOpen ?? 0) > 0 ? "admin-hub-card-meta--warn" : ""}`}>
              {(ticketsOpen ?? 0) > 0 ? `${ticketsOpen} chamado(s) aberto(s)` : "Nenhum chamado aberto"}
            </span>
            <span className="admin-hub-card-arrow" aria-hidden>
              →
            </span>
          </Link>
          <Link href={adminPath("/relatorios")} className="admin-hub-card admin-hub-card--relatorios">
            <div className="admin-hub-card-title">Relatórios</div>
            <p className="admin-hub-card-desc">Indicadores e exportações para acompanhar a operação.</p>
            <span className="admin-hub-card-meta">Visão consolidada</span>
            <span className="admin-hub-card-arrow" aria-hidden>
              →
            </span>
          </Link>
        </div>

        <div className="admin-hub-split">
          <div className="dash-card" style={{ margin: 0 }}>
            <div className="dc-head">
              Últimos agendamentos
              <Link className="dc-link" href={adminPath("/agendamentos")} style={{ marginLeft: "auto" }}>
                Ver todos →
              </Link>
            </div>
            {!recentBookings.length ? (
              <p style={{ margin: 0, color: "var(--ink60)", fontSize: 14 }}>Ainda não há agendamentos.</p>
            ) : (
              <table className="admin-hub-mini-table">
                <thead>
                  <tr>
                    <th>Cliente / serviço</th>
                    <th>Quando</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.client_name_snapshot}</div>
                        <div style={{ fontSize: 12, color: "var(--ink50)" }}>{b.service_name_snapshot ?? "-"}</div>
                      </td>
                      <td style={{ whiteSpace: "nowrap", fontSize: 12, color: "var(--ink60)" }}>
                        {fmt(b.scheduled_at)}
                      </td>
                      <td style={{ fontSize: 12, fontWeight: 600 }}>{statusPt(b.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="dash-card" style={{ margin: 0 }}>
            <div className="dc-head">
              Chamados abertos
              <Link className="dc-link" href={adminPath("/suporte")} style={{ marginLeft: "auto" }}>
                Ir ao suporte →
              </Link>
            </div>
            {!openTickets.length ? (
              <p style={{ margin: 0, color: "var(--ink60)", fontSize: 14 }}>Nenhum ticket aberto.</p>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {openTickets.map((t) => (
                  <li
                    key={t.id}
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <Link href={adminPath(`/suporte/${t.id}`)} style={{ fontWeight: 600, fontSize: 14 }}>
                      {t.subject}
                    </Link>
                    <div style={{ fontSize: 12, color: "var(--ink50)", marginTop: 4 }}>
                      Atualizado {fmt(t.updated_at)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="dash-card" style={{ marginTop: 18 }}>
          <div className="dc-head">Rotina do administrador</div>
          <ul className="admin-hub-checklist">
            <li>Moderar serviços novos para manter qualidade e consistência nos perfis públicos.</li>
            <li>Responder chamados de suporte e, se preciso, ajustar agendamentos manualmente.</li>
            <li>Promover contas a prestador ou admin quando fizer sentido para a operação.</li>
            <li>Conferir relatórios periodicamente para volume de pedidos e saúde da base.</li>
          </ul>
        </div>
      </div>
    </>
  );
}
