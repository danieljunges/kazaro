/** Mínimo usado no checkout (centavos). */
export const STRIPE_MIN_CHARGE_CENTS = 50;

/**
 * Valor efetivo para cobrança: preço do serviço se >= mínimo; senão “piso” do perfil (`price_from_cents`) quando >= mínimo.
 * Espelha a regra em `submitBookingRequest` e no formulário de agendamento.
 */
export function resolveStripeChargeCents(
  servicePriceCents: number | null | undefined,
  professionalFloorCents: number | null | undefined,
): number | null {
  const svc = typeof servicePriceCents === "number" && !Number.isNaN(servicePriceCents) ? servicePriceCents : null;
  const floor =
    typeof professionalFloorCents === "number" && !Number.isNaN(professionalFloorCents)
      ? professionalFloorCents
      : null;

  if (svc != null && svc >= STRIPE_MIN_CHARGE_CENTS) return svc;
  if (svc != null && svc > 0 && svc < STRIPE_MIN_CHARGE_CENTS) {
    if (floor != null && floor >= STRIPE_MIN_CHARGE_CENTS) return floor;
    return null;
  }
  if (floor != null && floor >= STRIPE_MIN_CHARGE_CENTS) return floor;
  return null;
}
