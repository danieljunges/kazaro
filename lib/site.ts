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

/** Título da guia na home e fallback do layout (SaaS, curto). */
export const SITE_TITLE_DEFAULT = "Kazaro";

/** Demais páginas: `Página | Kazaro` */
export const SITE_TITLE_TEMPLATE = "%s | Kazaro";

export const SITE_DESCRIPTION =
  "Plataforma para encontrar profissionais de beleza e bem-estar, ver serviços e agendar em Florianópolis.";

/** Perfil oficial no Instagram (link no rodapé). */
export const INSTAGRAM_URL = "https://www.instagram.com/kazaro.app/";
