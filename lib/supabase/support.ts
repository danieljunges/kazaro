import { getSupabaseServerClient } from "@/lib/supabase/server";

export type SupportTicketRow = {
  id: string;
  user_id: string;
  subject: string;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
};

export type SupportMessageRow = {
  id: string;
  ticket_id: string;
  author_id: string | null;
  author_role: "user" | "admin";
  body: string;
  created_at: string;
};

export async function fetchMySupportTickets(userId: string): Promise<SupportTicketRow[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .select("id, user_id, subject, status, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as SupportTicketRow[];
}

export async function fetchSupportTicketForUser(
  ticketId: string,
  userId: string,
): Promise<SupportTicketRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .select("id, user_id, subject, status, created_at, updated_at")
    .eq("id", ticketId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as SupportTicketRow | null) ?? null;
}

export async function fetchSupportMessages(ticketId: string): Promise<SupportMessageRow[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("support_messages")
    .select("id, ticket_id, author_id, author_role, body, created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as SupportMessageRow[];
}

export type AdminSupportTicketListItem = SupportTicketRow & {
  owner_email: string | null;
  owner_name: string | null;
};

export async function fetchAllSupportTicketsForAdmin(): Promise<AdminSupportTicketListItem[]> {
  const supabase = await getSupabaseServerClient();
  const { data: tickets, error } = await supabase
    .from("support_tickets")
    .select("id, user_id, subject, status, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (tickets ?? []) as SupportTicketRow[];
  if (rows.length === 0) return [];

  const ids = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles, error: pe } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", ids);
  if (pe) throw new Error(pe.message);
  const byId = new Map(
    (profiles ?? []).map((p: { id: string; email: string | null; full_name: string | null }) => [
      p.id,
      { email: p.email ?? null, full_name: p.full_name ?? null },
    ]),
  );

  return rows.map((t) => {
    const o = byId.get(t.user_id);
    return {
      ...t,
      owner_email: o?.email ?? null,
      owner_name: o?.full_name ?? null,
    };
  });
}

export async function fetchSupportTicketByIdAdmin(ticketId: string): Promise<SupportTicketRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .select("id, user_id, subject, status, created_at, updated_at")
    .eq("id", ticketId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as SupportTicketRow | null) ?? null;
}
