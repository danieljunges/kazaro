import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { BookingRequestForm } from "@/components/booking/BookingRequestForm";
import { resolveProfessionalDetail } from "@/lib/professionals";
import { fetchBookingPageContext } from "@/lib/supabase/bookings";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const nextPath = (() => {
    const qs = new URLSearchParams();
    if (sp.servico != null && sp.servico !== "") qs.set("servico", String(sp.servico));
    const base = `/profissional/${slug}/agendar`;
    const q = qs.toString();
    return q ? `${base}?${q}` : base;
  })();
  if (!user) redirect(`/entrar?next=${encodeURIComponent(nextPath)}`);

  const fromDb = await fetchBookingPageContext(slug);
  const ctx =
    fromDb ??
    (() => {
      const detail = resolveProfessionalDetail(slug);
      return {
        professionalId: null,
        slug: detail.slug,
        displayName: detail.name,
        services: detail.services.map((s, i) => ({
          id: `demo-${i}`,
          name: s.name,
          price_cents: 12_000,
          duration_minutes: 120,
        })),
        isBookable: false,
        unavailableReason:
          "Este perfil ainda está em modo demonstração. Para testar envio real, use um profissional já cadastrado e ativo.",
      };
    })();
  if (!ctx?.slug) notFound();

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
            Escolha o <strong>serviço</strong> (preço fixo do anúncio), a <strong>data</strong> e um{" "}
            <strong>horário livre na agenda</strong> do profissional. O pagamento no cartão abre logo após enviar
            (Stripe). O prestador define expediente e intervalos em Configurações.
          </p>
          <BookingRequestForm context={ctx} initialServiceIndex={initialServiceIndex} />
        </div>
      </div>
    </div>
  );
}
