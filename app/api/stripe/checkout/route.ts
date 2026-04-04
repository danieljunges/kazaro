import { NextResponse } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Pagamento online ainda não está ativo." }, { status: 503 });
  }

  let body: { bookingId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const bookingId = body.bookingId?.trim();
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId obrigatório." }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Faça login para pagar." }, { status: 401 });
  }

  const { data: booking, error: bErr } = await supabase
    .from("bookings")
    .select("id, client_id, service_name_snapshot, service_price_cents_snapshot, payment_status")
    .eq("id", bookingId)
    .maybeSingle();

  if (bErr || !booking) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  if ((booking.client_id as string) !== user.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  if ((booking.payment_status as string) !== "unpaid") {
    return NextResponse.json({ error: "Este pedido não está aguardando pagamento." }, { status: 400 });
  }

  const cents = booking.service_price_cents_snapshot as number | null;
  if (typeof cents !== "number" || cents < 50) {
    return NextResponse.json({ error: "Valor inválido para pagamento." }, { status: 400 });
  }

  const admin = getSupabaseServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Servidor sem permissão para registrar cobrança (SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  const site = getSiteUrl();
  const productName = ((booking.service_name_snapshot as string | null) ?? "").trim() || "Serviço Kazaro";

  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: cents,
            product_data: {
              name: productName,
              description: `Pedido ${bookingId.slice(0, 8)}…`,
            },
          },
        },
      ],
      metadata: { booking_id: bookingId },
      success_url: `${site}/dashboard/historico?pagamento=sucesso`,
      cancel_url: `${site}/dashboard/historico?pagamento=cancelado`,
      customer_email: user.email ?? undefined,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Não foi possível iniciar o pagamento. Tente de novo." }, { status: 502 });
  }

  if (!session.id || !session.url) {
    return NextResponse.json({ error: "Falha ao criar sessão de pagamento." }, { status: 500 });
  }

  const { error: uErr } = await admin
    .from("bookings")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", bookingId)
    .eq("client_id", user.id);

  if (uErr) {
    console.error("stripe checkout session id persist:", uErr);
  }

  return NextResponse.json({ url: session.url });
}
