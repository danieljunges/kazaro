/** Domínio canônico em produção (sem barra final). Usado como fallback se `NEXT_PUBLIC_SITE_URL` não estiver definida na Vercel. */
export const SITE_CANONICAL_ORIGIN = "https://kazaro.app";

/**
 * URL pública do site (sem barra final).
 * Ordem: variável de ambiente → produção na Vercel → deploy preview → localhost.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_ENV === "production") return SITE_CANONICAL_ORIGIN;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const SITE_NAME = "Kazaro";

export const SITE_DESCRIPTION =
  "Profissionais verificados para serviços em casa: preços claros, perfis transparentes e suporte pelo Kazaro.";
