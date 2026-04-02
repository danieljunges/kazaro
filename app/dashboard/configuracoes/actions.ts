"use server";

import { revalidatePath } from "next/cache";
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

