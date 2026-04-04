"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createService } from "@/app/dashboard/servicos/actions";
import {
  SERVICE_CATEGORY_KEYS,
  type ServiceCategoryKey,
  SERVICE_CATEGORIES,
} from "@/lib/services/category-catalog";

function parsePriceToCentsBRL(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  const norm = s.replace(/\./g, "").replace(",", ".");
  const n = Number.parseFloat(norm);
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100);
}

type Props = {
  /** Categorias que já têm serviço pendente ou aprovado (não pode repetir). */
  occupiedCategoryKeys: ServiceCategoryKey[];
};

export function CreateServiceForm({ occupiedCategoryKeys }: Props) {
  const router = useRouter();
  const occupied = new Set(occupiedCategoryKeys);
  const [categoryKey, setCategoryKey] = useState<ServiceCategoryKey | "">("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    if (!categoryKey) {
      setErr("Selecione a área em que este serviço se enquadra.");
      return;
    }
    if (occupied.has(categoryKey)) {
      setErr("Você já cadastrou um serviço nesta área. Escolha outra categoria ou aguarde a análise do que já enviou.");
      return;
    }
    setLoading(true);
    try {
      const res = await createService({
        name,
        description,
        priceCents: parsePriceToCentsBRL(price),
        categoryKey,
      });
      if (!res.ok) {
        setErr(res.message);
        return;
      }
      setOk("Serviço enviado para análise. Assim que aprovado, aparece no seu perfil público.");
      setName("");
      setDescription("");
      setPrice("");
      setCategoryKey("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="kz-svc-form">
      <fieldset className="kz-svc-fieldset">
        <legend className="kz-svc-fieldset-legend">Área de atuação</legend>
        <p className="kz-svc-fieldset-hint">
          Escolha <strong>uma</strong> categoria por serviço — igual aos filtros da busca. Se você atua em mais de uma
          área (ex.: elétrica e limpeza), cadastre <strong>um serviço para cada</strong>.
        </p>
        {occupied.size >= SERVICE_CATEGORY_KEYS.length ? (
          <p className="auth-banner auth-banner--ok" style={{ margin: "0 0 14px" }}>
            Você já tem serviço cadastrado em todas as áreas disponíveis. Quando a moderação liberar ou encerrar algum,
            poderá ajustar por aqui.
          </p>
        ) : null}
        <div className="kz-svc-cat-grid" role="radiogroup" aria-label="Área de atuação do serviço">
          {SERVICE_CATEGORIES.map((c) => {
            const taken = occupied.has(c.key);
            return (
              <label
                key={c.key}
                className={`kz-svc-cat-opt${categoryKey === c.key ? " kz-svc-cat-opt--on" : ""}${taken ? " kz-svc-cat-opt--taken" : ""}`}
              >
                <input
                  type="radio"
                  name="category_key"
                  value={c.key}
                  checked={categoryKey === c.key}
                  onChange={() => setCategoryKey(c.key)}
                  disabled={loading || taken}
                />
                <span className="kz-svc-cat-opt-title">{c.label}</span>
                <span className="kz-svc-cat-opt-hint">{taken ? "Já cadastrado" : c.hint}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="kz-svc-grid">
        <label className="auth-field">
          <span className="auth-label">Nome do serviço</span>
          <input
            className="auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Troca de torneira, faxina pós-obra…"
            maxLength={80}
            required
          />
        </label>

        <label className="auth-field">
          <span className="auth-label">Preço sugerido (opcional)</span>
          <input
            className="auth-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ex: 120"
            inputMode="decimal"
          />
        </label>
      </div>

      <label className="auth-field">
        <span className="auth-label">Descrição (opcional)</span>
        <textarea
          className="auth-input booking-textarea"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explique o que está incluso, tempo médio, materiais…"
          maxLength={600}
        />
      </label>

      {err ? <p className="auth-error">{err}</p> : null}
      {ok ? <p className="auth-banner auth-banner--ok">{ok}</p> : null}

      <button type="submit" className="btn-cta auth-submit" disabled={loading}>
        {loading ? "Enviando…" : "Criar serviço"}
      </button>
    </form>
  );
}
