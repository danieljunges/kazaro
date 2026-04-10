import type { Metadata } from "next";
import { HomeView } from "@/components/home/HomeView";
import { MarketingNav } from "@/components/kazaro/MarketingNav";
import { SiteFooter } from "@/components/kazaro/SiteFooter";
import { fetchProfessionalsForHome } from "@/lib/supabase/professionals-public";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { HomeJsonLd } from "@/components/seo/HomeJsonLd";
import {
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_HOME_SEO_TITLE,
  SITE_NAME,
} from "@/lib/site";

const url = getSiteUrl();

export const metadata: Metadata = {
  title: { absolute: SITE_HOME_SEO_TITLE },
  description: SITE_DESCRIPTION,
  keywords: [
    "encontrar profissional Florianópolis",
    "agendamento online Florianópolis",
    "agendamento beleza Florianópolis",
    "barbearia Florianópolis",
    "manicure Florianópolis",
    "design de sobrancelha Florianópolis",
    "extensão de cílios Florianópolis",
    "tatuador Florianópolis",
    "cabeleireiro Florianópolis",
    "maquiagem Florianópolis",
    "podologia Florianópolis",
    "profissionais verificados",
    "vitrine de profissionais",
    SITE_NAME,
  ],
  openGraph: {
    title: SITE_HOME_SEO_TITLE,
    description: SITE_DESCRIPTION,
    url,
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_HOME_SEO_TITLE,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: url,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export default async function HomePage() {
  const [spotlightPros, proTotalListed] = await Promise.all([
    fetchProfessionalsForHome(8),
    (async () => {
      try {
        const supabase = await getSupabaseServerClient();
        const { count, error } = await supabase.from("professionals").select("*", { count: "exact", head: true });
        if (error) return 0;
        return count ?? 0;
      } catch {
        return 0;
      }
    })(),
  ]);

  return (
    <div className="home-editorial">
      <HomeJsonLd />
      <MarketingNav />
      <HomeView spotlightPros={spotlightPros} proTotalListed={proTotalListed} />
      <SiteFooter />
    </div>
  );
}
