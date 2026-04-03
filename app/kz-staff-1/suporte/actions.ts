"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminPath } from "@/lib/admin/panel-path";
import { notifyTicketOwnerOfAdminReply } from "@/lib/email/supportReply";
import { fetchMyProfileRole } from "@/lib/supabase/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function trimBody(s: string): string {
  const t = s.trim();
  if (t.length < 1 || t.length > 8000) return "";
  return t;
}

export async function adminReplySupportTicket(formData: FormData) {
  const ticketId = String(formData.get("ticket_id") ?? "").trim();
  const body = trimBody(String(formData.get("body") ?? ""));
  if (!ticketId || !body) redirect(`${adminPath(`/suporte/${ticketId}`)}?erro=validacao`);

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect(`/entrar?next=${encodeURIComponent(adminPath(`/suporte/${ticketId}`))}`);

  const role = await fetchMyProfileRole(user.id);
  if (role !== "admin") redirect("/entrar?requer=admin");

  const { data: ticket, error: te } = await supabase
    .from("support_tickets")
    .select("id, user_id, subject, status")
    .eq("id", ticketId)
    .maybeSingle();
  if (te || !ticket) redirect(`${adminPath("/suporte")}?erro=ticket`);

  const { error: ie } = await supabase.from("support_messages").insert({
    ticket_id: ticketId,
    author_id: user.id,
    author_role: "admin",
    body,
  });
  if (ie) redirect(`${adminPath(`/suporte/${ticketId}`)}?erro=enviar`);

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

  revalidatePath(adminPath(`/suporte/${ticketId}`));
  revalidatePath(adminPath("/suporte"));
  revalidatePath(`/dashboard/suporte/${ticketId}`);
  redirect(adminPath(`/suporte/${ticketId}`));
}

export async function adminCloseSupportTicket(formData: FormData) {
  const ticketId = String(formData.get("ticket_id") ?? "").trim();
  if (!ticketId) redirect(adminPath("/suporte"));

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect(`/entrar?next=${encodeURIComponent(adminPath("/suporte"))}`);

  const role = await fetchMyProfileRole(user.id);
  if (role !== "admin") redirect("/entrar?requer=admin");

  const { error } = await supabase.from("support_tickets").update({ status: "closed" }).eq("id", ticketId);
  if (error) redirect(`${adminPath(`/suporte/${ticketId}`)}?erro=fechar`);

  revalidatePath(adminPath(`/suporte/${ticketId}`));
  revalidatePath(adminPath("/suporte"));
  revalidatePath(`/dashboard/suporte/${ticketId}`);
  redirect(adminPath(`/suporte/${ticketId}`));
}
