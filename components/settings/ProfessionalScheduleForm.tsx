"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { updateMyProfessionalSchedule } from "@/app/dashboard/configuracoes/actions";

const WEEK_OPTS: { iso: number; label: string }[] = [
  { iso: 1, label: "Seg" },
  { iso: 2, label: "Ter" },
  { iso: 3, label: "Qua" },
  { iso: 4, label: "Qui" },
  { iso: 5, label: "Sex" },
  { iso: 6, label: "Sáb" },
  { iso: 7, label: "Dom" },
];

type Props = {
  initialWorkDayStart?: string | null;
  initialWorkDayEnd?: string | null;
  initialWorkWeekdays: number[];
  initialSlotStep: number;
  initialDefaultDuration: number;
};

function normalizeTimeForInput(v: string | null | undefined): string {
  if (!v?.trim()) return "08:00";
  const t = v.trim();
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  if (/^\d{2}:\d{2}:\d{2}/.test(t)) return t.slice(0, 5);
  return "08:00";
}

export function ProfessionalScheduleForm({
  initialWorkDayStart,
  initialWorkDayEnd,
  initialWorkWeekdays,
  initialSlotStep,
  initialDefaultDuration,
}: Props) {
  const router = useRouter();
  const [workDayStart, setWorkDayStart] = useState(() => normalizeTimeForInput(initialWorkDayStart));
  const [workDayEnd, setWorkDayEnd] = useState(() => normalizeTimeForInput(initialWorkDayEnd));
  const [weekdays, setWeekdays] = useState<Set<number>>(() => {
    const d = initialWorkWeekdays?.length ? initialWorkWeekdays : [1, 2, 3, 4, 5];
    return new Set(d.filter((n) => n >= 1 && n <= 7));
  });
  const [slotStep, setSlotStep] = useState(String(initialSlotStep || 60));
  const [defaultDuration, setDefaultDuration] = useState(String(initialDefaultDuration || 120));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function toggleDay(iso: number) {
    setWeekdays((prev) => {
      const n = new Set(prev);
      if (n.has(iso)) n.delete(iso);
      else n.add(iso);
      return n;
    });
  }

  return (
    <form
      className="kz-prof-form"
      style={{ marginTop: 28, paddingTop: 28, borderTop: "1px solid var(--border)" }}
      onSubmit={async (e: FormEvent) => {
        e.preventDefault();
        setErr(null);
        setOk(null);
        setBusy(true);
        try {
          const res = await updateMyProfessionalSchedule({
            workDayStart,
            workDayEnd,
            workWeekdays: [...weekdays],
            bookingSlotStepMinutes: Number.parseInt(slotStep, 10),
            bookingDefaultDurationMinutes: Number.parseInt(defaultDuration, 10),
          });
          if (!res.ok) {
            setErr(res.message);
            return;
          }
          setOk("Agenda de atendimento atualizada. Os horários oferecidos no agendamento usam estas regras.");
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="kz-prof-head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kz-prof-title">Horário de trabalho e agenda</div>
          <div className="kz-prof-sub">
            Define quando clientes podem marcar. Cada serviço tem duração própria; aqui você ajusta o expediente e o
            espaçamento entre horários ofertados.
          </div>
        </div>
      </div>

      <div className="kz-prof-row kz-prof-grid">
        <label className="auth-field">
          <span className="auth-label">Início do expediente</span>
          <input
            className="auth-input"
            type="time"
            value={workDayStart}
            onChange={(e) => setWorkDayStart(e.target.value)}
            required
            disabled={busy}
          />
        </label>
        <label className="auth-field">
          <span className="auth-label">Fim do expediente</span>
          <input
            className="auth-input"
            type="time"
            value={workDayEnd}
            onChange={(e) => setWorkDayEnd(e.target.value)}
            required
            disabled={busy}
          />
        </label>
      </div>

      <div className="auth-field" style={{ marginTop: 12 }}>
        <span className="auth-label">Dias em que atende</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {WEEK_OPTS.map(({ iso, label }) => (
            <button
              key={iso}
              type="button"
              disabled={busy}
              onClick={() => toggleDay(iso)}
              className="btn-ghost"
              style={{
                fontSize: 13,
                padding: "8px 12px",
                borderRadius: 10,
                fontWeight: 700,
                border: weekdays.has(iso) ? "2px solid var(--ink)" : "1.5px solid var(--border)",
                background: weekdays.has(iso) ? "var(--cream)" : "transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="kz-prof-row kz-prof-grid" style={{ marginTop: 14 }}>
        <label className="auth-field">
          <span className="auth-label">Intervalo entre horários (min)</span>
          <select
            className="auth-input"
            value={slotStep}
            onChange={(e) => setSlotStep(e.target.value)}
            disabled={busy}
          >
            <option value="30">30</option>
            <option value="60">60</option>
            <option value="90">90</option>
            <option value="120">120</option>
            <option value="180">180</option>
            <option value="240">240</option>
          </select>
        </label>
        <label className="auth-field">
          <span className="auth-label">Duração padrão (min)</span>
          <input
            className="auth-input"
            type="number"
            min={15}
            max={600}
            step={15}
            value={defaultDuration}
            onChange={(e) => setDefaultDuration(e.target.value)}
            disabled={busy}
          />
        </label>
      </div>
      <p className="sec-sub" style={{ margin: "10px 0 0", fontSize: 12.5, maxWidth: 640 }}>
        A duração usada nos slots vem de cada serviço cadastrado; este valor padrão só entra se algo estiver inconsistente
        no banco.
      </p>

      {err ? <p className="auth-error">{err}</p> : null}
      {ok ? <p className="auth-banner auth-banner--ok">{ok}</p> : null}

      <button type="submit" className="btn-cta auth-submit" disabled={busy} style={{ marginTop: 16 }}>
        {busy ? "Salvando…" : "Salvar agenda"}
      </button>
    </form>
  );
}
