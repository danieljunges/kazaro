import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CompactNav } from "@/components/kazaro/CompactNav";
import { ConversationThread } from "@/components/messages/ConversationThread";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fetchConversationById, fetchConversationMessages } from "@/lib/supabase/messages";
import { fetchConversationProposals } from "@/lib/supabase/proposals";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect(`/entrar?next=/dashboard/mensagens/${id}`);

  const conv = await fetchConversationById(id);
  if (!conv) notFound();
  if (conv.client_id !== user.id && conv.professional_id !== user.id) notFound();

  const otherId = conv.client_id === user.id ? conv.professional_id : conv.client_id;
  const { data: otherProf } = await supabase.from("profiles").select("full_name").eq("id", otherId).maybeSingle();
  const otherName = (otherProf?.full_name as string | null)?.trim() || "Conversa";

  const msgs = await fetchConversationMessages(id, 120);
  const props = await fetchConversationProposals(id, 40);
  const isProfessionalViewer = conv.professional_id === user.id;

  return (
    <div className="home-editorial public-page">
      <CompactNav backHref="/dashboard/mensagens" backLabel="← Mensagens" />
      <div className="section">
        <div className="pro-page-card" style={{ maxWidth: 980 }}>
          <div className="dc-head" style={{ marginBottom: 12 }}>
            {otherName}
            <Link href="/dashboard/mensagens" className="dc-link">
              ← Mensagens
            </Link>
          </div>

          <ConversationThread
            conversationId={id}
            viewerId={user.id}
            isProfessionalViewer={isProfessionalViewer}
            initialMessages={msgs}
            initialProposals={props}
          />
        </div>
      </div>
    </div>
  );
}

