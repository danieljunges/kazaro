"use server";

import { chargeCentsFromApprovedService, STRIPE_MIN_CHARGE_CENTS } from "@/lib/booking/payment-amount";
import { isoWeekdayFromYyyyMmDdSaoPaulo } from "@/lib/datetime/sao-paulo-calendar";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const SP = "-03:00";

export type SubmitBookingInput = {
  professionalId: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm (horário liberado pela agenda do prestador) */
  time: string;
  /** Obrigatório: serviço aprovado com preço fixo */
  proServiceId: string;
  clientNote: string;
  /** Endereço completo (texto montado no formulário: CEP, logradouro, número, etc.). */
  clientLocation: string;
};

function toScheduledIso(date: string, time: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  if (!m) return null;
  const t = time.trim();
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) return null;
  const [hh, mm] = t.split(":");
  const isoLocal = `${m[1]}-${m[2]}-${m[3]}T${hh}:${mm}:00${SP}`;
  const d = new Date(isoLocal);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export type BookingSlotsEmptyReason = "weekday_off" | "no_slots_in_workday";

export async function fetchBookingSlotsForDate(input: {
  professionalId: string;
  date: string;
  durationMinutes: number;
}): Promise<
  | { ok: true; slots: string[]; emptyReason?: BookingSlotsEmptyReason }
  | { ok: false; message: string }
> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return { ok: false, message: "Faça login." };
  }

  const date = input.date?.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, message: "Data inválida." };
  }

  const dur = Math.min(600, Math.max(15, Math.round(Number(input.durationMinutes) || 120)));

  const { data: proW, error: wErr } = await supabase
    .from("professionals")
    .select("work_weekdays")
    .eq("id", input.professionalId)
    .maybeSingle();

  if (wErr || !proW) {
    return { ok: false, message: "Não foi possível carregar a agenda deste profissional." };
  }

  const wdRaw = proW.work_weekdays as unknown;
  const wdays = Array.isArray(wdRaw)
    ? (wdRaw as unknown[]).map((n) => Math.round(Number(n))).filter((n) => n >= 1 && n <= 7)
    : [];
  const isoDow = isoWeekdayFromYyyyMmDdSaoPaulo(date);
  if (isoDow != null && wdays.length > 0 && !wdays.includes(isoDow)) {
    return { ok: true, slots: [], emptyReason: "weekday_off" };
  }

  const { data, error } = await supabase.rpc("kazaro_booking_slots", {
    p_professional_id: input.professionalId,
    p_date: date,
    p_duration_minutes: dur,
  });

  if (error) {
    console.error("kazaro_booking_slots", error);
    return {
      ok: false,
      message:
        "Não foi possível carregar horários. Se o problema continuar, confira se a migration de agenda foi aplicada no Supabase.",
    };
  }

  const slots = Array.isArray(data) ? (data as unknown[]).filter((s): s is string => typeof s === "string") : [];
  if (slots.length === 0) {
    return { ok: true, slots: [], emptyReason: "no_slots_in_workday" };
  }
  return { ok: true, slots };
}

export async function submitBookingRequest(
  input: SubmitBookingInput,
): Promise<
  { ok: true; bookingId: string; priceCents: number | null } | { ok: false; message: string }
> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user?.id) {
    return { ok: false, message: "Faça login para enviar o pedido de agendamento." };
  }

  if (user.id === input.professionalId) {
    return { ok: false, message: "Você não pode agendar com o seu próprio perfil." };
  }

  const proServiceId = input.proServiceId?.trim();
  if (!proServiceId) {
    return { ok: false, message: "Escolha um serviço com preço fixo." };
  }

  const scheduledIso = toScheduledIso(input.date, input.time);
  if (!scheduledIso) {
    return { ok: false, message: "Data ou horário inválidos." };
  }

  const minAhead = new Date(Date.now() - 60_000);
  if (new Date(scheduledIso) < minAhead) {
    return { ok: false, message: "Escolha uma data e horário no futuro." };
  }

  const { data: svc, error: sErr } = await supabase
    .from("pro_services")
    .select("id, name, professional_id, price_cents, status, duration_minutes")
    .eq("id", proServiceId)
    .maybeSingle();

  if (
    sErr ||
    !svc ||
    (svc.professional_id as string) !== input.professionalId ||
    (svc.status as string) !== "approved"
  ) {
    return { ok: false, message: "Serviço inválido ou ainda não aprovado para este profissional." };
  }

  const serviceNameSnapshot = svc.name as string;
  const cents = svc.price_cents as number | null | undefined;
  const chargeCents = chargeCentsFromApprovedService(cents);
  if (chargeCents == null) {
    return { ok: false, message: "Este serviço não tem preço válido para pagamento online." };
  }

  const durRaw = svc.duration_minutes as number | null | undefined;
  const durationSnapshot =
    typeof durRaw === "number" && durRaw >= 15 && durRaw <= 600 ? durRaw : 120;

  const { data: slotFree, error: rpcErr } = await supabase.rpc("kazaro_booking_slot_free", {
    p_professional_id: input.professionalId,
    p_scheduled_at: scheduledIso,
    p_duration_minutes: durationSnapshot,
  });

  if (rpcErr) {
    console.error("kazaro_booking_slot_free", rpcErr);
    return { ok: false, message: "Não foi possível validar o horário. Tente de novo." };
  }
  if (slotFree !== true) {
    return {
      ok: false,
      message: "Este horário não está mais disponível. Escolha outro horário na agenda.",
    };
  }

  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (pErr) {
    return { ok: false, message: "Não foi possível carregar seu perfil. Tente de novo." };
  }

  const nameRaw = (profile?.full_name as string | null)?.trim();
  const clientName = nameRaw || user.email?.split("@")[0] || "Cliente";
  const clientEmail = user.email ?? null;

  const note = input.clientNote.trim().slice(0, 2000);
  const clientLocation = input.clientLocation.trim().slice(0, 1500);
  if (clientLocation.length < 12) {
    return {
      ok: false,
      message: "Complete o endereço do serviço (CEP, logradouro, número e cidade).",
    };
  }

  const paymentStatus = chargeCents >= STRIPE_MIN_CHARGE_CENTS ? "unpaid" : "none";

  const { data: inserted, error: insErr } = await supabase
    .from("bookings")
    .insert({
      professional_id: input.professionalId,
      client_id: user.id,
      pro_service_id: proServiceId,
      service_name_snapshot: serviceNameSnapshot,
      service_price_cents_snapshot: chargeCents,
      duration_minutes_snapshot: durationSnapshot,
      scheduled_at: scheduledIso,
      client_note: note || null,
      client_location_snapshot: clientLocation,
      client_name_snapshot: clientName,
      client_email_snapshot: clientEmail,
      status: "pending",
      payment_status: paymentStatus,
    })
    .select("id")
    .single();

  if (insErr) {
    const msg = insErr.message?.toLowerCase() ?? "";
    if (msg.includes("relation") && msg.includes("bookings")) {
      return {
        ok: false,
        message:
          "Tabela de agendamentos ainda não foi criada no banco. Rode a migration 20250331140000_bookings.sql no Supabase.",
      };
    }
    return { ok: false, message: insErr.message || "Não foi possível salvar o pedido." };
  }

  const bookingId = inserted?.id as string | undefined;
  if (!bookingId) {
    return { ok: false, message: "Pedido salvo mas sem identificador. Tente de novo." };
  }

  return { ok: true, bookingId, priceCents: chargeCents };
}
