"use server";

import { revalidatePath } from "next/cache";
import { notifyClientOfBookingStatusChange } from "@/lib/email/bookingStatusNotify";
import { fetchMyProfileRole } from "@/lib/supabase/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED = ["pending", "confirmed", "cancelled", "completed"] as const;
type BookingStatus = (typeof ALLOWED)[number];

function formatBookingWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

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

  const role = await fetchMyProfileRole(user.id);
  const isAdmin = role === "admin";

  const { data: row, error: rErr } = await supabase
    .from("bookings")
    .select(
      "id, professional_id, client_id, status, service_name_snapshot, scheduled_at, client_email_snapshot",
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (rErr || !row) return { ok: false, message: "Não foi possível localizar o agendamento." };

  const proId = row.professional_id as string;
  const isProfessional = proId === user.id;
  if (!isAdmin && !isProfessional) {
    return { ok: false, message: "Você não tem permissão para alterar este agendamento." };
  }

  const prevStatus = String(row.status ?? "");
  if (prevStatus === nextStatus) {
    return { ok: true };
  }

  const { error: uErr } = await supabase.from("bookings").update({ status: nextStatus }).eq("id", bookingId);
  if (uErr) return { ok: false, message: uErr.message || "Não foi possível atualizar o status." };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/historico");
  revalidatePath("/admin/agendamentos");

  const clientId = row.client_id as string;
  const { data: profile } = await supabase.from("profiles").select("email").eq("id", clientId).maybeSingle();
  const to =
    (typeof profile?.email === "string" && profile.email.trim()) ||
    (typeof row.client_email_snapshot === "string" && row.client_email_snapshot.trim()) ||
    "";

  if (to) {
    const { data: pro } = await supabase
      .from("professionals")
      .select("display_name")
      .eq("id", proId)
      .maybeSingle();
    const professionalName = (pro?.display_name as string | undefined)?.trim() || "Profissional";
    const serviceLabel = (row.service_name_snapshot as string | null)?.trim() || "Serviço a combinar";

    void notifyClientOfBookingStatusChange({
      to,
      status: nextStatus,
      serviceLabel,
      whenLabel: formatBookingWhen(String(row.scheduled_at)),
      professionalName,
    });
  }

  return { ok: true };
}

