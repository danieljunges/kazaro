"use server";

import { revalidatePath } from "next/cache";
import { fetchMyProfile } from "@/lib/supabase/profile-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function submitBookingReview(
  bookingId: string,
  stars: number,
  comment: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const id = bookingId?.trim();
  if (!id) return { ok: false, message: "Pedido inválido." };
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { ok: false, message: "Escolha de 1 a 5 estrelas." };
  }

  const c = comment.trim();
  if (c.length < 3) return { ok: false, message: "Escreva um comentário (mínimo 3 caracteres)." };
  if (c.length > 2000) return { ok: false, message: "Comentário muito longo." };

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, message: "Faça login para avaliar." };

  const { data: booking, error: bErr } = await supabase
    .from("bookings")
    .select("id, client_id, professional_id, status")
    .eq("id", id)
    .maybeSingle();

  if (bErr || !booking) return { ok: false, message: "Pedido não encontrado." };
  if ((booking.client_id as string) !== user.id) {
    return { ok: false, message: "Só quem contratou pode avaliar." };
  }
  if ((booking.status as string) !== "completed") {
    return { ok: false, message: "Só é possível avaliar serviços concluídos." };
  }

  const profile = await fetchMyProfile(user.id);
  const raw = profile?.full_name?.trim();
  const first = raw ? raw.split(/\s+/)[0] : "";
  const author_public_name =
    first.length > 0 ? (first.length > 28 ? `${first.slice(0, 28)}…` : first) : "Cliente verificado";

  const { error: iErr } = await supabase.from("booking_reviews").insert({
    booking_id: id,
    professional_id: booking.professional_id as string,
    client_id: user.id,
    stars,
    comment: c,
    author_public_name,
  });

  if (iErr) {
    if (iErr.message.includes("unique") || iErr.code === "23505") {
      return { ok: false, message: "Este pedido já foi avaliado." };
    }
    return { ok: false, message: iErr.message || "Não foi possível salvar a avaliação." };
  }

  const { data: pro } = await supabase.from("professionals").select("slug").eq("id", booking.professional_id).maybeSingle();
  const slug = pro?.slug as string | undefined;

  revalidatePath("/dashboard/historico");
  revalidatePath("/dashboard");
  revalidatePath("/search");
  if (slug) revalidatePath(`/profissional/${slug}`);

  return { ok: true };
}
