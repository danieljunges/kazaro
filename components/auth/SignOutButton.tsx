"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSignOut() {
    setLoading(true);
    let navigated = false;
    try {
      await getSupabaseBrowserClient().auth.signOut();
      navigated = true;
      router.replace("/?saiu=1");
      router.refresh();
    } finally {
      if (!navigated) setLoading(false);
    }
  }

  return (
    <button type="button" className="btn-ghost ds-signout" disabled={loading} onClick={onSignOut}>
      {loading ? "Saindo…" : "Sair da conta"}
    </button>
  );
}
