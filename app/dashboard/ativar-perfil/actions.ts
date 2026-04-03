"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { displayNameToSlugBase, pickUniqueProfessionalSlug } from "@/lib/professional/slug";
import { fetchMyProfileRole } from "@/lib/supabase/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function normalizeTaxDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

function validateTaxId(digits: string): string | null {
  if (digits.length === 11 || digits.length === 14) return null;
  return "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.";
}

export async function activateProfessionalProfile(input: {
  displayName: string;
  serviceRegion: string;
  taxDocument: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, message: "Faça login para continuar." };

  const role = await fetchMyProfileRole(user.id);
  if (role !== "professional") {
    return { ok: false, message: "Esta etapa é só para contas de profissional." };
  }

  const { data: existing } = await supabase.from("professionals").select("id").eq("id", user.id).maybeSingle();
  if (existing) {
    redirect("/dashboard");
  }

  const display_name = input.displayName.trim().slice(0, 120);
  if (display_name.length < 2) {
    return { ok: false, message: "Informe seu nome ou nome público (mín. 2 caracteres)." };
  }

  const service_region = input.serviceRegion.trim().slice(0, 200);
  if (service_region.length < 3) {
    return { ok: false, message: "Descreva a região ou bairros em que você atende." };
  }

  const taxDigits = normalizeTaxDigits(input.taxDocument);
  const taxErr = validateTaxId(taxDigits);
  if (taxErr) return { ok: false, message: taxErr };

  const slugBase = displayNameToSlugBase(display_name);
  const slug = await pickUniqueProfessionalSlug(supabase, slugBase);

  const { error: privErr } = await supabase.from("professional_private").insert({
    id: user.id,
    tax_document: taxDigits,
  });
  if (privErr) {
    return { ok: false, message: privErr.message || "Não foi possível salvar os dados." };
  }

  const { error: proErr } = await supabase.from("professionals").insert({
    id: user.id,
    slug,
    display_name,
    service_region,
    city: "Florianópolis",
  });

  if (proErr) {
    await supabase.from("professional_private").delete().eq("id", user.id);
    return { ok: false, message: proErr.message || "Não foi possível criar o perfil público." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/servicos");
  revalidatePath("/search");
  redirect("/dashboard");
}
