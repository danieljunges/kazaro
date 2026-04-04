"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { submitBookingRequest } from "@/app/profissional/[id]/agendar/actions";
import { BOOKING_TIME_OPTIONS } from "@/lib/booking/constants";
import {
  composeBookingLocationSnapshot,
  validateBookingAddressParts,
  type BookingAddressParts,
} from "@/lib/address/compose-booking-location";
import { fetchViaCep, formatCepDisplay, onlyCepDigits } from "@/lib/address/viacep";
import type { BookingPageContext } from "@/lib/supabase/bookings";

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
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepHint, setCepHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitted, setSubmitted] = useState<{
    date: string;
    time: string;
    serviceLabel: string;
    note: string;
    location: string;
    bookingId: string;
    priceCents: number | null;
  } | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payHint, setPayHint] = useState<string | null>(null);

  const addressParts: BookingAddressParts = {
    cepDigits: onlyCepDigits(cep),
    street,
    number,
    complement,
    neighborhood,
    city,
    state: stateUf,
    contactPhone,
  };

  async function lookupCep() {
    setCepHint(null);
    const d = onlyCepDigits(cep);
    if (d.length !== 8) {
      setCepHint("Digite o CEP com 8 dígitos.");
      return;
    }
    setCepLoading(true);
    try {
      const data = await fetchViaCep(d);
      if (!data) {
        setCepHint("CEP não encontrado. Confira os números ou preencha o endereço manualmente.");
        return;
      }
      setStreet((data.logradouro ?? "").trim());
      setNeighborhood((data.bairro ?? "").trim());
      setCity((data.localidade ?? "").trim());
      setStateUf((data.uf ?? "").trim().toUpperCase().slice(0, 2));
      setCepHint("Endereço preenchido. Complete o número e, se quiser, complemento e telefone.");
    } finally {
      setCepLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!context.isBookable || !context.professionalId) {
      setError(context.unavailableReason ?? "Este perfil ainda não aceita agendamentos reais.");
      return;
    }
    const addrErr = validateBookingAddressParts(addressParts);
    if (addrErr) {
      setError(addrErr);
      return;
    }
    const composedLocation = composeBookingLocationSnapshot(addressParts);

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
        clientLocation: composedLocation,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSubmitted({
        date,
        time,
        serviceLabel,
        note: note.trim(),
        location: composedLocation,
        bookingId: result.bookingId,
        priceCents: result.priceCents,
      });
      setPayHint(null);
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

    const canPayOnline =
      submitted != null &&
      typeof submitted.priceCents === "number" &&
      submitted.priceCents >= 50;

    async function startStripeCheckout() {
      if (!submitted?.bookingId) return;
      setPayLoading(true);
      setPayHint(null);
      try {
        const r = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: submitted.bookingId }),
        });
        const j = (await r.json()) as { url?: string; error?: string };
        if (!r.ok) {
          setPayHint(j.error ?? "Não foi possível abrir o pagamento.");
          return;
        }
        if (j.url) window.location.href = j.url;
      } finally {
        setPayLoading(false);
      }
    }

    const priceLabel =
      canPayOnline && submitted?.priceCents != null
        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
            submitted.priceCents / 100,
          )
        : null;

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
          {submitted?.location ? (
            <div className="booking-recap-row">
              <span className="booking-recap-k">Local</span>
              <span className="booking-recap-v">{submitted.location}</span>
            </div>
          ) : null}
          {submitted?.note ? (
            <div className="booking-recap-row">
              <span className="booking-recap-k">Obs.</span>
              <span className="booking-recap-v">{submitted.note}</span>
            </div>
          ) : null}
          {canPayOnline ? (
            <>
              <p className="booking-recap-hint" style={{ marginTop: 14 }}>
                Este serviço tem valor definido ({priceLabel}). Você pode pagar com cartão agora; o pedido continua
                aguardando a confirmação do profissional.
              </p>
              <div style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="btn-cta auth-submit"
                  disabled={payLoading}
                  onClick={() => void startStripeCheckout()}
                >
                  {payLoading ? "Redirecionando…" : `Pagar ${priceLabel} com cartão`}
                </button>
                {payHint ? <p className="auth-error" style={{ marginTop: 10 }}>{payHint}</p> : null}
              </div>
              <p className="booking-recap-hint" style={{ marginTop: 12 }}>
                Prefere combinar depois? Você também pode pagar pelo{" "}
                <Link href="/dashboard/historico" className="auth-link">
                  Histórico de serviços
                </Link>
                .
              </p>
            </>
          ) : (
            <p className="booking-recap-hint">
              Sem pagamento online neste pedido (serviço a combinar ou valor não informado). Quando o profissional
              confirmar, você acompanha no Dashboard.
            </p>
          )}
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

      <fieldset className="booking-address-fieldset">
        <legend className="auth-label booking-address-legend">Endereço onde será o serviço</legend>
        <p className="booking-address-hint">
          Busque pelo CEP para preencher rua e cidade. O profissional usa estes dados para ir até você.
        </p>

        <div className="booking-address-row booking-address-row--cep">
          <label className="auth-field" style={{ marginBottom: 0 }}>
            <span className="auth-label">CEP</span>
            <input
              className="auth-input"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={9}
              value={formatCepDisplay(cep)}
              onChange={(ev) => {
                setCep(onlyCepDigits(ev.target.value));
                setCepHint(null);
              }}
              onKeyDown={(ev) => {
                if (ev.key === "Enter") {
                  ev.preventDefault();
                  void lookupCep();
                }
              }}
              placeholder="00000-000"
            />
          </label>
          <button
            type="button"
            className="btn-ghost booking-cep-btn"
            disabled={cepLoading || onlyCepDigits(cep).length !== 8}
            onClick={() => void lookupCep()}
          >
            {cepLoading ? "Buscando…" : "Buscar CEP"}
          </button>
        </div>
        {cepHint ? <p className="booking-address-cep-msg">{cepHint}</p> : null}

        <label className="auth-field">
          <span className="auth-label">Logradouro</span>
          <input
            className="auth-input"
            type="text"
            autoComplete="street-address"
            value={street}
            onChange={(ev) => setStreet(ev.target.value)}
            placeholder="Rua, avenida…"
          />
        </label>

        <div className="booking-address-grid">
          <label className="auth-field">
            <span className="auth-label">Número</span>
            <input
              className="auth-input"
              type="text"
              inputMode="numeric"
              autoComplete="address-line2"
              value={number}
              onChange={(ev) => setNumber(ev.target.value)}
              placeholder="Ex: 120"
            />
          </label>
          <label className="auth-field">
            <span className="auth-label">Complemento</span>
            <input
              className="auth-input"
              type="text"
              value={complement}
              onChange={(ev) => setComplement(ev.target.value)}
              placeholder="Apto, bloco, casa…"
            />
          </label>
        </div>

        <label className="auth-field">
          <span className="auth-label">Bairro</span>
          <input
            className="auth-input"
            type="text"
            value={neighborhood}
            onChange={(ev) => setNeighborhood(ev.target.value)}
            placeholder="Bairro"
          />
        </label>

        <div className="booking-address-grid">
          <label className="auth-field">
            <span className="auth-label">Cidade</span>
            <input
              className="auth-input"
              type="text"
              autoComplete="address-level2"
              value={city}
              onChange={(ev) => setCity(ev.target.value)}
              placeholder="Cidade"
            />
          </label>
          <label className="auth-field">
            <span className="auth-label">UF</span>
            <input
              className="auth-input"
              type="text"
              maxLength={2}
              value={stateUf}
              onChange={(ev) => setStateUf(ev.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2))}
              placeholder="SC"
            />
          </label>
        </div>

        <label className="auth-field">
          <span className="auth-label">Telefone ou WhatsApp (opcional)</span>
          <input
            className="auth-input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={contactPhone}
            onChange={(ev) => setContactPhone(ev.target.value)}
            placeholder="Para contato no dia do serviço"
          />
        </label>
      </fieldset>

      <label className="auth-field">
        <span className="auth-label">Observações</span>
        <textarea
          className="auth-input booking-textarea"
          rows={4}
          maxLength={2000}
          value={note}
          onChange={(ev) => setNote(ev.target.value)}
          placeholder="Tipo de problema, melhor horário para ligar, detalhes do serviço…"
        />
      </label>

      {error ? <p className="auth-error">{error}</p> : null}

      <button type="submit" className="btn-cta auth-submit" disabled={loading}>
        {loading ? "Enviando…" : "Enviar pedido de agendamento"}
      </button>
    </form>
  );
}
