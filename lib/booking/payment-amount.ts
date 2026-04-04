/** Mínimo usado no checkout (centavos). */
export const STRIPE_MIN_CHARGE_CENTS = 50;

/**
 * Cobrança a partir do preço fixo do anúncio (serviço aprovado).
 */
export function chargeCentsFromApprovedService(priceCents: number | null | undefined): number | null {
  const v = typeof priceCents === "number" && !Number.isNaN(priceCents) ? priceCents : null;
  if (v != null && v >= STRIPE_MIN_CHARGE_CENTS) return v;
  return null;
}
