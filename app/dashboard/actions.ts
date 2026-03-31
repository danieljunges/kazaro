"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED = ["pending", "confirmed", "cancelled", "completed"] as const;
type BookingStatus = (typeof ALLOWED)[number];

export async function setBookingStatus(
  bookingId: string,
  nextStatus: BookingStatus,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!bookingId?.trim()) return { ok: false, message: "Agendamento inválido." };
  if (!ALLOWED.includes(nextStatus)) return { ok: false, message: "Status inválido." };

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, message: "Faça login para continuar." };

  const { data: row, error: rErr } = await supabase
    .from("bookings")
    .select("id, professional_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (rErr || !row) return { ok: false, message: "Não foi possível localizar o agendamento." };
  if ((row.professional_id as string) !== user.id) {
    return { ok: false, message: "Você não tem permissão para alterar este agendamento." };
  }

  const { error: uErr } = await supabase.from("bookings").update({ status: nextStatus }).eq("id", bookingId);
  if (uErr) return { ok: false, message: uErr.message || "Não foi possível atualizar o status." };

  revalidatePath("/dashboard");
  return { ok: true };
}

