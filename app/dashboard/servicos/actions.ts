"use server";

import { revalidatePath } from "next/cache";
import { STRIPE_MIN_CHARGE_CENTS } from "@/lib/booking/payment-amount";
import { isServiceCategoryKey } from "@/lib/services/category-catalog";
import { isServiceAttendanceMode } from "@/lib/services/service-attendance";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function createService(input: {
  name: string;
  description: string;
  priceCents: number;
  durationMinutes: number;
  categoryKey: string;
  attendanceMode: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const name = input.name.trim();
  const description = input.description.trim();
  const priceCents = input.priceCents;
  const durationMinutes = Math.round(Number(input.durationMinutes) || 0);
  const categoryKey = input.categoryKey.trim();
  const attendanceMode = input.attendanceMode.trim();

  if (!isServiceAttendanceMode(attendanceMode)) {
    return { ok: false, message: "Indique como você atende este serviço (seu espaço, deslocamento ou ambos)." };
  }
  if (!isServiceCategoryKey(categoryKey)) {
    return { ok: false, message: "Escolha em que área este serviço se enquadra." };
  }
  if (name.length < 3) return { ok: false, message: "Dê um nome com pelo menos 3 caracteres." };
  if (name.length > 80) return { ok: false, message: "Nome muito longo." };
  if (description.length > 600) return { ok: false, message: "Descrição muito longa." };
  if (!Number.isFinite(priceCents) || priceCents < STRIPE_MIN_CHARGE_CENTS || priceCents > 50_000_00) {
    return {
      ok: false,
      message: `Informe um preço válido (mínimo R$ ${(STRIPE_MIN_CHARGE_CENTS / 100).toFixed(2).replace(".", ",")}).`,
    };
  }
  if (durationMinutes < 15 || durationMinutes > 600) {
    return { ok: false, message: "Duração estimada entre 15 e 600 minutos." };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, message: "Faça login para continuar." };

  const { data: pro, error: pErr } = await supabase.from("professionals").select("id").eq("id", user.id).maybeSingle();
  if (pErr || !pro?.id) return { ok: false, message: "Ative seu perfil de prestador para cadastrar serviços." };

  const { error: insErr } = await supabase.from("pro_services").insert({
    professional_id: user.id,
    name,
    description: description || null,
    price_cents: priceCents,
    duration_minutes: durationMinutes,
    status: "pending",
    category_key: categoryKey,
    attendance_mode: attendanceMode,
  });

  if (insErr) {
    if (insErr.code === "23505") {
      return {
        ok: false,
        message:
          "Você já tem um serviço nesta área (em análise ou ativo). Cadastre outra categoria ou aguarde a moderação.",
      };
    }
    return { ok: false, message: insErr.message || "Não foi possível criar o serviço." };
  }

  revalidatePath("/dashboard/servicos");
  revalidatePath("/dashboard");
  revalidatePath("/search");
  return { ok: true };
}
