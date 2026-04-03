import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/kazaro/DashboardSidebar";
import { BookingStatusButtons } from "@/components/dashboard/BookingStatusButtons";
import { DashboardMobileMenu } from "@/components/dashboard/DashboardMobileMenu";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import { bookingStatusLabelShort } from "@/lib/booking/workflow";
import {
  countActiveIncomingBookings,
  fetchIncomingBookingsForPro,
} from "@/lib/supabase/bookings";
import { fetchEarningsThisMonth } from "@/lib/supabase/earnings";
import { fetchConversationsForDashboard } from "@/lib/supabase/messages";
import { fetchMyProfileRole, type ProfileRole } from "@/lib/supabase/profile";
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

function formatPriceBRL(cents: number | null | undefined): string {
  if (cents == null || cents <= 0) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
    cents / 100,
  );
}

function formatEarningsBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(
    cents / 100,
  );
}

function msgTimePt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(d);
  }
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Ontem";
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(d);
}

function statusLabelPt(status: string): string {
  return bookingStatusLabelShort(status);
}

function statusStyle(status: string): { background: string; color: string } {
  switch (status) {
    case "confirmed":
      return { background: "var(--success-bg)", color: "var(--success)" };
    case "in_progress":
      return { background: "rgba(21, 140, 121, 0.12)", color: "var(--success)" };
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

function serviceStatusPt(s: string): string {
  switch (s) {
    case "approved":
      return "Ativo";
    case "pending":
      return "Em análise";
    case "rejected":
      return "Rejeitado";
    default:
      return s;
  }
}

function proPlanActive(proUntil: string | null | undefined): boolean {
  if (!proUntil) return false;
  const t = new Date(proUntil);
  return !Number.isNaN(t.getTime()) && t > new Date();
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ conta?: string; admin?: string }>;
}) {
  const sp = await searchParams;
  const showAccountActivated = sp.conta === "ativada";
  const showAdminDenied = sp.admin === "negado";
  const subtitle = formatTodayPtBR();
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    redirect(`/entrar?next=${encodeURIComponent("/dashboard")}`);
  }

  const uid = user.id;
  const role: ProfileRole = await fetchMyProfileRole(uid);
  if (role === "client") {
    redirect(sp.conta === "ativada" ? "/search?conta=ativada" : "/search");
  }

  const [
    profile,
    proRowRes,
    earnings,
    incomingBookings,
    activeOrdersCount,
    conversations,
    servicesRes,
  ] = await Promise.all([
    fetchMyProfile(uid),
    supabase.from("professionals").select("id, slug, pro_until, rating_avg, reviews_count").eq("id", uid).maybeSingle(),
    fetchEarningsThisMonth(uid),
    fetchIncomingBookingsForPro(uid, 12),
    countActiveIncomingBookings(uid),
    fetchConversationsForDashboard(uid, 6),
    supabase
      .from("pro_services")
      .select("id, name, price_cents, status, created_at")
      .eq("professional_id", uid)
      .order("created_at", { ascending: false }),
  ]);

  const proRow = proRowRes.data;
  const myServices = (servicesRes.data ?? []) as {
    id: string;
    name: string;
    price_cents: number | null;
    status: string;
  }[];
  const approvedServices = myServices.filter((s) => s.status === "approved");
  const pendingServices = myServices.filter((s) => s.status === "pending");

  const showRevenueKpi = earnings.totalCents > 0 || earnings.completedCount > 0;
  const reviewsCount = typeof proRow?.reviews_count === "number" ? proRow.reviews_count : 0;
  const ratingAvg = typeof proRow?.rating_avg === "number" ? proRow.rating_avg : null;
  const showRatingKpi = reviewsCount > 0 && ratingAvg != null;
  const showMessagesKpi = conversations.length > 0;
  const awaitingReply = conversations.filter((c) => c.awaitingMyReply).length;

  const showProUpsell = !proPlanActive(proRow?.pro_until ?? null);

  return (
    <div className="home-editorial">
      <div className="dash">
        <DashboardSidebar userEmail={user?.email ?? null} accountKind={role} />
        <div className="dash-body">
          <div className="dash-topbar">
            <div className="dash-topbar-lead">
              <DashboardMobileMenu accountKind={role} />
              <div className="dash-topbar-titles">
                <div className="dt-title">Visão geral</div>
                <div className="dt-sub" style={{ textTransform: "capitalize" }}>
                  {subtitle}
                </div>
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
                initialAvatarUrl={profile?.avatar_url ?? null}
                showProLinks
              />
            </div>
          </div>
          <div className="dash-content">
            {showAccountActivated ? (
              <p className="auth-banner auth-banner--ok" style={{ marginBottom: 18 }}>
                E-mail confirmado.
              </p>
            ) : null}
            {showAdminDenied ? (
              <p className="auth-banner auth-banner--err" style={{ marginBottom: 18 }}>
                Esta área é exclusiva de administradores. Use o menu para navegar no seu painel.
              </p>
            ) : null}

            <div className="kpi-grid">
                {showRevenueKpi ? (
                  <div className="kpi-card">
                    <div className="kpi-top">
                      <div className="kpi-icon" style={{ background: "#F0FDF4" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--success)" }} aria-hidden>
                          <line x1="12" y1="1" x2="12" y2="23" />
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </div>
                      <span className="kpi-pill pill-up">{earnings.completedCount} concluído(s)</span>
                    </div>
                    <div className="kpi-val">{formatEarningsBRL(earnings.totalCents)}</div>
                    <div className="kpi-label">Receita neste mês</div>
                  </div>
                ) : null}

                <div className="kpi-card">
                  <div className="kpi-top">
                    <div className="kpi-icon" style={{ background: "#EFF6FF" }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="2" />
                      </svg>
                    </div>
                    <span className="kpi-pill pill-up">{activeOrdersCount > 0 ? "em andamento" : "aguardando"}</span>
                  </div>
                  <div className="kpi-val">{activeOrdersCount}</div>
                  <div className="kpi-label">Pedidos ativos</div>
                </div>

                {showRatingKpi ? (
                  <div className="kpi-card">
                    <div className="kpi-top">
                      <div className="kpi-icon" style={{ background: "var(--gold-bg)" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--gold)" }} aria-hidden>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </div>
                      <span className="kpi-pill pill-up">{reviewsCount} aval.</span>
                    </div>
                    <div className="kpi-val">{ratingAvg.toFixed(1)}</div>
                    <div className="kpi-label">Avaliação média</div>
                  </div>
                ) : null}

                {showMessagesKpi ? (
                  <div className="kpi-card">
                    <div className="kpi-top">
                      <div className="kpi-icon" style={{ background: "var(--ember-bg)" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--ember)" }} aria-hidden>
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      {awaitingReply > 0 ? <span className="kpi-pill pill-warn">responder</span> : <span className="kpi-pill pill-up">caixa</span>}
                    </div>
                    <div className="kpi-val">{conversations.length}</div>
                    <div className="kpi-label">Conversas</div>
                  </div>
                ) : null}
            </div>

            <div className="dash-card" style={{ marginBottom: 18 }}>
              <div className="dc-head">
                Meus serviços
                <Link className="dc-link" href="/dashboard/servicos">
                  Gerenciar tudo →
                </Link>
              </div>
              <p style={{ margin: "0 0 14px", color: "var(--ink60)", fontSize: 14, lineHeight: 1.55 }}>
                Serviços aprovados aparecem no seu perfil público. Acompanhe preços e status como no painel de um vendedor.
              </p>
              {approvedServices.length === 0 && pendingServices.length === 0 ? (
                <p style={{ margin: 0, color: "var(--ink60)", fontSize: 14 }}>
                  Você ainda não cadastrou serviços.{" "}
                  <Link href="/dashboard/servicos" className="dc-link">
                    Criar primeiro serviço →
                  </Link>
                </p>
              ) : (
                <div className="kz-table-scroll">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Serviço</th>
                        <th>Valor</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myServices.map((s) => (
                        <tr key={s.id}>
                          <td className="o-client" style={{ fontWeight: 700 }}>
                            {s.name}
                          </td>
                          <td>{formatPriceBRL(s.price_cents)}</td>
                          <td>
                            <span
                              className="o-status"
                              style={
                                s.status === "approved"
                                  ? { background: "var(--success-bg)", color: "var(--success)" }
                                  : s.status === "pending"
                                    ? { background: "var(--coral-bg)", color: "var(--coral)" }
                                    : { background: "var(--cream)", color: "var(--ink60)" }
                              }
                            >
                              {serviceStatusPt(s.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {showProUpsell ? (
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
            ) : null}

            {showMessagesKpi ? (
              <div className="dash-card" style={{ marginBottom: 18 }}>
                <div className="dc-head">
                  Mensagens
                  <Link className="dc-link" href="/dashboard/mensagens">
                    Abrir caixa →
                  </Link>
                </div>
                <div className="msg-list">
                  {conversations.map((c) => (
                    <Link key={c.id} href={`/dashboard/mensagens/${c.id}`} className="msg-item" style={{ textDecoration: "none", color: "inherit" }}>
                      <div
                        className="msg-ava"
                        aria-hidden
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: "var(--ink)",
                          color: "var(--lime)",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        {(c.other_name?.trim()?.[0] ?? "?").toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="msg-name">{c.other_name ?? "Conversa"}</div>
                        <div className="msg-text" style={{ color: "var(--ink60)" }}>
                          {c.last_preview ?? "—"}
                        </div>
                      </div>
                      <span className="msg-time">{msgTimePt(c.last_message_at)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="dash-card">
              <div className="dc-head">Pedidos recebidos (agendamentos)</div>
              {incomingBookings.length === 0 ? (
                <p style={{ margin: 0, color: "var(--ink60)", fontSize: 14, lineHeight: 1.6 }}>
                  Nenhum pedido ainda. Assim que clientes agendarem pelo seu perfil público, eles aparecem aqui.
                </p>
              ) : (
                <div className="kz-table-scroll">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Contato</th>
                        <th>Serviço</th>
                        <th>Data</th>
                        <th>Início do serviço</th>
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
                            <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                              {row.service_started_at ? formatBookingWhen(row.service_started_at) : "—"}
                            </td>
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
          </div>
        </div>
      </div>
    </div>
  );
}
