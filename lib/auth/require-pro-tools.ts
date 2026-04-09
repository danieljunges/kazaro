import { redirect } from "next/navigation";
import { fetchMyProfileRole } from "@/lib/supabase/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/** Páginas de prestador (serviços, ganhos, receita): só conta profissional ou admin. */
export async function requireProfessionalTools(nextPath: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect(`/entrar?next=${encodeURIComponent(nextPath)}`);
  const role = await fetchMyProfileRole(user.id);
  if (role === "professional" || role === "admin") return { user };
  redirect("/search");
}

