"use client";

import { useState } from "react";
import { AUTH_SIGNOUT_MIN_MS, ensureMinElapsedSince } from "@/lib/auth/auth-ui-timing";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);

  async function onSignOut() {
    setLoading(true);
    let navigated = false;
    const t0 = Date.now();
    try {
      await getSupabaseBrowserClient().auth.signOut();
      await ensureMinElapsedSince(t0, AUTH_SIGNOUT_MIN_MS);
      navigated = true;
      window.location.assign("/?saiu=1");
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
