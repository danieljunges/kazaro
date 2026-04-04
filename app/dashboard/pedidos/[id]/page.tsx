import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingCompleteSection } from "@/components/booking/BookingCompleteSection";
import { BookingTimeline } from "@/components/booking/BookingTimeline";
import { BookingStatusButtons } from "@/components/dashboard/BookingStatusButtons";
import { DashboardSidebar } from "@/components/kazaro/DashboardSidebar";
import { DashboardMobileMenu } from "@/components/dashboard/DashboardMobileMenu";
import { DashboardNotificationsBell } from "@/components/dashboard/DashboardNotificationsBell";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import { requireProfessionalTools } from "@/lib/auth/require-pro-tools";
import { formatBookingWhenPtBR } from "@/lib/booking/format-scheduled";
import { bookingStatusLabelShort } from "@/lib/booking/workflow";
import { fetchMyProfileRole } from "@/lib/supabase/profile";
import { fetchProDashboardNotifications } from "@/lib/dashboard/pro-notifications";
import { fetchIncomingBookingDetailForPro } from "@/lib/supabase/bookings";
import { fetchMyProfile } from "@/lib/supabase/profile-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function formatPriceBRL(cents: number | null | undefined): string {
  if (cents == null || cents <= 0) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
    cents / 100,
  );
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
    case "archived":
      return { background: "rgba(62, 62, 52, 0.08)", color: "var(--ink50)" };
    default:
      return { background: "var(--cream)", color: "var(--ink60)" };
  }
}

export default async function DashboardPedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireProfessionalTools(`/dashboard/pedidos/${id}`);
  const supabase = await getSupabaseServerClient();
  const [role, profile, row, dashboardNotifications] = await Promise.all([
    fetchMyProfileRole(user.id),
    fetchMyProfile(user.id),
    fetchIncomingBookingDetailForPro(user.id, id),
    fetchProDashboardNotifications(user.id),
  ]);

  if (!row) notFound();

  const st = statusStyle(row.status);
  const price =
    row.final_price_cents != null && row.final_price_cents > 0
      ? row.final_price_cents
      : row.service_price_cents_snapshot;

  return (
    <div className="home-editorial">
      <div className="dash">
        <DashboardSidebar userEmail={user.email ?? null} accountKind={role} />
        <div className="dash-body">
          <div className="dash-topbar">
            <div className="dash-topbar-lead">
              <DashboardMobileMenu accountKind={role} />
              <div className="dash-topbar-titles">
                <div className="dt-title">Pedido</div>
                <div className="dt-sub">Detalhes do agendamento</div>
              </div>
            </div>
            <div className="dt-right">
              <DashboardNotificationsBell items={dashboardNotifications} />
              <DashboardUserMenu
                initialEmail={user.email ?? null}
                initialAvatarUrl={profile?.avatar_url ?? null}
                showProLinks
              />
            </div>
          </div>
          <div className="dash-content">
            <div className="dash-card" style={{ marginBottom: 18 }}>
              <Link href="/dashboard" className="dc-link" style={{ display: "inline-block", marginBottom: 14 }}>
                ← Voltar à visão geral
              </Link>
              <div
                className="dc-head"
                style={{ marginBottom: 12, flexWrap: "wrap", gap: "10px 16px", alignItems: "center" }}
              >
                <span style={{ minWidth: 0 }}>{row.client_name_snapshot}</span>
                <span className="o-status" style={{ background: st.background, color: st.color }}>
                  {bookingStatusLabelShort(row.status)}
                </span>
              </div>
              <BookingTimeline
                status={row.status}
                createdAt={row.created_at}
                scheduledAt={row.scheduled_at}
                confirmedAt={row.confirmed_at}
                serviceStartedAt={row.service_started_at}
                completedAt={row.completed_at}
                archivedAt={row.archived_at}
              />

              <dl className="kz-pedido-dl" style={{ marginTop: 22 }}>
                <div>
                  <dt>E-mail</dt>
                  <dd>{row.client_email_snapshot ?? "-"}</dd>
                </div>
                <div className="kz-pedido-dl--wide">
                  <dt>Local do serviço</dt>
                  <dd style={{ whiteSpace: "pre-line" }}>{row.client_location_snapshot?.trim() || "-"}</dd>
                </div>
                <div>
                  <dt>Serviço</dt>
                  <dd>{row.service_name_snapshot?.trim() || "Serviço"}</dd>
                </div>
                <div>
                  <dt>Valor combinado (referência)</dt>
                  <dd>{formatPriceBRL(price ?? null)}</dd>
                </div>
                <div>
                  <dt>Data / hora agendada</dt>
                  <dd>{formatBookingWhenPtBR(row.scheduled_at)}</dd>
                </div>
                <div>
                  <dt>Início do serviço (prestador)</dt>
                  <dd>{row.service_started_at ? formatBookingWhenPtBR(row.service_started_at) : "-"}</dd>
                </div>
                <div className="kz-pedido-dl--wide">
                  <dt>Observações do cliente</dt>
                  <dd>{row.client_note?.trim() || "-"}</dd>
                </div>
                {row.status === "completed" && row.completion_photo_url?.trim() ? (
                  <div className="kz-pedido-dl--wide">
                    <dt>Comprovação (foto)</dt>
                    <dd>
                      <a
                        href={row.completion_photo_url.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dc-link"
                      >
                        Abrir foto em nova aba →
                      </a>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={row.completion_photo_url.trim()}
                        alt="Comprovação do serviço concluído"
                        className="kz-pedido-proof-img"
                      />
                    </dd>
                  </div>
                ) : null}
              </dl>
              <div style={{ marginTop: 20 }}>
                <BookingStatusButtons bookingId={row.id} currentStatus={row.status} />
              </div>
              {row.status === "in_progress" ? (
                <BookingCompleteSection bookingId={row.id} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
