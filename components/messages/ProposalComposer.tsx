"use client";

import { FormEvent, useMemo, useState } from "react";
import { sendProposal } from "@/app/dashboard/mensagens/actions";

export function ProposalComposer({ conversationId }: { conversationId: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const amountCents = useMemo(() => {
    const norm = amount.replace(/[^\d,\.]/g, "").replace(",", ".");
    const v = Number(norm);
    if (!Number.isFinite(v)) return null;
    return Math.round(v * 100);
  }, [amount]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    if (amountCents === null) {
      setErr("Informe um valor.");
      return;
    }
    setBusy(true);
    try {
      const res = await sendProposal(conversationId, {
        amountCents,
        title,
        description: desc,
      });
      if (!res.ok) {
        setErr(res.message);
        return;
      }
      setOk("Proposta enviada.");
      setOpen(false);
      setAmount("");
      setTitle("");
      setDesc("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="kz-prop-compose">
      <button type="button" className="kz-prop-btn" onClick={() => setOpen((v) => !v)} disabled={busy}>
        {open ? "Fechar proposta" : "Enviar proposta"}
      </button>

      {open ? (
        <form className="kz-prop-panel" onSubmit={onSubmit}>
          <div className="kz-prop-grid">
            <label className="auth-field">
              <span className="auth-label">Valor (R$)</span>
              <input
                className="auth-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 150"
                disabled={busy}
              />
            </label>
            <label className="auth-field">
              <span className="auth-label">Título (opcional)</span>
              <input
                className="auth-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Instalação + material"
                maxLength={120}
                disabled={busy}
              />
            </label>
          </div>

          <label className="auth-field">
            <span className="auth-label">Detalhes (opcional)</span>
            <textarea
              className="auth-input"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Descreva o que está incluso, prazo, adicionais…"
              maxLength={1200}
              disabled={busy}
              style={{ minHeight: 90, resize: "vertical" }}
            />
          </label>

          {err ? <div className="kz-prop-err">{err}</div> : null}
          {ok ? <div className="kz-prop-ok">{ok}</div> : null}

          <button type="submit" className="kz-prop-send" disabled={busy}>
            {busy ? "Enviando…" : "Enviar proposta"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

