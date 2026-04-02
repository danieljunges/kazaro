import { redirect } from "next/navigation";
import { ensureConversationForProSlug } from "@/lib/supabase/messages";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function NewConversationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const next = `/dashboard/mensagens/novo/${encodeURIComponent(slug)}`;
  if (!user?.id) redirect(`/entrar?next=${encodeURIComponent(next)}`);

  const id = await ensureConversationForProSlug(slug);
  if (!id) redirect("/dashboard/mensagens");
  redirect(`/dashboard/mensagens/${id}`);
}

