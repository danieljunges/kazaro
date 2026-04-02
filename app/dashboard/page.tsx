import Link from "next/link";
import { DashboardSidebar } from "@/components/kazaro/DashboardSidebar";
import { BookingStatusButtons } from "@/components/dashboard/BookingStatusButtons";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import {
  countActiveIncomingBookings,
  fetchIncomingBookingsForPro,
  fetchMyBookingsAsClient,
} from "@/lib/supabase/bookings";
import { fetchMyProfileRole } from "@/lib/supabase/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchMyProfile } from "@/lib/supabase/profile-data";

function formatTodayPtBR() {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function formatBookingWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function statusLabelPt(status: string): string {
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

function statusStyle(status: string): { background: string; color: string } {
  switch (status) {
    case "confirmed":
      return { background: "var(--success-bg)", color: "var(--success)" };
    case "pending":
      return { background: "var(--coral-bg)", color: "var(--coral)" };
    case "cancelled":
      return { background: "var(--ember-bg)", color: "var(--ember)" };
    case "completed":
      return { background: "var(--cream)", color: "var(--ink60)" };
    default:
      return { background: "var(--cream)", color: "var(--ink60)" };
  }
}

export default async function DashboardPage() {
  const subtitle = formatTodayPtBR();
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const uid = user?.id;
  const [role, incomingBookings, myBookingsAsClient, activeOrdersCount] = uid
    ? await Promise.all([
        fetchMyProfileRole(uid),
        fetchIncomingBookingsForPro(uid, 12),
        fetchMyBookingsAsClient(uid, 8),
        countActiveIncomingBookings(uid),
      ])
    : ["client", [], [], 0];
  const isPro = role === "professional";
  const profile = uid ? await fetchMyProfile(uid) : null;

  return (
    <div className="home-editorial">
      <div className="dash">
        <DashboardSidebar userEmail={user?.email ?? null} />
        <div className="dash-body">
        <div className="dash-topbar">
          <div>
            <div className="dt-title">Visão geral</div>
            <div className="dt-sub" style={{ textTransform: "capitalize" }}>
              {subtitle}
            </div>
          </div>
          <div className="dt-right">
            <button type="button" className="notif-btn" aria-label="Notificações">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--ink60)" }} aria-hidden>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <DashboardUserMenu
              initialEmail={user?.email ?? null}
              initialRole={isPro ? "professional" : "client"}
              initialAvatarUrl={profile?.avatar_url ?? null}
            />
          </div>
        </div>
        <div className="dash-content">
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-icon" style={{ background: "#F0FDF4" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--success)" }} aria-hidden>
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <span className="kpi-pill pill-up">+8.3%</span>
              </div>
              <div className="kpi-val">R$ 5.200</div>
              <div className="kpi-label">Receita este mês</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-icon" style={{ background: "#EFF6FF" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="2" />
                  </svg>
                </div>
                <span className="kpi-pill pill-up">
                  {activeOrdersCount > 0 ? `${activeOrdersCount} ativos` : "em tempo real"}
                </span>
              </div>
              <div className="kpi-val">{activeOrdersCount}</div>
              <div className="kpi-label">Pedidos ativos</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-icon" style={{ background: "var(--gold-bg)" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--gold)" }} aria-hidden>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <span className="kpi-pill pill-up">127 aval.</span>
              </div>
              <div className="kpi-val">4.9</div>
              <div className="kpi-label">Avaliação média</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-icon" style={{ background: "var(--ember-bg)" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--ember)" }} aria-hidden>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="kpi-pill pill-warn">não lidas</span>
              </div>
              <div className="kpi-val">3</div>
              <div className="kpi-label">Mensagens</div>
            </div>
          </div>
          {!isPro ? (
            <div className="dash-card" style={{ marginBottom: 18 }}>
              <div className="dc-head">Modo cliente</div>
              <p style={{ margin: 0, color: "var(--ink60)", fontSize: 14, lineHeight: 1.6 }}>
                Você está usando a conta como cliente. Para aparecer nas buscas e receber pedidos, ative o perfil de
                prestador.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                <Link href="/para-profissionais" className="btn-cta">
                  Ativar perfil de prestador →
                </Link>
                <Link href="/search" className="btn-ghost">
                  Buscar serviços
                </Link>
              </div>
            </div>
          ) : null}
          <div className="dash-card" style={{ marginBottom: 18 }}>
            <div className="dc-head">
              Perfil Pro{" "}
              <Link className="dc-link" href="/pro">
                Ver plano →
              </Link>
            </div>
            <p style={{ margin: 0, color: "var(--ink60)", fontSize: 14, lineHeight: 1.6 }}>
              Destaque seu perfil por 30 dias com mais visibilidade nas buscas e selo Pro na vitrine de profissionais.
            </p>
          </div>
          <div className="dash-row">
            <div className="dash-card">
              <div className="dc-head">
                Receita mensal{" "}
                <Link className="dc-link" href="/dashboard/receita">
                  Ver detalhes →
                </Link>
              </div>
              <div className="chart">
                {[
                  { h: "54%", lab: "Out" },
                  { h: "62%", lab: "Nov" },
                  { h: "79%", lab: "Dez" },
                  { h: "69%", lab: "Jan" },
                  { h: "92%", lab: "Fev" },
                  { h: "100%", lab: "Mar", hi: true },
                ].map((b) => (
                  <div key={b.lab} className="bar-col">
                    <span className="bar-val">{b.hi ? <span style={{ color: "var(--ink)", fontWeight: 700 }}>5.2k</span> : null}</span>
                    <div
                      className="bar"
                      style={{
                        height: b.hi ? b.h : b.h,
                        background: b.hi ? "var(--lime)" : "var(--cream2)",
                      }}
                    />
                    <span className="bar-label" style={b.hi ? { color: "var(--ink)", fontWeight: 700 } : undefined}>
                      {b.lab}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="dash-card">
              <div className="dc-head">
                Mensagens{" "}
                <Link className="dc-link" href="/dashboard/mensagens">
                  Ver todas →
                </Link>
              </div>
              <div className="msg-list">
                <div className="msg-item">
                  <div className="msg-ava">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://i.pravatar.cc/80?img=41" alt="" />
                    <span className="msg-unread">2</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="msg-name">Camila Neves</div>
                    <div className="msg-text">Preciso de um orçamento para...</div>
                  </div>
                  <span className="msg-time">10:24</span>
                </div>
                <div className="msg-item">
                  <div className="msg-ava">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://i.pravatar.cc/80?img=53" alt="" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="msg-name" style={{ color: "var(--ink60)" }}>
                      Lucas Tavares
                    </div>
                    <div className="msg-text">Obrigado pelo serviço!</div>
                  </div>
                  <span className="msg-time">Ontem</span>
                </div>
                <div className="msg-item">
                  <div className="msg-ava">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://i.pravatar.cc/80?img=45" alt="" />
                    <span className="msg-unread">1</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="msg-name">Isabella Rocha</div>
                    <div className="msg-text">Pode ser amanhã às 9h?</div>
                  </div>
                  <span className="msg-time">Ontem</span>
                </div>
              </div>
            </div>
          </div>
          {myBookingsAsClient.length > 0 ? (
            <div className="dash-card" style={{ marginBottom: 18 }}>
              <div className="dc-head">Meus agendamentos</div>
              <p style={{ margin: "0 0 14px", color: "var(--ink60)", fontSize: 14 }}>
                Pedidos que você enviou a profissionais pelo Kazaro.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Profissional</th>
                      <th>Serviço</th>
                      <th>Data</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myBookingsAsClient.map((row) => {
                      const pro = row.professionals;
                      const st = statusStyle(row.status);
                      return (
                        <tr key={row.id}>
                          <td className="o-client">
                            {pro?.slug ? (
                              <Link href={`/profissional/${pro.slug}`} className="dc-link" style={{ fontWeight: 700 }}>
                                {pro.display_name}
                              </Link>
                            ) : (
                              pro?.display_name ?? "—"
                            )}
                          </td>
                          <td>{row.service_name_snapshot ?? "A combinar"}</td>
                          <td>{formatBookingWhen(row.scheduled_at)}</td>
                          <td>
                            <span className="o-status" style={{ background: st.background, color: st.color }}>
                              {statusLabelPt(row.status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
          {isPro ? (
            <div className="dash-card">
              <div className="dc-head">Pedidos recebidos (agendamentos)</div>
              {incomingBookings.length === 0 ? (
                <p style={{ margin: 0, color: "var(--ink60)", fontSize: 14, lineHeight: 1.6 }}>
                  Nenhum pedido ainda. Assim que clientes agendarem pelo seu perfil público, eles aparecem aqui.
                </p>
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
                        <th>Obs.</th>
                        <th style={{ textAlign: "right" }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomingBookings.map((row) => {
                        const st = statusStyle(row.status);
                        return (
                          <tr key={row.id}>
                            <td className="o-client">{row.client_name_snapshot}</td>
                            <td style={{ fontSize: 12 }}>{row.client_email_snapshot ?? "—"}</td>
                            <td>{row.service_name_snapshot ?? "A combinar"}</td>
                            <td>{formatBookingWhen(row.scheduled_at)}</td>
                            <td>
                              <span className="o-status" style={{ background: st.background, color: st.color }}>
                                {statusLabelPt(row.status)}
                              </span>
                            </td>
                            <td style={{ fontSize: 12, maxWidth: 200 }} title={row.client_note ?? undefined}>
                              {row.client_note
                                ? `${row.client_note.slice(0, 80)}${row.client_note.length > 80 ? "…" : ""}`
                                : "—"}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <BookingStatusButtons bookingId={row.id} currentStatus={row.status} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
    </div>
  );
}

