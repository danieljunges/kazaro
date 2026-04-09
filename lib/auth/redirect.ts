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

function emailConfirmationRedirectWithOrigin(origin: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/auth/callback?next=${encodeURIComponent(AUTH_EMAIL_CONFIRM_NEXT_PATH)}`;
}

/** Servidor / rotas: usa `getSiteUrl()` (VERCEL_URL, etc.). */
export function getEmailConfirmationRedirectUrl(): string {
  return emailConfirmationRedirectWithOrigin(getSiteUrl());
}

/**
 * Componentes client (`signUp` / `resend`): no browser `getSiteUrl()` só vê
 * `NEXT_PUBLIC_SITE_URL` — `VERCEL_*` não existe no bundle — e caía em localhost,
 * gerando link de confirmação errado no Supabase.
 */
export function getEmailConfirmationRedirectUrlClient(): string {
  const fromEnv = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") : "";
  if (fromEnv) return emailConfirmationRedirectWithOrigin(fromEnv);
  if (typeof window !== "undefined" && window.location?.origin) {
    return emailConfirmationRedirectWithOrigin(window.location.origin);
  }
  return getEmailConfirmationRedirectUrl();
}
