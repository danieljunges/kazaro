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


