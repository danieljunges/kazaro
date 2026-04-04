"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function updateMyProfile(input: {
  fullName: string;
  phone: string;
  avatarUrl: string | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, message: "Faça login para continuar." };

  const full_name = input.fullName.trim().slice(0, 120) || null;
  const phone = input.phone.trim().slice(0, 40) || null;
  const avatar_url = input.avatarUrl?.trim() ? input.avatarUrl.trim().slice(0, 800) : null;

  const { error } = await supabase.from("profiles").update({ full_name, phone, avatar_url }).eq("id", user.id);
  if (error) return { ok: false, message: error.message || "Não foi possível salvar." };

  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard");
  revalidatePath("/search");
  return { ok: true };
}

export async function updateMyProfessionalPublic(input: {
  displayName: string;
  serviceRegion: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, message: "Faça login para continuar." };

  const display_name = input.displayName.trim().slice(0, 120);
  const service_region = input.serviceRegion.trim().slice(0, 200);
  if (display_name.length < 2) {
    return { ok: false, message: "Informe o nome público (mín. 2 caracteres)." };
  }
  if (service_region.length < 3) {
    return { ok: false, message: "Descreva a região ou bairros em que você atende." };
  }

  const { error } = await supabase
    .from("professionals")
    .update({ display_name, service_region })
    .eq("id", user.id);

  if (error) return { ok: false, message: error.message || "Não foi possível salvar." };

  const { data: pro } = await supabase.from("professionals").select("slug").eq("id", user.id).maybeSingle();
  const slug = pro?.slug as string | undefined;
  if (slug) revalidatePath(`/profissional/${slug}`);

  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard");
  revalidatePath("/search");
  return { ok: true };
}

function parseClockToMinutes(s: string): number | null {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(s.trim());
  if (!m) return null;
  return Number.parseInt(m[1], 10) * 60 + Number.parseInt(m[2], 10);
}

export async function updateMyProfessionalSchedule(input: {
  workDayStart: string;
  workDayEnd: string;
  workWeekdays: number[];
  bookingSlotStepMinutes: number;
  bookingDefaultDurationMinutes: number;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, message: "Faça login para continuar." };

  const sm = parseClockToMinutes(input.workDayStart);
  const em = parseClockToMinutes(input.workDayEnd);
  if (sm == null || em == null) {
    return { ok: false, message: "Use horários no formato HH:MM (ex.: 08:00)." };
  }
  if (em <= sm) {
    return { ok: false, message: "O fim do expediente deve ser depois do início." };
  }

  const days = [...new Set(input.workWeekdays.map((n) => Math.round(n)).filter((n) => n >= 1 && n <= 7))];
  if (days.length === 0) {
    return { ok: false, message: "Marque pelo menos um dia da semana em que você atende." };
  }
  days.sort((a, b) => a - b);

  const step = Math.round(Number(input.bookingSlotStepMinutes));
  if (!Number.isFinite(step) || step < 30 || step > 240) {
    return { ok: false, message: "Intervalo entre horários: entre 30 e 240 minutos." };
  }

  const defDur = Math.round(Number(input.bookingDefaultDurationMinutes));
  if (!Number.isFinite(defDur) || defDur < 15 || defDur > 600) {
    return { ok: false, message: "Duração padrão: entre 15 e 600 minutos." };
  }

  const { error } = await supabase
    .from("professionals")
    .update({
      work_day_start: input.workDayStart.trim().slice(0, 5),
      work_day_end: input.workDayEnd.trim().slice(0, 5),
      work_weekdays: days,
      booking_slot_step_minutes: step,
      booking_default_duration_minutes: defDur,
    })
    .eq("id", user.id);

  if (error) return { ok: false, message: error.message || "Não foi possível salvar a agenda." };

  const { data: pro } = await supabase.from("professionals").select("slug").eq("id", user.id).maybeSingle();
  const slug = pro?.slug as string | undefined;
  if (slug) {
    revalidatePath(`/profissional/${slug}`);
    revalidatePath(`/profissional/${slug}/agendar`);
  }

  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agenda");
  return { ok: true };
}

/**
 * Remove o usuário em auth.users (cascata em profiles, etc.).
 * Exige senha atual (conta e-mail) ou confirmação por e-mail (login social).
 */
export async function deleteMyAccount(input: {
  password?: string;
  confirmationEmail?: string;
}): Promise<{ ok: true } | { ok: false; message: string; code?: "NO_SERVICE_ROLE" }> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id || !user.email) {
    return { ok: false, message: "Sessão inválida. Entre de novo." };
  }

  const admin = getSupabaseServiceRoleClient();
  if (!admin) {
    return {
      ok: false,
      code: "NO_SERVICE_ROLE",
      message:
        "Não foi possível concluir a exclusão agora. Entre em contato com o suporte do Kazaro informando que deseja encerrar a conta e o e-mail cadastrado.",
    };
  }

  const hasEmailProvider = (user.identities ?? []).some((i) => i.provider === "email");

  if (hasEmailProvider) {
    const pw = input.password?.trim() ?? "";
    if (pw.length < 6) {
      return { ok: false, message: "Informe sua senha atual (mín. 6 caracteres)." };
    }
    const { url, publishableKey } = getSupabaseEnv();
    const verify = createClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: signData, error: ve } = await verify.auth.signInWithPassword({
      email: user.email,
      password: pw,
    });
    if (ve || signData.user?.id !== user.id) {
      return { ok: false, message: "Senha incorreta." };
    }
  } else {
    const em = input.confirmationEmail?.trim().toLowerCase();
    if (!em || em !== user.email.toLowerCase()) {
      return { ok: false, message: "Digite seu e-mail completo, igual ao da conta, para confirmar." };
    }
  }

  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) {
    return { ok: false, message: delErr.message || "Não foi possível excluir a conta." };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}


