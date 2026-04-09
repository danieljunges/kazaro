import { getSiteUrl } from "@/lib/site";

/** Origin for e-mail links e OAuth (sem barra final). */
export function getAuthSiteOrigin(): string {
  return getSiteUrl();
}

export function getAuthCallbackUrl(): string {
  return `${getSiteUrl()}/auth/callback`;
}
