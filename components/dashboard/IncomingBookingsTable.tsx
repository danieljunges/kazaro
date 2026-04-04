"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookingStatusButtons } from "@/components/dashboard/BookingStatusButtons";
import { formatBookingWhenPtBR } from "@/lib/booking/format-scheduled";
import { bookingStatusLabelShort } from "@/lib/booking/workflow";
import type { IncomingBookingRow } from "@/lib/supabase/bookings";

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

function truncateNote(note: string, max = 80): string {
  if (note.length <= max) return note;
  return `${note.slice(0, max)}…`;
}

export function IncomingBookingsTable({ rows }: { rows: IncomingBookingRow[] }) {
  const router = useRouter();

  return (
    <div className="kz-table-scroll">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Contato</th>
            <th>Local do serviço</th>
            <th>Serviço</th>
            <th>Data</th>
            <th>Início do serviço</th>
            <th>Status</th>
            <th>Obs.</th>
            <th style={{ textAlign: "right" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const st = statusStyle(row.status);
            const loc = row.client_location_snapshot?.trim();
            return (
              <tr
                key={row.id}
                className="kz-inbooking-row"
                tabIndex={0}
                role="button"
                onClick={() => router.push(`/dashboard/pedidos/${row.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/dashboard/pedidos/${row.id}`);
                  }
                }}
                aria-label={`Ver detalhes do pedido de ${row.client_name_snapshot}`}
              >
                <td className="o-client">{row.client_name_snapshot}</td>
                <td style={{ fontSize: 12 }}>{row.client_email_snapshot ?? "-"}</td>
                <td style={{ fontSize: 12, maxWidth: 200 }} title={loc || undefined}>
                  {loc ? truncateNote(loc, 72) : "-"}
                </td>
                <td>{row.service_name_snapshot ?? "A combinar"}</td>
                <td>{formatBookingWhenPtBR(row.scheduled_at)}</td>
                <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                  {row.service_started_at ? formatBookingWhenPtBR(row.service_started_at) : "-"}
                </td>
                <td>
                  <span className="o-status" style={{ background: st.background, color: st.color }}>
                    {bookingStatusLabelShort(row.status)}
                  </span>
                </td>
                <td style={{ fontSize: 12, maxWidth: 200 }} title={row.client_note ?? undefined}>
                  {row.client_note ? truncateNote(row.client_note) : "-"}
                </td>
                <td style={{ textAlign: "right" }}>
                  <div
                    style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap", alignItems: "center" }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    {row.status === "in_progress" ? (
                      <Link
                        href={`/dashboard/pedidos/${row.id}`}
                        className="kz-mini-btn kz-mini-btn--in_progress"
                        style={{ textDecoration: "none" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Foto e concluir →
                      </Link>
                    ) : null}
                    <BookingStatusButtons bookingId={row.id} currentStatus={row.status} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
