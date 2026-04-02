"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function createService(input: {
  name: string;
  description: string;
  priceCents: number | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const name = input.name.trim();
  const description = input.description.trim();
  const priceCents = input.priceCents;

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
  });
  if (insErr) return { ok: false, message: insErr.message || "Não foi possível criar o serviço." };

  revalidatePath("/dashboard/servicos");
  revalidatePath("/dashboard");
  return { ok: true };
}

