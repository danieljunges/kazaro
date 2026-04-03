"use server";

import { revalidatePath } from "next/cache";
import { adminPath } from "@/lib/admin/panel-path";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendTextEmail } from "@/lib/email/resend";

export async function reviewService(input: {
  serviceId: string;
  status: "approved" | "rejected";
  note: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin(adminPath("/servicos"));

  const id = input.serviceId.trim();
  const status = input.status;
  const note = input.note.trim().slice(0, 400);
  if (!id) return { ok: false, message: "Serviço inválido." };

  const supabase = await getSupabaseServerClient();

  // pega dados para notificação
  const { data: svc } = await supabase
    .from("pro_services")
    .select("id, name, professional_id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("pro_services")
    .update({ status, reviewed_at: new Date().toISOString(), reviewer_note: note || null })
    .eq("id", id);

  if (error) return { ok: false, message: error.message || "Não foi possível atualizar." };

  // email pro prestador (texto básico)
  try {
    const proId = (svc?.professional_id as string | undefined) ?? null;
    if (proId) {
      const { data: prof } = await supabase.from("profiles").select("email, full_name").eq("id", proId).maybeSingle();
      const to = (prof?.email as string | null)?.trim();
      if (to) {
        const who = ((prof?.full_name as string | null) ?? "").trim() || "Olá";
        const serviceName = ((svc?.name as string | null) ?? "").trim() || "seu serviço";
        const subject =
          status === "approved" ? "Seu serviço foi aprovado no Kazaro" : "Seu serviço foi revisado no Kazaro";
        const text = [
          `${who},`,
          "",
          status === "approved"
            ? `Boa notícia: "${serviceName}" foi aprovado e já pode aparecer no seu perfil.`
            : `Atualização: "${serviceName}" foi rejeitado na revisão.`,
          note ? "" : "",
          note ? `Nota do admin: ${note}` : "",
          "",
          "Abra o dashboard para ver os detalhes:",
          "https://kazaro.app/dashboard/servicos",
          "",
          "— Kazaro",
        ]
          .filter(Boolean)
          .join("\n");
        await sendTextEmail({ to, subject, text });
      }
    }
  } catch {
    // Não bloqueia a aprovação se o e-mail falhar
  }

  revalidatePath(adminPath("/servicos"));
  revalidatePath("/dashboard/servicos");
  revalidatePath("/search");
  return { ok: true };
}

