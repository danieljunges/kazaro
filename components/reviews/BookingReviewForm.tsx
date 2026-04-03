"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { submitBookingReview } from "@/app/dashboard/historico/actions";

export function BookingReviewForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await submitBookingReview(bookingId, stars, comment);
      if (!res.ok) {
        setErr(res.message);
        return;
      }
      setDone(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="auth-banner auth-banner--ok" style={{ margin: "12px 0 0", fontSize: 13 }}>
        Obrigado! Sua avaliação foi publicada no perfil do profissional.
      </p>
    );
  }

  return (
    <form className="kz-review-form" onSubmit={onSubmit}>
      <div className="kz-review-stars" role="group" aria-label="Nota de 1 a 5 estrelas">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`kz-review-star${n <= stars ? " on" : ""}`}
            aria-pressed={n <= stars}
            aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
            onClick={() => setStars(n)}
          >
            ★
          </button>
        ))}
        <span className="kz-review-star-hint">{stars}/5</span>
      </div>
      <label className="auth-field" style={{ marginTop: 10 }}>
        <span className="auth-label">Comentário</span>
        <textarea
          className="auth-input"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={2000}
          required
          minLength={3}
          placeholder="Como foi o atendimento? Outros clientes leem isso no perfil dele."
          disabled={loading}
        />
      </label>
      {err ? <p className="auth-error" style={{ marginTop: 8 }}>{err}</p> : null}
      <button type="submit" className="btn-cta" style={{ marginTop: 12, fontSize: 14 }} disabled={loading}>
        {loading ? "Enviando…" : "Publicar avaliação"}
      </button>
    </form>
  );
}
