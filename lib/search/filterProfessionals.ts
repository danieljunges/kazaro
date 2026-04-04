import type { ProfessionalCard } from "@/lib/professionals";

/** Sinônimos comuns → termo que costuma aparecer em roleLine / cadastro. */
const CATEGORY_ALIASES: Record<string, string> = {
  encanamento: "encanador",
  eletrica: "eletricista",
  pintura: "pintor",
};

export function foldSearchText(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Normaliza o que o usuário digitou antes de filtrar (ex.: “encanamento” → encanador). */
export function resolveSearchQuery(q: string | null | undefined): string {
  const t = (q ?? "").trim();
  if (!t) return "";
  const key = foldSearchText(t);
  return CATEGORY_ALIASES[key] ?? t;
}

/** Filtra cartões públicos por texto livre (nome, linha de papel, slug, preço). */
export function filterProfessionalsByQuery(
  rows: ProfessionalCard[],
  q: string | null | undefined,
): ProfessionalCard[] {
  const t = foldSearchText(q ?? "");
  if (!t) return rows;
  return rows.filter((r) => {
    const hay = foldSearchText(`${r.name} ${r.roleLine} ${r.slug} ${r.price} ${r.filterExtra ?? ""}`);
    return hay.includes(t);
  });
}
