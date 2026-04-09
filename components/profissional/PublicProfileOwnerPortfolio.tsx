"use client";

import { ProPortfolioSection } from "@/components/settings/ProPortfolioSection";

type Row = { id: string; image_url: string };

/** Edição de portfólio no perfil público (só o dono vê). */
export function PublicProfileOwnerPortfolio({ initialPhotos }: { initialPhotos: Row[] }) {
  return (
    <div className="pp-owner-portfolio">
      <ProPortfolioSection initialPhotos={initialPhotos} />
    </div>
  );
}
