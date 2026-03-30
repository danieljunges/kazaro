"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSignOut() {
    setLoading(true);
    await getSupabaseBrowserClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" className="btn-ghost ds-signout" disabled={loading} onClick={onSignOut}>
      {loading ? "Saindo…" : "Sair da conta"}
    </button>
  );
}
