import { getSiteUrl } from "@/lib/site";

/** Origin for e-mail links e OAuth (sem barra final). */
export function getAuthSiteOrigin(): string {
  return getSiteUrl();
}

export function getAuthCallbackUrl(): string {
  return `${getSiteUrl()}/auth/callback`;
}

/** Mesmo destino após confirmar e-mail no link (precisa bater com signUp e com resend). */
export const AUTH_EMAIL_CONFIRM_NEXT_PATH = "/dashboard?conta=ativada";

/** URL completa em emailRedirectTo (confirmação de cadastro / reenvio). */
export function getEmailConfirmationRedirectUrl(): string {
  return `${getAuthCallbackUrl()}?next=${encodeURIComponent(AUTH_EMAIL_CONFIRM_NEXT_PATH)}`;
}
