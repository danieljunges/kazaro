"use server";

import { revalidatePath } from "next/cache";
import { isServiceCategoryKey } from "@/lib/services/category-catalog";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function createService(input: {
  name: string;
  description: string;
  priceCents: number | null;
  categoryKey: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const name = input.name.trim();
  const description = input.description.trim();
  const priceCents = input.priceCents;
  const categoryKey = input.categoryKey.trim();

  if (!isServiceCategoryKey(categoryKey)) {
    return { ok: false, message: "Escolha em que área este serviço se enquadra." };
  }
  if (name.length < 3) return { ok: false, message: "Dê um nome com pelo menos 3 caracteres." };
  if (name.length > 80) return { ok: false, message: "Nome muito longo." };
  if (description.length > 600) return { ok: false, message: "Descrição muito longa." };
  if (priceCents != null && (!Number.isFinite(priceCents) || priceCents < 0 || priceCents > 50_000_00))
    return { ok: false, message: "Preço inválido." };

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
    status: "pending",
    category_key: categoryKey,
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
