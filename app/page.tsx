import type { Metadata } from "next";
import { MarketingNav } from "@/components/kazaro/MarketingNav";
import { SiteFooter } from "@/components/kazaro/SiteFooter";
import { HomeView } from "@/components/home/HomeView";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

const url = getSiteUrl();

export const metadata: Metadata = {
  title: "O profissional certo para o seu lar",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} | Serviços para casa em Florianópolis`,
    description: SITE_DESCRIPTION,
    url,
    type: "website",
  },
  alternates: {
    canonical: url,
  },
};

export default function HomePage() {
  return (
    <div className="home-editorial">
      <MarketingNav />
      <HomeView />
      <SiteFooter />
    </div>
  );
}
