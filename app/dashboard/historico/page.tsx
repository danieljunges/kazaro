import Link from "next/link";
import { redirect } from "next/navigation";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { bookingStatusLabelShort } from "@/lib/booking/workflow";
import { dashboardHomeHref } from "@/lib/dashboard/home-href";
import { BookingReviewForm } from "@/components/reviews/BookingReviewForm";
import { fetchMyBookingsAsClient, type MyBookingRow } from "@/lib/supabase/bookings";
import { fetchReviewedBookingIdsForClient } from "@/lib/supabase/reviews";
import { fetchMyProfileRole } from "@/lib/supabase/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function statusLabelPt(status: string): string {
  switch (status) {
    case "pending":
      return "Aguardando confirmação";
    case "confirmed":
      return "Confirmado";
    case "in_progress":
      return "Em andamento";
    case "cancelled":
      return "Cancelado";
    case "completed":
      return "Concluído";
    case "archived":
      return "Arquivado pelo prestador";
    default:
      return status;
  }
}

function statusPillClass(status: string): string {
  switch (status) {
    case "confirmed":
      return "kz-hist-pill kz-hist-pill--ok";
    case "pending":
      return "kz-hist-pill kz-hist-pill--wait";
    case "in_progress":
      return "kz-hist-pill kz-hist-pill--ok";
    case "cancelled":
      return "kz-hist-pill kz-hist-pill--bad";
    case "completed":
      return "kz-hist-pill kz-hist-pill--done";
    case "archived":
      return "kz-hist-pill kz-hist-pill--muted";
    default:
      return "kz-hist-pill";
  }
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatStartedPt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function isActiveBooking(status: string): boolean {
  return status === "pending" || status === "confirmed" || status === "in_progress";
}

export default async function HistoricoServicosPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/entrar?next=/dashboard/historico");

  const [rows, reviewedIds, role] = await Promise.all([
    fetchMyBookingsAsClient(user.id, 80),
    fetchReviewedBookingIdsForClient(user.id),
    fetchMyProfileRole(user.id),
  ]);
  const home = dashboardHomeHref(role);
  const active = rows.filter((r) => isActiveBooking(r.status));
  const past = rows.filter((r) => !isActiveBooking(r.status));

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref={home} backLabel={role === "client" ? "← Início" : "← Dashboard"} />
      <div className="section">
        <div className="pro-page-card" style={{ maxWidth: 900 }}>
          <div className="dc-head" style={{ marginBottom: 12 }}>
            Histórico de serviços
            <Link href={home} className="dc-link">
              {role === "client" ? "← Início" : "← Dashboard"}
            </Link>
          </div>
          <p className="sec-sub" style={{ margin: "0 0 24px" }}>
            Seus pedidos de agendamento: acompanhe o status, veja quem é o profissional e abra a conversa para combinar
            detalhes ou orçamento. Quando o status estiver <strong>Concluído</strong>, você pode deixar estrelas e um
            comentário. Isso entra na média pública do perfil dele.
          </p>

          {rows.length === 0 ? (
            <p className="sec-sub" style={{ margin: 0 }}>
              Você ainda não tem pedidos.{" "}
              <Link href="/search" className="auth-link">
                Buscar profissionais
              </Link>
            </p>
          ) : (
            <>
              {active.length > 0 ? (
                <section style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 17, margin: "0 0 14px" }}>Em andamento</h2>
                  <ul className="kz-hist-list">
                    {active.map((b) => (
                      <BookingCard key={b.id} row={b} hasReview={reviewedIds.has(b.id)} />
                    ))}
                  </ul>
                </section>
              ) : null}

              {past.length > 0 ? (
                <section>
                  <h2 style={{ fontSize: 17, margin: "0 0 14px" }}>Encerrados</h2>
                  <ul className="kz-hist-list">
                    {past.map((b) => (
                      <BookingCard key={b.id} row={b} hasReview={reviewedIds.has(b.id)} />
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingCard({ row, hasReview }: { row: MyBookingRow; hasReview: boolean }) {
  const pro = row.professionals;
  const slug = pro?.slug;
  const showReviewForm = row.status === "completed" && !hasReview;

  return (
    <li className="kz-hist-card">
      <div className="kz-hist-card-top">
        <div>
          <div className="kz-hist-title">{row.service_name_snapshot?.trim() || "Serviço a combinar"}</div>
          {pro ? (
            <div className="kz-hist-pro">
              com{" "}
              <Link href={`/profissional/${pro.slug}`} className="auth-link">
                {pro.display_name}
              </Link>
            </div>
          ) : (
            <div className="kz-hist-pro">Profissional indisponível</div>
          )}
        </div>
        <span className={statusPillClass(row.status)}>{statusLabelPt(row.status)}</span>
      </div>
      <div className="kz-hist-meta">
        <span>{formatWhen(row.scheduled_at)}</span>
      </div>
      {row.status === "in_progress" && row.service_started_at ? (
        <p className="sec-sub" style={{ margin: "10px 0 0", fontSize: 13, lineHeight: 1.5 }}>
          O profissional marcou que <strong>iniciou o serviço</strong> em {formatStartedPt(row.service_started_at)}. Se
          precisar alinhar algo, use o chat abaixo.
        </p>
      ) : null}
      {row.client_note?.trim() ? (
        <p className="kz-hist-note">
          <strong>Suas observações:</strong> {row.client_note.trim()}
        </p>
      ) : null}
      {row.status === "completed" && row.completion_photo_url?.trim() ? (
        <div className="kz-hist-proof">
          <div className="kz-hist-proof-label">Comprovação do serviço</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={row.completion_photo_url.trim()} alt="Foto do serviço concluído" className="kz-hist-proof-img" />
        </div>
      ) : null}
      {slug ? (
        <div className="kz-hist-actions">
          <Link href={`/dashboard/mensagens/novo/${encodeURIComponent(slug)}`} className="btn-cta" style={{ fontSize: 14, padding: "10px 18px" }}>
            Mensagem sobre este pedido
          </Link>
          <Link href={`/profissional/${slug}`} className="btn-ghost" style={{ fontSize: 14, padding: "10px 18px" }}>
            Ver perfil
          </Link>
        </div>
      ) : null}
      {row.status === "completed" && hasReview ? (
        <p className="sec-sub" style={{ margin: "14px 0 0", fontSize: 13 }}>
          Você já avaliou este serviço.
        </p>
      ) : null}
      {showReviewForm ? (
        <div className="kz-hist-review">
          <div className="kz-hist-review-title">Avaliar este serviço</div>
          <p className="sec-sub" style={{ margin: "6px 0 0", fontSize: 13 }}>
            Sua nota e comentário aparecem no perfil público do profissional (uma avaliação por pedido).
          </p>
          <BookingReviewForm bookingId={row.id} />
        </div>
      ) : null}
    </li>
  );
}
