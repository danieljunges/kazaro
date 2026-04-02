import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ProposalRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  amount_cents: number;
  currency: string;
  title: string | null;
  description: string | null;
  status: "sent" | "accepted" | "declined" | "cancelled";
  created_at: string;
  updated_at: string;
};

export async function fetchConversationProposals(conversationId: string, limit = 30): Promise<ProposalRow[]> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("proposals")
      .select("id, conversation_id, sender_id, amount_cents, currency, title, description, status, created_at, updated_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (error || !data) return [];
    return data as ProposalRow[];
  } catch {
    return [];
  }
}

