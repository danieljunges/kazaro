/** Estados de `pro_services.status` (minúsculas no app; DB pode variar). */

export function normalizeProServiceStatus(status: string | null | undefined): string {
  return (status ?? "").trim().toLowerCase();
}

export function proServiceStatusLabelPt(status: string | null | undefined): string {
  const raw = (status ?? "").trim();
  if (!raw) return "-";
  switch (normalizeProServiceStatus(raw)) {
    case "approved":
      return "Ativo";
    case "pending":
      return "Em análise";
    case "rejected":
      return "Não aprovado";
    default:
      return "Em análise";
  }
}

/** Classe BEM `kz-svc-preview-card__status--*` / cores de pill no dashboard. */
export function proServiceStatusCssKey(status: string | null | undefined): "approved" | "pending" | "rejected" {
  const s = normalizeProServiceStatus(status);
  if (s === "approved" || s === "pending" || s === "rejected") return s;
  return "pending";
}

export function isProServiceApproved(status: string | null | undefined): boolean {
  return normalizeProServiceStatus(status) === "approved";
}

export function isProServicePending(status: string | null | undefined): boolean {
  return normalizeProServiceStatus(status) === "pending";
}
