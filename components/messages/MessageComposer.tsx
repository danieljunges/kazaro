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
      <input
        className="kz-chat-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Digite sua mensagem…"
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

