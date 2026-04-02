"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function reviewService(input: {
  serviceId: string;
  status: "approved" | "rejected";
  note: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin("/admin/servicos");

  const id = input.serviceId.trim();
  const status = input.status;
  const note = input.note.trim().slice(0, 400);
  if (!id) return { ok: false, message: "Serviço inválido." };

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("pro_services")
    .update({ status, reviewed_at: new Date().toISOString(), reviewer_note: note || null })
    .eq("id", id);

  if (error) return { ok: false, message: error.message || "Não foi possível atualizar." };

  revalidatePath("/admin/servicos");
  revalidatePath("/dashboard/servicos");
  revalidatePath("/search");
  return { ok: true };
}

