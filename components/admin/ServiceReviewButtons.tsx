"use client";

import { FormEvent, useState } from "react";
import { reviewService } from "@/app/kz-staff-1/servicos/actions";

export function ServiceReviewButtons({ serviceId }: { serviceId: string }) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState<"approved" | "rejected" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: FormEvent, status: "approved" | "rejected") {
    e.preventDefault();
    setErr(null);
    setLoading(status);
    try {
      const res = await reviewService({ serviceId, status, note });
      if (!res.ok) setErr(res.message);
      else setNote("");
    } finally {
      setLoading(null);
    }
  }

  return (
    <form className="kz-admin-actions">
      <input
        className="kz-admin-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Nota (opcional)"
        maxLength={400}
      />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <button
          className="kz-mini-btn kz-mini-btn--confirmed"
          disabled={loading !== null}
          onClick={(e) => void submit(e, "approved")}
          type="button"
        >
          {loading === "approved" ? "…" : "Aprovar"}
        </button>
        <button
          className="kz-mini-btn kz-mini-btn--cancelled"
          disabled={loading !== null}
          onClick={(e) => void submit(e, "rejected")}
          type="button"
        >
          {loading === "rejected" ? "…" : "Rejeitar"}
        </button>
      </div>
      {err ? <div className="kz-chat-error">{err}</div> : null}
    </form>
  );
}

