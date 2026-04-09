"use server";

import { revalidatePath } from "next/cache";
import { adminPath } from "@/lib/admin/panel-path";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { notifyProfessionalOfServiceReview } from "@/lib/email/serviceReviewNotify";
import { labelForCategoryKey } from "@/lib/services/category-catalog";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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
    .select("id, name, professional_id, category_key")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("pro_services")
    .update({ status, reviewed_at: new Date().toISOString(), reviewer_note: note || null })
    .eq("id", id);

  if (error) return { ok: false, message: error.message || "Não foi possível atualizar." };

  // E-mail ao prestador (Resend + HTML). E-mail: profiles.email ou, em fallback, auth.users via service role.
  try {
    const proId = (svc?.professional_id as string | undefined) ?? null;
    if (proId) {
      const { data: prof } = await supabase.from("profiles").select("email, full_name").eq("id", proId).maybeSingle();
      let to = (prof?.email as string | null)?.trim() || "";
      if (!to) {
        const admin = getSupabaseServiceRoleClient();
        if (admin) {
          const { data: u } = await admin.auth.admin.getUserById(proId);
          to = (u.user?.email ?? "").trim();
        }
      }
      if (to) {
        const who = ((prof?.full_name as string | null) ?? "").trim() || "Olá";
        const serviceName = ((svc?.name as string | null) ?? "").trim() || "seu serviço";
        const area = labelForCategoryKey((svc?.category_key as string | null) ?? undefined);
        await notifyProfessionalOfServiceReview({
          to,
          recipientName: who,
          serviceName,
          areaLabel: area,
          status,
          note: note || null,
        });
      }
    }
  } catch {
    // Não bloqueia a moderação se o e-mail falhar
  }

  revalidatePath(adminPath("/servicos"));
  revalidatePath("/dashboard/servicos");
  revalidatePath("/search");
  return { ok: true };
}

