"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createService } from "@/app/dashboard/servicos/actions";

function parsePriceToCentsBRL(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  // Accept: "120", "120,00", "120.50"
  const norm = s.replace(/\./g, "").replace(",", ".");
  const n = Number.parseFloat(norm);
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100);
}

export function CreateServiceForm() {
  const router = useRouter();
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
    setLoading(true);
    try {
      const res = await createService({
        name,
        description,
        priceCents: parsePriceToCentsBRL(price),
      });
      if (!res.ok) {
        setErr(res.message);
        return;
      }
      setOk("Serviço enviado para análise. Assim que aprovado, aparece no seu perfil público.");
      setName("");
      setDescription("");
      setPrice("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="kz-svc-form">
      <div className="kz-svc-grid">
        <label className="auth-field">
          <span className="auth-label">Nome do serviço</span>
          <input
            className="auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Troca de torneira, Instalação de luminária…"
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

