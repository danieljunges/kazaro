import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET missing");
    return NextResponse.json({ error: "Webhook não configurado." }, { status: 503 });
  }

  const buf = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Assinatura ausente." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(buf, sig, secret);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id?.trim();
    if (!bookingId || session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const admin = getSupabaseServiceRoleClient();
    if (!admin) {
      console.error("webhook: no Supabase service role");
      return NextResponse.json({ error: "DB admin missing." }, { status: 503 });
    }

    const { data: row } = await admin
      .from("bookings")
      .select("id, payment_status, service_price_cents_snapshot")
      .eq("id", bookingId)
      .maybeSingle();

    if (!row || (row.payment_status as string) === "paid") {
      return NextResponse.json({ received: true });
    }

    const expected = row.service_price_cents_snapshot as number | null;
    const paid = session.amount_total;
    if (typeof expected === "number" && expected > 0 && typeof paid === "number" && paid !== expected) {
      console.error("Stripe amount mismatch", { bookingId, expected, paid });
      await admin.from("bookings").update({ payment_status: "failed" }).eq("id", bookingId);
      return NextResponse.json({ received: true });
    }

    await admin.from("bookings").update({ payment_status: "paid" }).eq("id", bookingId);
  }

  return NextResponse.json({ received: true });
}
