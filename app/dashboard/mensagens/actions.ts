"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchConversationById } from "@/lib/supabase/messages";

export async function sendMessage(
  conversationId: string,
  body: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const text = body.trim().replace(/\s+/g, " ");
  if (!conversationId?.trim()) return { ok: false, message: "Conversa inválida." };
  if (text.length < 1) return { ok: false, message: "Digite uma mensagem." };
  if (text.length > 2000) return { ok: false, message: "Mensagem muito longa." };

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, message: "Faça login para enviar mensagens." };

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: text,
  });

  if (error) return { ok: false, message: error.message || "Não foi possível enviar." };

  revalidatePath("/dashboard/mensagens");
  revalidatePath(`/dashboard/mensagens/${conversationId}`);
  return { ok: true };
}

export async function sendProposal(
  conversationId: string,
  input: { amountCents: number; title?: string; description?: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!conversationId?.trim()) return { ok: false, message: "Conversa inválida." };
  if (!Number.isFinite(input.amountCents) || input.amountCents < 0) return { ok: false, message: "Valor inválido." };

  const title = (input.title ?? "").trim().slice(0, 120) || null;
  const description = (input.description ?? "").trim().slice(0, 1200) || null;

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, message: "Faça login para enviar proposta." };

  const conv = await fetchConversationById(conversationId);
  if (!conv) return { ok: false, message: "Conversa não encontrada." };
  if (conv.professional_id !== user.id) return { ok: false, message: "Só o prestador pode enviar proposta." };

  const { error } = await supabase.from("proposals").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    amount_cents: Math.round(input.amountCents),
    currency: "BRL",
    title,
    description,
    status: "sent",
  });
  if (error) return { ok: false, message: error.message || "Não foi possível enviar." };

  revalidatePath("/dashboard/mensagens");
  revalidatePath(`/dashboard/mensagens/${conversationId}`);
  return { ok: true };
}

export async function setProposalStatus(
  proposalId: string,
  status: "accepted" | "declined" | "cancelled",
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!proposalId?.trim()) return { ok: false, message: "Proposta inválida." };

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false, message: "Faça login para continuar." };

  const { data: p, error: pErr } = await supabase
    .from("proposals")
    .select("id, conversation_id, status")
    .eq("id", proposalId)
    .maybeSingle();
  if (pErr || !p?.id) return { ok: false, message: "Proposta não encontrada." };

  if ((p.status as string) !== "sent" && status !== "cancelled") {
    return { ok: false, message: "Essa proposta já foi finalizada." };
  }

  const { error } = await supabase.from("proposals").update({ status }).eq("id", proposalId);
  if (error) return { ok: false, message: error.message || "Não foi possível atualizar." };

  revalidatePath("/dashboard/mensagens");
  revalidatePath(`/dashboard/mensagens/${p.conversation_id as string}`);
  return { ok: true };
}

