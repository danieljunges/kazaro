import type { Metadata } from "next";
import Link from "next/link";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { requireProfessionalTools } from "@/lib/auth/require-pro-tools";
import {
  formatAgendaDayHeadingPtBR,
  formatAgendaTimePtBR,
  normalizeAgendaDayParam,
  shiftSaoPauloCalendarDay,
  todayYyyyMmDdSaoPaulo,
} from "@/lib/datetime/sao-paulo-calendar";
import { effectiveBookingPriceCents, formatPriceBRLFromCents } from "@/lib/booking/booking-price";
import { bookingStatusLabelShort } from "@/lib/booking/workflow";
import { formatIsoWeekdaysBriefPt } from "@/lib/booking/schedule-labels";
import { SITE_NAME } from "@/lib/site";
import {
  fetchIncomingBookingsForProOnCalendarDay,
  fetchProfessionalScheduleForDashboard,
} from "@/lib/supabase/bookings";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ProfessionalScheduleForm } from "@/components/settings/ProfessionalScheduleForm";
import { DEFAULT_WORK_WEEKDAYS_ALL } from "@/lib/booking/schedule-defaults";

export const metadata: Metadata = {
  title: `Agenda | ${SITE_NAME}`,
  description: "Serviços agendados por dia no seu painel.",
};

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function statusChipClass(status: string): string {
  switch (status) {
    case "confirmed":
      return "kz-agenda-chip kz-agenda-chip--ok";
    case "in_progress":
      return "kz-agenda-chip kz-agenda-chip--progress";
    case "pending":
      return "kz-agenda-chip kz-agenda-chip--pending";
    case "cancelled":
      return "kz-agenda-chip kz-agenda-chip--bad";
    case "completed":
      return "kz-agenda-chip kz-agenda-chip--done";
    case "archived":
      return "kz-agenda-chip kz-agenda-chip--muted";
    default:
      return "kz-agenda-chip";
  }
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

type PageProps = { searchParams: Promise<{ dia?: string }> };

export default async function DashboardAgendaPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { user } = await requireProfessionalTools("/dashboard/agenda");
  const day = normalizeAgendaDayParam(sp.dia);
  const supabase = await getSupabaseServerClient();
  const { data: proScheduleRow } = await supabase
    .from("professionals")
    .select(
      "work_day_start, work_day_end, work_weekdays, booking_slot_step_minutes, booking_default_duration_minutes",
    )
    .eq("id", user.id)
    .maybeSingle();

  const [rows, schedule] = await Promise.all([
    fetchIncomingBookingsForProOnCalendarDay(user.id, day),
    fetchProfessionalScheduleForDashboard(user.id),
  ]);
  const today = todayYyyyMmDdSaoPaulo();
  const prev = shiftSaoPauloCalendarDay(day, -1);
  const next = shiftSaoPauloCalendarDay(day, 1);
  const heading = capitalizeFirst(formatAgendaDayHeadingPtBR(day));
  const isToday = day === today;

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/dashboard" backLabel="← Dashboard" />
      <div className="section">
        <div className="pro-page-card kz-agenda-wrap" style={{ maxWidth: 720 }}>
          <header className="kz-agenda-head">
            <span className="sec-eyebrow">Painel do prestador</span>
            <h1 className="sec-title kz-agenda-title">Agenda</h1>
            <p className="sec-sub kz-agenda-sub">
              Horários combinados com clientes, no horário de Brasília. Toque num compromisso para ver o pedido completo.
            </p>
          </header>

          {schedule ? (
            <section className="kz-agenda-availability" aria-label="Expediente para novos agendamentos">
              <p className="kz-agenda-availability__title">Quando clientes podem marcar (agenda pública)</p>
              <p className="kz-agenda-availability__body">
                <strong>
                  {schedule.workDayStart} às {schedule.workDayEnd}
                </strong>{" "}
                · dias{" "}
                <strong>{formatIsoWeekdaysBriefPt(schedule.workWeekdays)}</strong>
                {" · "}
                oferta de horários a cada <strong>{schedule.bookingSlotStepMinutes} min</strong>. Vale para{" "}
                <strong>todos os serviços</strong>. Um pedido bloqueia o horário na agenda inteira.
              </p>
              {proScheduleRow ? (
                <details className="kz-agenda-schedule-details" id="editar-expediente">
                  <summary className="kz-agenda-schedule-summary">
                    <span className="kz-agenda-schedule-summary__text">
                      <span className="kz-agenda-schedule-summary__label">Ajustar expediente e horários</span>
                      <span className="kz-agenda-schedule-summary__hint">Toque para expandir o formulário</span>
                    </span>
                  </summary>
                  <div className="kz-agenda-schedule-details__body">
                    <ProfessionalScheduleForm
                      initialWorkDayStart={(proScheduleRow.work_day_start as string | null) ?? undefined}
                      initialWorkDayEnd={(proScheduleRow.work_day_end as string | null) ?? undefined}
                      initialWorkWeekdays={
                        Array.isArray(proScheduleRow.work_weekdays) && proScheduleRow.work_weekdays.length
                          ? (proScheduleRow.work_weekdays as unknown[]).map((x) => Number(x)).filter((n) => n >= 1 && n <= 7)
                          : [...DEFAULT_WORK_WEEKDAYS_ALL]
                      }
                      initialSlotStep={proScheduleRow.booking_slot_step_minutes ?? 60}
                      initialDefaultDuration={proScheduleRow.booking_default_duration_minutes ?? 120}
                    />
                  </div>
                </details>
              ) : null}
            </section>
          ) : null}

          <div className="kz-agenda-nav" role="group" aria-label="Escolher dia">
            <Link className="kz-agenda-nav-btn" href={`/dashboard/agenda?dia=${prev}`} prefetch>
              ← Dia anterior
            </Link>
            {isToday ? (
              <span className="kz-agenda-nav-today" aria-current="date">
                Hoje
              </span>
            ) : (
              <Link className="kz-agenda-nav-btn kz-agenda-nav-btn--ghost" href="/dashboard/agenda" prefetch>
                Ir para hoje
              </Link>
            )}
            <Link className="kz-agenda-nav-btn" href={`/dashboard/agenda?dia=${next}`} prefetch>
              Próximo dia →
            </Link>
          </div>

          <p className="kz-agenda-date-line">{heading}</p>

          {rows.length === 0 ? (
            <div className="kz-agenda-empty">
              <p className="kz-agenda-empty-title">Nada agendado neste dia</p>
              <p className="kz-agenda-empty-copy">
                Quando um cliente marcar pelo seu perfil, o horário aparece aqui em ordem cronológica.
              </p>
              <Link href="/dashboard" className="dc-link">
                Voltar ao dashboard
              </Link>
            </div>
          ) : (
            <ol className="kz-agenda-list" aria-label={`Compromissos em ${day}`}>
              {rows.map((b) => {
                const time = formatAgendaTimePtBR(b.scheduled_at);
                const loc = b.client_location_snapshot?.trim();
                const priceCents = effectiveBookingPriceCents(b.final_price_cents, b.service_price_cents_snapshot);
                return (
                  <li key={b.id} className="kz-agenda-item">
                    <div className="kz-agenda-item__rail" aria-hidden />
                    <div className="kz-agenda-item__body">
                      <div className="kz-agenda-item__time">{time}</div>
                      <Link href={`/dashboard/pedidos/${b.id}`} className="kz-agenda-item__card">
                        <div className="kz-agenda-item__top">
                          <span className="kz-agenda-item__client">{b.client_name_snapshot}</span>
                          <span className={statusChipClass(b.status)}>{bookingStatusLabelShort(b.status)}</span>
                        </div>
                        <div className="kz-agenda-item__service">{b.service_name_snapshot ?? "Serviço a combinar"}</div>
                        <div className="kz-agenda-item__price">{formatPriceBRLFromCents(priceCents)}</div>
                        {loc ? <div className="kz-agenda-item__meta">{truncate(loc, 120)}</div> : null}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
