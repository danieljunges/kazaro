"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notifyTicketOwnerOfAdminReply } from "@/lib/email/supportReply";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchMyProfileRole } from "@/lib/supabase/profile";

function trimBody(s: string): string {
  const t = s.trim();
  if (t.length < 1 || t.length > 8000) return "";
  return t;
}

export async function adminReplySupportTicket(formData: FormData) {
  const ticketId = String(formData.get("ticket_id") ?? "").trim();
  const body = trimBody(String(formData.get("body") ?? ""));
  if (!ticketId || !body) redirect(`/admin/suporte/${ticketId}?erro=validacao`);

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect(`/entrar?next=${encodeURIComponent(`/admin/suporte/${ticketId}`)}`);

  const role = await fetchMyProfileRole(user.id);
  if (role !== "admin") redirect("/entrar?requer=admin");

  const { data: ticket, error: te } = await supabase
    .from("support_tickets")
    .select("id, user_id, subject, status")
    .eq("id", ticketId)
    .maybeSingle();
  if (te || !ticket) redirect("/admin/suporte?erro=ticket");

  const { error: ie } = await supabase.from("support_messages").insert({
    ticket_id: ticketId,
    author_id: user.id,
    author_role: "admin",
    body,
  });
  if (ie) redirect(`/admin/suporte/${ticketId}?erro=enviar`);

  const { data: owner } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", ticket.user_id as string)
    .maybeSingle();

  const to = (owner?.email as string | null | undefined)?.trim();
  if (to) {
    await notifyTicketOwnerOfAdminReply({
      to,
      ticketSubject: String(ticket.subject),
      replyPreview: body,
      ticketId,
    });
  }

  revalidatePath(`/admin/suporte/${ticketId}`);
  revalidatePath("/admin/suporte");
  revalidatePath(`/dashboard/suporte/${ticketId}`);
  redirect(`/admin/suporte/${ticketId}`);
}

export async function adminCloseSupportTicket(formData: FormData) {
  const ticketId = String(formData.get("ticket_id") ?? "").trim();
  if (!ticketId) redirect("/admin/suporte");

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/entrar?next=/admin/suporte");

  const role = await fetchMyProfileRole(user.id);
  if (role !== "admin") redirect("/entrar?requer=admin");

  const { error } = await supabase.from("support_tickets").update({ status: "closed" }).eq("id", ticketId);
  if (error) redirect(`/admin/suporte/${ticketId}?erro=fechar`);

  revalidatePath(`/admin/suporte/${ticketId}`);
  revalidatePath("/admin/suporte");
  revalidatePath(`/dashboard/suporte/${ticketId}`);
  redirect(`/admin/suporte/${ticketId}`);
}
