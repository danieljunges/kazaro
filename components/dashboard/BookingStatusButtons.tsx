"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setBookingStatus } from "@/app/dashboard/actions";

type Props = {
  bookingId: string;
  currentStatus: string;
};

const ACTIONS: { to: "confirmed" | "cancelled" | "completed"; label: string }[] = [
  { to: "confirmed", label: "Confirmar" },
  { to: "cancelled", label: "Cancelar" },
  { to: "completed", label: "Concluir" },
];

export function BookingStatusButtons({ bookingId, currentStatus }: Props) {
  const router = useRouter();
  const [loadingTo, setLoadingTo] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>
      {ACTIONS.map((a) => {
        const disabled =
          loadingTo !== null ||
          currentStatus === a.to ||
          (currentStatus === "cancelled" && a.to !== "cancelled") ||
          (currentStatus === "completed" && a.to !== "completed");

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

