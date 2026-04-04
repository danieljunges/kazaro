"use client";

import { useState } from "react";

type Props = {
  bookingId: string;
  label?: string;
  className?: string;
};

export function StripePayButton({ bookingId, label, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setHint(null);
    try {
      const r = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const j = (await r.json()) as { url?: string; error?: string };
      if (!r.ok) {
        setHint(j.error ?? "Não foi possível abrir o pagamento.");
        return;
      }
      if (j.url) window.location.href = j.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className={className ?? "btn-cta"}
        style={{ fontSize: 14, padding: "10px 18px" }}
        disabled={loading}
        onClick={() => void pay()}
      >
        {loading ? "Abrindo pagamento…" : (label ?? "Pagar com cartão")}
      </button>
      {hint ? (
        <p className="auth-error" style={{ margin: "8px 0 0", fontSize: 13 }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
