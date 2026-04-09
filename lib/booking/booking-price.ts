/** Preço efetivo do pedido para exibição (final acordado ou valor do serviço na hora do agendamento). */
export function effectiveBookingPriceCents(
  finalPriceCents: number | null | undefined,
  servicePriceSnapshotCents: number | null | undefined,
): number | null {
  if (typeof finalPriceCents === "number" && finalPriceCents > 0) return finalPriceCents;
  if (typeof servicePriceSnapshotCents === "number" && servicePriceSnapshotCents > 0) {
    return servicePriceSnapshotCents;
  }
  return null;
}

export function formatPriceBRLFromCents(cents: number | null | undefined): string {
  if (cents == null || cents <= 0) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
    cents / 100,
  );
}
