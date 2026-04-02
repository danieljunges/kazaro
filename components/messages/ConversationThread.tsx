"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { MessageRow } from "@/lib/supabase/messages";
import type { ProposalRow } from "@/lib/supabase/proposals";
import { setProposalStatus } from "@/app/dashboard/mensagens/actions";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { ProposalComposer } from "@/components/messages/ProposalComposer";

function timeLong(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function moneyBRL(cents: number): string {
  const v = (cents || 0) / 100;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

type TimelineItem =
  | { kind: "msg"; created_at: string; id: string; sender_id: string; body: string }
  | {
      kind: "proposal";
      created_at: string;
      id: string;
      sender_id: string;
      amount_cents: number;
      title: string | null;
      description: string | null;
      status: ProposalRow["status"];
    };

export function ConversationThread({
  conversationId,
  viewerId,
  isProfessionalViewer,
  initialMessages,
  initialProposals,
}: {
  conversationId: string;
  viewerId: string;
  isProfessionalViewer: boolean;
  initialMessages: MessageRow[];
  initialProposals: ProposalRow[];
}) {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [proposals, setProposals] = useState<ProposalRow[]>(initialProposals);
  const [busyId, setBusyId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const timeline = useMemo(() => {
    const items: TimelineItem[] = [
      ...messages.map((m) => ({ kind: "msg" as const, ...m })),
      ...proposals.map((p) => ({
        kind: "proposal" as const,
        created_at: p.created_at,
        id: p.id,
        sender_id: p.sender_id,
        amount_cents: p.amount_cents,
        title: p.title ?? null,
        description: p.description ?? null,
        status: p.status,
      })),
    ];
    items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return items;
  }, [messages, proposals]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [timeline.length]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const ch = supabase
      .channel(`conv:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const row = payload.new as MessageRow;
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "proposals", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const row = payload.new as ProposalRow;
          setProposals((prev) => (prev.some((p) => p.id === row.id) ? prev : [...prev, row]));
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "proposals", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const row = payload.new as ProposalRow;
          setProposals((prev) => prev.map((p) => (p.id === row.id ? row : p)));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(ch);
    };
  }, [conversationId]);

  return (
    <div className="kz-chat">
      <div ref={scrollRef} className="kz-chat-scroll" aria-label="Mensagens">
        {timeline.length === 0 ? (
          <div className="kz-chat-empty">
            <div className="kz-msg-empty-title">Sem mensagens ainda</div>
            <div className="sec-sub" style={{ margin: 0 }}>
              Envie a primeira mensagem abaixo.
            </div>
          </div>
        ) : (
          timeline.map((it) => {
            const mine = it.sender_id === viewerId;
            if (it.kind === "msg") {
              return (
                <div key={it.id} className={`kz-bubble-row${mine ? " mine" : ""}`}>
                  <div className={`kz-bubble${mine ? " mine" : ""}`}>
                    <div className="kz-bubble-text">{it.body}</div>
                    <div className="kz-bubble-time">{timeLong(it.created_at)}</div>
                  </div>
                </div>
              );
            }

            const canClientDecide = !isProfessionalViewer && it.status === "sent";
            const canProCancel = isProfessionalViewer && it.status === "sent" && it.sender_id === viewerId;

            return (
              <div key={it.id} className={`kz-bubble-row${mine ? " mine" : ""}`}>
                <div className={`kz-prop-card${mine ? " mine" : ""}`}>
                  <div className="kz-prop-top">
                    <div className="kz-prop-badge">Proposta</div>
                    <div className={`kz-prop-status kz-prop-status--${it.status}`}>{it.status}</div>
                  </div>
                  <div className="kz-prop-price">{moneyBRL(it.amount_cents)}</div>
                  {it.title ? <div className="kz-prop-title">{it.title}</div> : null}
                  {it.description ? <div className="kz-prop-desc">{it.description}</div> : null}
                  <div className="kz-prop-foot">
                    <div className="kz-prop-time">{timeLong(it.created_at)}</div>
                    <div className="kz-prop-actions">
                      {canClientDecide ? (
                        <>
                          <button
                            type="button"
                            className="kz-mini-btn kz-mini-btn--confirmed"
                            disabled={busyId === it.id}
                            onClick={async () => {
                              setBusyId(it.id);
                              try {
                                await setProposalStatus(it.id, "accepted");
                              } finally {
                                setBusyId(null);
                              }
                            }}
                          >
                            Aceitar
                          </button>
                          <button
                            type="button"
                            className="kz-mini-btn kz-mini-btn--cancelled"
                            disabled={busyId === it.id}
                            onClick={async () => {
                              setBusyId(it.id);
                              try {
                                await setProposalStatus(it.id, "declined");
                              } finally {
                                setBusyId(null);
                              }
                            }}
                          >
                            Recusar
                          </button>
                        </>
                      ) : null}

                      {canProCancel ? (
                        <button
                          type="button"
                          className="kz-mini-btn kz-mini-btn--cancelled"
                          disabled={busyId === it.id}
                          onClick={async () => {
                            setBusyId(it.id);
                            try {
                              await setProposalStatus(it.id, "cancelled");
                            } finally {
                              setBusyId(null);
                            }
                          }}
                        >
                          Cancelar
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isProfessionalViewer ? <ProposalComposer conversationId={conversationId} /> : null}
      <MessageComposer conversationId={conversationId} />
    </div>
  );
}

