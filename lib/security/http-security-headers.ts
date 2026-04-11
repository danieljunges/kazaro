import type { NextConfig } from "next";

const SUPABASE_HOST = (() => {
  try {
    const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!u) return "*.supabase.co";
    return new URL(u).hostname;
  } catch {
    return "*.supabase.co";
  }
})();

/**
 * Cabeçalhos de defesa em profundidade. CSP é deliberadamente compatível com Next.js + Supabase;
 * ajuste se adicionar novos domínios (analytics, fonts).
 */
export function buildSecurityHeaders(): { key: string; value: string }[] {
  const isProd = process.env.NODE_ENV === "production";

  const connect = [
    `'self'`,
    `https://${SUPABASE_HOST}`,
    `wss://${SUPABASE_HOST}`,
    // GA4 / gtag (collect, debug, região)
    "https://www.google-analytics.com",
    "https://*.google-analytics.com",
    "https://analytics.google.com",
    "https://*.analytics.google.com",
    "https://www.googletagmanager.com",
    "https://*.googletagmanager.com",
    "https://stats.g.doubleclick.net",
  ].join(" ");

  const cspParts = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src ${connect}`,
  ];
  if (isProd) cspParts.push("upgrade-insecure-requests");
  const csp = cspParts.join("; ");

  const headers: { key: string; value: string }[] = [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Content-Security-Policy", value: csp },
  ];

  if (isProd) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
}

export function attachSecurityHeadersToConfig(config: NextConfig): NextConfig {
  const securityHeaders = buildSecurityHeaders();
  const existing = config.headers;
  return {
    ...config,
    async headers() {
      const prev = (await existing?.()) ?? [];
      return [
        ...prev,
        {
          source: "/:path*",
          headers: securityHeaders,
        },
      ];
    },
  };
}
