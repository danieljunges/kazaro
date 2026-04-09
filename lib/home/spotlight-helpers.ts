import type { AvailTag, ProfessionalCard } from "@/lib/professionals";

const SURFACES = ["ph-green", "ph-blue", "ph-amber"] as const;

export function proSurfaceClass(phClass: ProfessionalCard["phClass"]): (typeof SURFACES)[number] {
  const order: ProfessionalCard["phClass"][] = ["ph-1", "ph-2", "ph-3", "ph-4", "ph-5", "ph-6"];
  const idx = order.indexOf(phClass);
  return SURFACES[(idx >= 0 ? idx : 0) % 3];
}

export function availBadge(avail: AvailTag): { className: string; label: string } {
  if (avail === "today") return { className: "avail-today", label: "Disponível hoje" };
  if (avail === "tomorrow") return { className: "avail-tom", label: "Disponível amanhã" };
  return { className: "avail-tom", label: "Esta semana" };
}

export function starsFromRatingPt(rating: string): string {
  const n = parseFloat(rating.replace(",", "."));
  if (Number.isNaN(n)) return "★★★★☆";
  const filled = Math.round(Math.min(5, Math.max(0, n)));
  return `${"★".repeat(filled)}${"☆".repeat(5 - filled)}`;
}
