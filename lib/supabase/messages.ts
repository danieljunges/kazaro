import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ConversationListRow = {
  id: string;
  professional_id: string;
  client_id: string;
  last_message_at: string;
  booking_id: string | null;
  other_email: string | null;
  other_name: string | null;
  last_preview: string | null;
};

export async function fetchMyConversations(userId: string, limit = 40): Promise<ConversationListRow[]> {
  try {
    const supabase = await getSupabaseServerClient();
    // Fetch conversations, then hydrate "other side" via profiles + last message via messages
    const { data: conv, error: cErr } = await supabase
      .from("conversations")
      .select("id, professional_id, client_id, booking_id, last_message_at")
      .or(`professional_id.eq.${userId},client_id.eq.${userId}`)
      .order("last_message_at", { ascending: false })
      .limit(limit);

    if (cErr || !conv) return [];
    const rows = conv as {
      id: string;
      professional_id: string;
      client_id: string;
      booking_id: string | null;
      last_message_at: string;
    }[];

    const otherIds = Array.from(
      new Set(
        rows.map((r) => (r.client_id === userId ? r.professional_id : r.client_id)).filter(Boolean),
      ),
    );

    const { data: prof } = otherIds.length
      ? await supabase.from("profiles").select("id, full_name").in("id", otherIds)
      : { data: [] as { id: string; full_name: string | null }[] };

    const nameById = new Map((prof ?? []).map((p) => [p.id, (p.full_name as string | null) ?? null]));

    // last message preview per conversation
    const previews = new Map<string, string>();
    for (const r of rows) {
      const { data: msg } = await supabase
        .from("messages")
        .select("body")
        .eq("conversation_id", r.id)
        .order("created_at", { ascending: false })
        .limit(1);
      const body = (msg?.[0]?.body as string | undefined)?.trim();
      if (body) previews.set(r.id, body);
    }

    return rows.map((r) => {
      const otherId = r.client_id === userId ? r.professional_id : r.client_id;
      return {
        ...r,
        other_email: null,
        other_name: nameById.get(otherId) ?? null,
        last_preview: previews.get(r.id) ?? null,
      };
    });
  } catch {
    return [];
  }
}

export type MessageRow = { id: string; sender_id: string; body: string; created_at: string };

export async function fetchConversationMessages(conversationId: string, limit = 80): Promise<MessageRow[]> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (error || !data) return [];
    return data as MessageRow[];
  } catch {
    return [];
  }
}

export async function fetchConversationById(conversationId: string): Promise<{
  id: string;
  professional_id: string;
  client_id: string;
  booking_id: string | null;
} | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("conversations")
      .select("id, professional_id, client_id, booking_id")
      .eq("id", conversationId)
      .maybeSingle();
    if (error || !data) return null;
    return data as { id: string; professional_id: string; client_id: string; booking_id: string | null };
  } catch {
    return null;
  }
}

export async function ensureConversationForProSlug(slug: string): Promise<string | null> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return null;

  const { data: pro, error: pErr } = await supabase.from("professionals").select("id").eq("slug", slug).maybeSingle();
  if (pErr || !pro?.id) return null;
  const professionalId = pro.id as string;
  if (professionalId === user.id) return null;

  // Upsert on unique pair (professional_id, client_id)
  const { data: conv, error: iErr } = await supabase
    .from("conversations")
    .upsert(
      { professional_id: professionalId, client_id: user.id },
      { onConflict: "professional_id,client_id" },
    )
    .select("id")
    .maybeSingle();

  if (iErr || !conv?.id) return null;
  return conv.id as string;
}

