/** Abreviações alinhadas ao formulário de Configurações (ISO 1 = seg … 7 = dom). */
export const ISO_DAY_ABBR_PT: Record<number, string> = {
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
  7: "Dom",
};

export function formatIsoWeekdaysBriefPt(days: number[]): string {
  return [...new Set(days)]
    .filter((d) => d >= 1 && d <= 7)
    .sort((a, b) => a - b)
    .map((d) => ISO_DAY_ABBR_PT[d] ?? String(d))
    .join(", ");
}
