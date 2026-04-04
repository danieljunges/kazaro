/** Datas de agenda alinhadas ao calendário em Florianópolis (America/Sao_Paulo, UTC−3). */

const TZ = "America/Sao_Paulo";
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function todayYyyyMmDdSaoPaulo(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Normaliza query `dia=YYYY-MM-DD` ou devolve hoje em SP. */
export function normalizeAgendaDayParam(raw: string | undefined): string {
  if (!raw || !DAY_RE.test(raw)) return todayYyyyMmDdSaoPaulo();
  const probe = new Date(`${raw}T12:00:00-03:00`);
  if (Number.isNaN(probe.getTime())) return todayYyyyMmDdSaoPaulo();
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(probe);
}

export function startEndExclusiveUtcForSaoPauloDay(yyyyMmDd: string): { startIso: string; endExclusiveIso: string } {
  const start = new Date(`${yyyyMmDd}T00:00:00-03:00`);
  const endMs = start.getTime() + 24 * 60 * 60 * 1000;
  return { startIso: start.toISOString(), endExclusiveIso: new Date(endMs).toISOString() };
}

export function shiftSaoPauloCalendarDay(yyyyMmDd: string, deltaDays: number): string {
  const mid = new Date(`${yyyyMmDd}T12:00:00-03:00`);
  mid.setTime(mid.getTime() + deltaDays * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(mid);
}

export function formatAgendaDayHeadingPtBR(yyyyMmDd: string): string {
  const d = new Date(`${yyyyMmDd}T12:00:00-03:00`);
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatAgendaTimePtBR(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
