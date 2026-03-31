import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { BookingRequestForm } from "@/components/booking/BookingRequestForm";
import { fetchBookingPageContext } from "@/lib/supabase/bookings";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ servico?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: slug } = await params;
  const ctx = await fetchBookingPageContext(slug);
  const name = ctx?.displayName ?? "Profissional";
  const base = getSiteUrl();
  const url = `${base}/profissional/${slug}/agendar`;
  return {
    title: `Agendar com ${name}`,
    description: `Envie um pedido de agendamento para ${name} no ${SITE_NAME}.`,
    alternates: { canonical: url },
  };
}

export default async function AgendarPage({ params, searchParams }: Props) {
  const { id: slug } = await params;
  const sp = await searchParams;
  const ctx = await fetchBookingPageContext(slug);
  if (!ctx) notFound();

  let initialServiceIndex: number | null = null;
  if (sp.servico != null && sp.servico !== "") {
    const n = Number.parseInt(sp.servico, 10);
    if (!Number.isNaN(n) && n >= 0) initialServiceIndex = n;
  }

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref={`/profissional/${slug}`} backLabel="← Perfil" />
      <div className="section booking-section">
        <div className="pro-page-card booking-card">
          <span className="sec-eyebrow">Agendamento</span>
          <h1 className="sec-title booking-title">Pedido para {ctx.displayName}</h1>
          <p className="sec-sub booking-lead">
            Escolha data e horário sugeridos. O profissional confirma por mensagem ou pelo painel — nada é cobrado
            automaticamente nesta etapa.
          </p>
          <BookingRequestForm context={ctx} initialServiceIndex={initialServiceIndex} />
        </div>
      </div>
    </div>
  );
}
