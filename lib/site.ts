/** URL pública do site — define em produção (ex.: https://kazaro.com.br) */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const SITE_NAME = "Kazaro";

export const SITE_DESCRIPTION =
  "Profissionais verificados para serviços em casa: preços claros, perfis transparentes e suporte pelo Kazaro.";
