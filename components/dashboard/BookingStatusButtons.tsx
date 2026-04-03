"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { setBookingStatus } from "@/app/dashboard/actions";
import type { BookingWorkflowStatus } from "@/lib/booking/workflow";

type Action = { to: BookingWorkflowStatus; label: string };

function actionsFor(currentStatus: string): Action[] {
  switch (currentStatus) {
    case "pending":
      return [
        { to: "confirmed", label: "Confirmar" },
        { to: "cancelled", label: "Cancelar" },
      ];
    case "confirmed":
      return [
        { to: "in_progress", label: "Iniciar serviço" },
        { to: "completed", label: "Concluir" },
        { to: "cancelled", label: "Cancelar" },
      ];
    case "in_progress":
      return [
        { to: "completed", label: "Concluir" },
        { to: "cancelled", label: "Cancelar" },
      ];
    default:
      return [];
  }
}

export function BookingStatusButtons({ bookingId, currentStatus }: { bookingId: string; currentStatus: string }) {
  const router = useRouter();
  const [loadingTo, setLoadingTo] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const actions = useMemo(() => actionsFor(currentStatus), [currentStatus]);
  const terminal = currentStatus === "cancelled" || currentStatus === "completed";

  if (terminal || actions.length === 0) {
    return null;
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>
      {actions.map((a) => {
        const disabled = loadingTo !== null;
        return (
          <button
            key={a.to}
            type="button"
            className={`kz-mini-btn kz-mini-btn--${a.to}`}
            disabled={disabled}
            onClick={async () => {
              setErr(null);
              setLoadingTo(a.to);
              try {
                const res = await setBookingStatus(bookingId, a.to);
                if (!res.ok) setErr(res.message);
                else router.refresh();
              } finally {
                setLoadingTo(null);
              }
            }}
            aria-label={a.label}
            title={a.label}
          >
            {loadingTo === a.to ? "…" : a.label}
          </button>
        );
      })}
      {err ? (
        <span style={{ fontSize: 11.5, color: "var(--coral)", fontWeight: 600, maxWidth: 220 }} title={err}>
          {err}
        </span>
      ) : null}
    </div>
  );
}
