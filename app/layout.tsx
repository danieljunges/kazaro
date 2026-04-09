import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LogoutFlashToast } from "@/components/auth/LogoutFlashToast";
import { NavigationProgress } from "@/components/common/NavigationProgress";
import { RouteScrollTop } from "@/components/common/RouteScrollTop";
import { KzSaasMotion } from "@/components/motion/KzSaasMotion";
import { CookieConsentBar } from "@/components/legal/CookieConsentBar";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE_DEFAULT, SITE_TITLE_TEMPLATE } from "@/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_TITLE_DEFAULT,
    template: SITE_TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    icon: [{ url: "/kazaro-icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/kazaro-icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: SITE_NAME,
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf8f5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NavigationProgress />
        <Suspense fallback={null}>
          <RouteScrollTop />
        </Suspense>
        <Suspense fallback={null}>
          <LogoutFlashToast />
        </Suspense>
        <Suspense fallback={null}>
          <KzSaasMotion />
        </Suspense>
        {children}
        <CookieConsentBar />
      </body>
    </html>
  );
}
