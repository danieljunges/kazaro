import type { Metadata } from "next";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { ProfessionalPublicView } from "@/components/profissional/ProfessionalPublicView";
import { resolveProfessionalDetail } from "@/lib/professionals";
import {
  fetchProfessionalDetailFromDb,
  fetchProfessionalDisplayTitle,
} from "@/lib/supabase/professionals-public";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

function titleFromSlug(id: string): string {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const dbName = await fetchProfessionalDisplayTitle(id);
  const name = dbName ?? titleFromSlug(id);
  const base = getSiteUrl();
  const url = `${base}/profissional/${id}`;
  return {
    title: name,
    description: `Perfil de ${name} no ${SITE_NAME}. Serviços, preços e disponibilidade em um só lugar.`,
    openGraph: {
      title: `${name} | ${SITE_NAME}`,
      description: "Perfil profissional com avaliações e serviços detalhados.",
      url,
      type: "website",
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function ProfissionalPage({ params }: Props) {
  const { id } = await params;
  const fromDb = await fetchProfessionalDetailFromDb(id);
  const detail = fromDb ?? resolveProfessionalDetail(id);

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isOwner = false;
  let ownerPortfolioPhotos: { id: string; image_url: string }[] | null = null;
  if (user?.id && fromDb) {
    const { data: proRow } = await supabase.from("professionals").select("id").eq("slug", id).maybeSingle();
    if (proRow?.id === user.id) {
      isOwner = true;
      const { data: pf } = await supabase
        .from("pro_portfolio_photos")
        .select("id, image_url")
        .eq("professional_id", user.id)
        .order("sort_order", { ascending: true });
      ownerPortfolioPhotos = (pf ?? []) as { id: string; image_url: string }[];
    }
  }

  return (
    <div className="home-editorial public-page pp-page--nocab">
      <CompactNav backHref="/search" backLabel="← Busca" />
      <div className="pp-main pp-main--nocab">
        <ProfessionalPublicView
          detail={detail}
          isOwner={isOwner}
          ownerPortfolioPhotos={ownerPortfolioPhotos}
        />
      </div>
    </div>
  );
}
