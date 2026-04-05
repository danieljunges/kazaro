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

/** Título curto para a guia do navegador (home e fallback do layout). */
export const SITE_TITLE_DEFAULT = "Kazaro — Serviços para casa em Florianópolis";

/** Sufixo padrão nas demais páginas: `Página · Kazaro` */
export const SITE_TITLE_TEMPLATE = "%s · Kazaro";

export const SITE_DESCRIPTION =
  "Profissionais verificados para serviços em casa: preços claros, perfis transparentes e suporte pelo Kazaro.";

export const INSTAGRAM_HANDLE = "kazaro.app";

export const INSTAGRAM_URL = "https://www.instagram.com/kazaro.app/";
