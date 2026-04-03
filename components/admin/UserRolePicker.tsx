"use client";

import { useState } from "react";
import { setUserRole } from "@/app/kz-staff-1/usuarios/actions";
import type { ProfileRole } from "@/lib/supabase/profile";

export function UserRolePicker({ userId, role }: { userId: string; role: ProfileRole }) {
  const [value, setValue] = useState<ProfileRole>(role);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "flex-end" }}>
      <select
        className="auth-input"
        style={{ width: 160, padding: "8px 10px" }}
        value={value}
        onChange={(e) => setValue(e.target.value as ProfileRole)}
        disabled={loading}
      >
        <option value="client">client</option>
        <option value="professional">professional</option>
        <option value="admin">admin</option>
      </select>
      <button
        type="button"
        className="kz-mini-btn kz-mini-btn--confirmed"
        disabled={loading}
        onClick={async () => {
          setErr(null);
          setLoading(true);
          try {
            const res = await setUserRole({ userId, role: value });
            if (!res.ok) setErr(res.message);
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? "…" : "Salvar"}
      </button>
      {err ? (
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--coral)" }} title={err}>
          erro
        </span>
      ) : null}
    </div>
  );
}

