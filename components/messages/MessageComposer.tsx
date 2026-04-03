"use client";

import { FormEvent, useState } from "react";
import { sendMessage } from "@/app/dashboard/mensagens/actions";

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await sendMessage(conversationId, text);
      if (!res.ok) {
        setErr(res.message);
        return;
      }
      setText("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="kz-chat-compose" onSubmit={onSubmit}>
      <p className="kz-chat-policy" role="note">
        Combine horário, endereço e chegada por aqui. Por segurança e mediação, evite passar telefone ou dados fora do
        Kazaro — o time pode monitorar conversas para proteger clientes e profissionais.
      </p>
      <input
        className="kz-chat-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ex.: estou chegando, estou na portaria…"
        maxLength={2000}
      />
      <button type="submit" className="kz-chat-send" disabled={loading}>
        {loading ? "…" : "Enviar"}
      </button>
      {err ? (
        <div className="kz-chat-error" role="status" aria-live="polite">
          {err}
        </div>
      ) : null}
    </form>
  );
}

