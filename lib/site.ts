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

/** Título padrão da guia (curto, com benefício). Ícones: `app/icon.tsx` + `app/apple-icon.tsx`. */
export const SITE_TITLE_DEFAULT = "Kazaro · Profissionais e agenda";

/** Demais páginas: `Página | Kazaro` */
export const SITE_TITLE_TEMPLATE = "%s | Kazaro";

export const SITE_DESCRIPTION =
  "Encontre o profissional ideal para o seu estilo em Florianópolis: compare serviços, preços e avaliações e agende com horário marcado no Kazaro.";

/** Título da home para busca (H1 do site fica mais amplo; aqui mantemos local + marca). */
export const SITE_HOME_SEO_TITLE = "Kazaro | Profissionais e agendamento em Florianópolis";

/** Perfil oficial no Instagram (link no rodapé). */
export const INSTAGRAM_URL = "https://www.instagram.com/kazaro.app/";
