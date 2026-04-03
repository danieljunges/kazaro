"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { BOOKING_TIME_OPTIONS } from "@/lib/booking/constants";
import type { BookingPageContext } from "@/lib/supabase/bookings";
import { submitBookingRequest } from "@/app/profissional/[id]/agendar/actions";

type Props = {
  context: BookingPageContext;
  /** índice do serviço na lista (query ?servico=) */
  initialServiceIndex: number | null;
};

function todayIsoDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function BookingRequestForm({ context, initialServiceIndex }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(todayIsoDate());
  const [time, setTime] = useState<string>(BOOKING_TIME_OPTIONS[0]);
  const [serviceId, setServiceId] = useState<string>(() => {
    if (initialServiceIndex == null || !context.services.length) return "";
    const i = Math.max(0, Math.min(initialServiceIndex, context.services.length - 1));
    return context.services[i]?.id ?? "";
  });
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitted, setSubmitted] = useState<{
    date: string;
    time: string;
    serviceLabel: string;
    note: string;
  } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!context.isBookable || !context.professionalId) {
      setError(context.unavailableReason ?? "Este perfil ainda não aceita agendamentos reais.");
      return;
    }
    setLoading(true);
    try {
      const serviceLabel =
        context.services.find((s) => s.id === serviceId)?.name || (serviceId ? "Serviço selecionado" : "A combinar");
      const result = await submitBookingRequest({
        professionalId: context.professionalId,
        date,
        time,
        proServiceId: serviceId || null,
        clientNote: note,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSubmitted({ date, time, serviceLabel, note: note.trim() });
      setDone(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!context.isBookable || !context.professionalId) {
    return (
      <div className="booking-guest">
        <p className="sec-sub" style={{ margin: "0 0 12px" }}>
          {context.unavailableReason ?? "Este perfil ainda não está habilitado para agendamento real."}
        </p>
        <div className="booking-guest-actions">
          <Link href="/search" className="btn-cta">
            Ver profissionais ativos
          </Link>
          <Link href={`/profissional/${context.slug}`} className="btn-ghost">
            Voltar ao perfil
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    const when = (() => {
      const d = new Date(`${(submitted?.date ?? date).trim()}T${(submitted?.time ?? time).trim()}:00`);
      if (Number.isNaN(d.getTime())) return `${submitted?.date ?? date} · ${submitted?.time ?? time}`;
      return new Intl.DateTimeFormat("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    })();

    return (
      <div className="booking-success">
        <p className="booking-success-title">Pedido enviado</p>
        <p className="sec-sub" style={{ margin: "0 0 20px" }}>
          {context.displayName} receberá seu pedido com data, horário e observações. Você pode acompanhar o status em{" "}
          <Link href="/dashboard" className="auth-link">
            Dashboard
          </Link>
          .
        </p>
        <div className="booking-recap" aria-label="Resumo do pedido">
          <div className="booking-recap-row">
            <span className="booking-recap-k">Quando</span>
            <span className="booking-recap-v">{when}</span>
          </div>
          <div className="booking-recap-row">
            <span className="booking-recap-k">Serviço</span>
            <span className="booking-recap-v">{submitted?.serviceLabel ?? "A combinar"}</span>
          </div>
          {submitted?.note ? (
            <div className="booking-recap-row">
              <span className="booking-recap-k">Obs.</span>
              <span className="booking-recap-v">{submitted.note}</span>
            </div>
          ) : null}
          <p className="booking-recap-hint">
            Sem pagamento agora. Assim que o profissional confirmar, você verá o status no Dashboard.
          </p>
        </div>
        <div className="booking-guest-actions">
          <Link href={`/profissional/${context.slug}`} className="btn-ghost">
            Voltar ao perfil
          </Link>
          <Link href="/search" className="btn-cta">
            Buscar outros profissionais
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={onSubmit}>
      <label className="auth-field">
        <span className="auth-label">Data preferida</span>
        <input
          className="auth-input"
          type="date"
          required
          min={todayIsoDate()}
          value={date}
          onChange={(ev) => setDate(ev.target.value)}
        />
      </label>

      <label className="auth-field">
        <span className="auth-label">Horário sugerido</span>
        <select className="auth-input" value={time} onChange={(ev) => setTime(ev.target.value)} required>
          {BOOKING_TIME_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className="auth-field">
        <span className="auth-label">Serviço (opcional)</span>
        <select
          className="auth-input"
          value={serviceId}
          onChange={(ev) => setServiceId(ev.target.value)}
          disabled={context.services.length === 0}
        >
          <option value="">A combinar com o profissional</option>
          {context.services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <label className="auth-field">
        <span className="auth-label">Observações</span>
        <textarea
          className="auth-input booking-textarea"
          rows={4}
          maxLength={2000}
          value={note}
          onChange={(ev) => setNote(ev.target.value)}
          placeholder="Endereço ou referência, tipo de problema, melhor forma de contato…"
        />
      </label>

      {error ? <p className="auth-error">{error}</p> : null}

      <button type="submit" className="btn-cta auth-submit" disabled={loading}>
        {loading ? "Enviando…" : "Enviar pedido de agendamento"}
      </button>
    </form>
  );
}
