"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function trimLen(s: string, min: number, max: number): string {
  const t = s.trim();
  if (t.length < min || t.length > max) return "";
  return t;
}

export async function createSupportTicket(formData: FormData) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/entrar?next=/dashboard/suporte");

  const subject = trimLen(String(formData.get("subject") ?? ""), 1, 200);
  const body = trimLen(String(formData.get("body") ?? ""), 1, 8000);
  if (!subject || !body) redirect("/dashboard/suporte?erro=validacao");

  const { data: ticket, error: te } = await supabase
    .from("support_tickets")
    .insert({ user_id: user.id, subject })
    .select("id")
    .single();
  if (te || !ticket?.id) redirect("/dashboard/suporte?erro=criar");

  const { error: me } = await supabase.from("support_messages").insert({
    ticket_id: ticket.id,
    author_id: user.id,
    author_role: "user",
    body,
  });
  if (me) redirect("/dashboard/suporte?erro=mensagem");

  revalidatePath("/dashboard/suporte");
  redirect(`/dashboard/suporte/${ticket.id}`);
}

export async function addUserSupportMessage(formData: FormData) {
  const ticketId = String(formData.get("ticket_id") ?? "").trim();
  const body = trimLen(String(formData.get("body") ?? ""), 1, 8000);
  if (!ticketId || !body) redirect(`/dashboard/suporte/${ticketId}?erro=validacao`);

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect(`/entrar?next=${encodeURIComponent(`/dashboard/suporte/${ticketId}`)}`);

  const { error } = await supabase.from("support_messages").insert({
    ticket_id: ticketId,
    author_id: user.id,
    author_role: "user",
    body,
  });
  if (error) redirect(`/dashboard/suporte/${ticketId}?erro=enviar`);

  revalidatePath(`/dashboard/suporte/${ticketId}`);
  revalidatePath("/dashboard/suporte");
  redirect(`/dashboard/suporte/${ticketId}`);
}

export async function closeMySupportTicket(formData: FormData) {
  const ticketId = String(formData.get("ticket_id") ?? "").trim();
  if (!ticketId) redirect("/dashboard/suporte");

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/entrar?next=/dashboard/suporte");

  const { error } = await supabase
    .from("support_tickets")
    .update({ status: "closed" })
    .eq("id", ticketId)
    .eq("user_id", user.id);
  if (error) redirect(`/dashboard/suporte/${ticketId}?erro=fechar`);

  revalidatePath(`/dashboard/suporte/${ticketId}`);
  revalidatePath("/dashboard/suporte");
  redirect(`/dashboard/suporte/${ticketId}`);
}
