"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const MAX_PORTFOLIO = 16;

function isAllowedPortfolioUrl(url: string): boolean {
  const t = url.trim();
  if (!t.startsWith("http")) return false;
  try {
    const { url: base } = getSupabaseEnv();
    const u = new URL(t);
    const b = new URL(base);
    if (u.host !== b.host) return false;
    return u.pathname.includes("/storage/v1/object/public/portfolio/");
  } catch {
    return false;
  }
}

export async function registerPortfolioPhoto(
  imageUrl: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const trimmed = imageUrl.trim();
  if (!isAllowedPortfolioUrl(trimmed)) {
    return { ok: false, message: "URL da imagem inválida." };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, message: "Faça login para continuar." };

  const { data: pro } = await supabase.from("professionals").select("slug").eq("id", user.id).maybeSingle();
  if (!pro?.slug) return { ok: false, message: "Ative seu perfil profissional primeiro." };

  const { count } = await supabase
    .from("pro_portfolio_photos")
    .select("id", { count: "exact", head: true })
    .eq("professional_id", user.id);

  if ((count ?? 0) >= MAX_PORTFOLIO) {
    return { ok: false, message: `No máximo ${MAX_PORTFOLIO} fotos no portfólio.` };
  }

  const { data: maxRow } = await supabase
    .from("pro_portfolio_photos")
    .select("sort_order")
    .eq("professional_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (typeof maxRow?.sort_order === "number" ? maxRow.sort_order : -1) + 1;

  const { error } = await supabase.from("pro_portfolio_photos").insert({
    professional_id: user.id,
    image_url: trimmed,
    sort_order: nextOrder,
  });

  if (error) return { ok: false, message: error.message || "Não foi possível salvar a foto." };

  revalidatePath(`/profissional/${pro.slug as string}`);
  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/");
  return { ok: true };
}

export async function deletePortfolioPhoto(
  photoId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const id = photoId.trim();
  if (!id) return { ok: false, message: "Foto inválida." };

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, message: "Faça login para continuar." };

  const { data: row } = await supabase
    .from("pro_portfolio_photos")
    .select("professional_id")
    .eq("id", id)
    .maybeSingle();

  if (!row || row.professional_id !== user.id) {
    return { ok: false, message: "Foto não encontrada." };
  }

  const { data: pro } = await supabase.from("professionals").select("slug").eq("id", user.id).maybeSingle();

  const { error } = await supabase.from("pro_portfolio_photos").delete().eq("id", id).eq("professional_id", user.id);
  if (error) return { ok: false, message: error.message || "Não foi possível remover." };

  if (pro?.slug) revalidatePath(`/profissional/${pro.slug as string}`);
  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/");
  return { ok: true };
}
