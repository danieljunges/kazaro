"use server";

import { BOOKING_TIME_OPTIONS } from "@/lib/booking/constants";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const SP = "-03:00";

export type SubmitBookingInput = {
  professionalId: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm from BOOKING_TIME_OPTIONS */
  time: string;
  proServiceId: string | null;
  clientNote: string;
};

function toScheduledIso(date: string, time: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  if (!m) return null;
  const t = time.trim();
  if (!BOOKING_TIME_OPTIONS.includes(t as (typeof BOOKING_TIME_OPTIONS)[number])) return null;
  const [hh, mm] = t.split(":");
  const isoLocal = `${m[1]}-${m[2]}-${m[3]}T${hh}:${mm}:00${SP}`;
  const d = new Date(isoLocal);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function submitBookingRequest(
  input: SubmitBookingInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
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

  const scheduledIso = toScheduledIso(input.date, input.time);
  if (!scheduledIso) {
    return { ok: false, message: "Data ou horário inválidos." };
  }

  const minAhead = new Date(Date.now() - 60_000);
  if (new Date(scheduledIso) < minAhead) {
    return { ok: false, message: "Escolha uma data e horário no futuro." };
  }

  let serviceNameSnapshot: string | null = null;
  let servicePriceSnapshot: number | null = null;
  let proServiceId: string | null = input.proServiceId?.trim() || null;

  if (proServiceId) {
    const { data: svc, error: sErr } = await supabase
      .from("pro_services")
      .select("id, name, professional_id, price_cents, status")
      .eq("id", proServiceId)
      .maybeSingle();

    if (
      sErr ||
      !svc ||
      (svc.professional_id as string) !== input.professionalId ||
      ((svc.status as string | null) && svc.status !== "approved")
    ) {
      return { ok: false, message: "Serviço inválido para este profissional." };
    }
    serviceNameSnapshot = svc.name as string;
    const cents = svc.price_cents as number | null | undefined;
    servicePriceSnapshot = typeof cents === "number" ? cents : null;
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

  const { error: insErr } = await supabase.from("bookings").insert({
    professional_id: input.professionalId,
    client_id: user.id,
    pro_service_id: proServiceId,
    service_name_snapshot: serviceNameSnapshot,
    service_price_cents_snapshot: servicePriceSnapshot,
    scheduled_at: scheduledIso,
    client_note: note || null,
    client_name_snapshot: clientName,
    client_email_snapshot: clientEmail,
    status: "pending",
  });

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

  return { ok: true };
}
