"use client";

import { FormEvent, useState } from "react";
import { activateProfessionalProfile } from "@/app/dashboard/ativar-perfil/actions";
import { ProFocusCategoriesChecklist } from "@/components/dashboard/ProFocusCategoriesChecklist";
import { SERVICE_CATEGORIES, type ServiceCategoryKey } from "@/lib/services/category-catalog";

type Props = {
  initialDisplayName: string;
};

export function ActivateProfessionalForm({ initialDisplayName }: Props) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [serviceRegion, setServiceRegion] = useState("");
  const [taxDocument, setTaxDocument] = useState("");
  const [focusKeys, setFocusKeys] = useState<ServiceCategoryKey[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await activateProfessionalProfile({
      displayName,
      serviceRegion,
      taxDocument,
      focusCategoryKeys: focusKeys,
    });
    setBusy(false);
    if (!res.ok) setError(res.message);
  }

  return (
    <form className="auth-form auth-form--activate" onSubmit={onSubmit}>
      <p className="sec-sub auth-flow-intro">
        Essas informações definem como você aparece na busca e registram seu documento para uso interno do Kazaro (não
        aparece no perfil público). Em &quot;Meus serviços&quot;, cada serviço também escolhe{" "}
        <strong>uma dessas mesmas áreas</strong>: {SERVICE_CATEGORIES.map((c) => c.label).join(", ")}.
      </p>

      <ProFocusCategoriesChecklist value={focusKeys} onChange={setFocusKeys} disabled={busy} />

      <label className="auth-field">
        <span className="auth-label">Nome no perfil público</span>
        <input
          className="auth-input"
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(ev) => setDisplayName(ev.target.value)}
          placeholder="Como os clientes vão ver seu nome"
          disabled={busy}
          required
          minLength={2}
          maxLength={120}
        />
      </label>

      <label className="auth-field">
        <span className="auth-label">Região em que atende</span>
        <input
          className="auth-input"
          type="text"
          value={serviceRegion}
          onChange={(ev) => setServiceRegion(ev.target.value)}
          placeholder="Ex.: Sul da ilha, Centro, Palhoça…"
          disabled={busy}
          required
          minLength={3}
          maxLength={200}
        />
      </label>

      <label className="auth-field">
        <span className="auth-label">CPF ou CNPJ</span>
        <input
          className="auth-input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={taxDocument}
          onChange={(ev) => setTaxDocument(ev.target.value)}
          placeholder="Somente números ou com pontuação"
          disabled={busy}
          required
        />
      </label>

      {error ? <p className="auth-error">{error}</p> : null}

      <button type="submit" className="btn-cta auth-submit" disabled={busy}>
        {busy ? "Ativando…" : "Ativar meu perfil"}
      </button>
    </form>
  );
}
