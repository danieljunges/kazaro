"use server";

import { revalidatePath } from "next/cache";
import { adminPath } from "@/lib/admin/panel-path";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/lib/supabase/profile";

export async function setUserRole(input: {
  userId: string;
  role: ProfileRole;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin(adminPath("/usuarios"));
  const userId = input.userId.trim();
  const role = input.role;
  if (!userId) return { ok: false, message: "Usuário inválido." };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { ok: false, message: error.message || "Não foi possível atualizar." };

  revalidatePath(adminPath("/usuarios"));
  revalidatePath("/dashboard");
  return { ok: true };
}

