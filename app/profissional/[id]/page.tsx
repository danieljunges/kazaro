import type { Metadata } from "next";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { ProfessionalPublicView } from "@/components/profissional/ProfessionalPublicView";
import { resolveProfessionalDetail } from "@/lib/professionals";
import {
  fetchProfessionalDetailFromDb,
  fetchProfessionalDisplayTitle,
} from "@/lib/supabase/professionals-public";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

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

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/search" backLabel="← Busca" />
      <div className="pp-bg">
        <div className="pp-band">
          <div className="pp-band-fade" />
        </div>
        <div className="pp-main">
          <ProfessionalPublicView detail={detail} />
        </div>
      </div>
    </div>
  );
}
