"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { updateMyProfessionalPublic } from "@/app/dashboard/configuracoes/actions";
import { ProFocusCategoriesChecklist } from "@/components/dashboard/ProFocusCategoriesChecklist";
import { normalizeFocusCategoryKeys, type ServiceCategoryKey } from "@/lib/services/category-catalog";

type Props = {
  initialDisplayName: string;
  initialServiceRegion: string;
  initialFocusCategoryKeys: string[];
};

export function ProfessionalPublicSettingsForm({
  initialDisplayName,
  initialServiceRegion,
  initialFocusCategoryKeys,
}: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [serviceRegion, setServiceRegion] = useState(initialServiceRegion);
  const [focusKeys, setFocusKeys] = useState<ServiceCategoryKey[]>(() =>
    normalizeFocusCategoryKeys(initialFocusCategoryKeys),
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  return (
    <form
      className="kz-prof-form"
      style={{ marginTop: 28, paddingTop: 28, borderTop: "1px solid var(--border)" }}
      onSubmit={async (e: FormEvent) => {
        e.preventDefault();
        setErr(null);
        setOk(null);
        setBusy(true);
        try {
          const res = await updateMyProfessionalPublic({
            displayName,
            serviceRegion,
            focusCategoryKeys: focusKeys,
          });
          if (!res.ok) {
            setErr(res.message);
            return;
          }
          setOk("Perfil público atualizado.");
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="kz-prof-head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kz-prof-title">Perfil de prestador</div>
          <div className="kz-prof-sub">Nome na vitrine e região em que você atende (aparecem na busca e no perfil).</div>
        </div>
      </div>

      <ProFocusCategoriesChecklist value={focusKeys} onChange={setFocusKeys} disabled={busy} />

      <div className="kz-prof-row kz-prof-grid">
        <label className="auth-field">
          <span className="auth-label">Nome no perfil público</span>
          <input
            className="auth-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            minLength={2}
            maxLength={120}
            required
            disabled={busy}
          />
        </label>
        <label className="auth-field">
          <span className="auth-label">Onde você atende</span>
          <input
            className="auth-input"
            value={serviceRegion}
            onChange={(e) => setServiceRegion(e.target.value)}
            placeholder="Ex.: Sul da ilha, Centro, Palhoça…"
            minLength={3}
            maxLength={200}
            required
            disabled={busy}
          />
        </label>
      </div>

      {err ? <p className="auth-error">{err}</p> : null}
      {ok ? <p className="auth-banner auth-banner--ok">{ok}</p> : null}

      <button type="submit" className="btn-cta auth-submit" disabled={busy}>
        {busy ? "Salvando…" : "Salvar perfil público"}
      </button>
    </form>
  );
}
