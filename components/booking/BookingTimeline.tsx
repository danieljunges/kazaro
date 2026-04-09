import { formatBookingWhenPtBR } from "@/lib/booking/format-scheduled";

type Props = {
  status: string;
  createdAt?: string | null;
  /** Fallback quando `created_at` ainda não existia no schema. */
  scheduledAt?: string | null;
  confirmedAt?: string | null;
  serviceStartedAt?: string | null;
  completedAt?: string | null;
  archivedAt?: string | null;
};

function fmt(iso: string | null | undefined): string {
  if (!iso) return "-";
  return formatBookingWhenPtBR(iso);
}

type Step = { key: string; label: string; detail: string; done: boolean; current: boolean };

export function BookingTimeline({
  status,
  createdAt,
  scheduledAt,
  confirmedAt,
  serviceStartedAt,
  completedAt,
  archivedAt,
}: Props) {
  const isArchived = status === "archived";

  const s2Done = isArchived ? Boolean(confirmedAt) : status !== "pending";
  const s3Done = isArchived
    ? Boolean(serviceStartedAt)
    : status === "in_progress" || status === "completed";
  const s4Done = !isArchived && status === "completed";

  const step4: Step = isArchived
    ? {
        key: "4",
        label: "Arquivado (fora dos ativos)",
        detail: fmt(archivedAt ?? undefined),
        done: true,
        current: true,
      }
    : {
        key: "4",
        label: "Concluído",
        detail: fmt(completedAt ?? undefined),
        done: s4Done,
        current: status === "completed",
      };

  const steps: Step[] = [
    {
      key: "1",
      label: "Pedido enviado",
      detail: fmt(createdAt ?? scheduledAt ?? undefined),
      done: true,
      current: status === "pending",
    },
    {
      key: "2",
      label: "Confirmado pelo prestador",
      detail: fmt(confirmedAt ?? undefined),
      done: s2Done,
      current: status === "confirmed",
    },
    {
      key: "3",
      label: "Serviço em andamento",
      detail: fmt(serviceStartedAt ?? undefined),
      done: s3Done,
      current: status === "in_progress",
    },
    step4,
  ];

  return (
    <div className="kz-booking-timeline" aria-label="Andamento do atendimento">
      <div className="kz-booking-timeline__title">Ordem do atendimento</div>
      {isArchived ? (
        <p className="kz-booking-timeline__archived-hint">
          Você arquivou este pedido: ele <strong>não conta como ativo</strong> no painel, mas o registro continua aqui para
          consulta.
        </p>
      ) : null}
      <ol className="kz-booking-timeline__list">
        {steps.map((st, i) => (
          <li
            key={st.key}
            className={`kz-booking-timeline__step${st.done ? " kz-booking-timeline__step--done" : ""}${st.current ? " kz-booking-timeline__step--current" : ""}${isArchived && st.key === "4" ? " kz-booking-timeline__step--archived" : ""}`}
          >
            <div className="kz-booking-timeline__dot" aria-hidden>
              {st.done ? "✓" : i + 1}
            </div>
            <div className="kz-booking-timeline__body">
              <div className="kz-booking-timeline__label">{st.label}</div>
              <div className="kz-booking-timeline__when">{st.detail}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
