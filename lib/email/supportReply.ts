import { sendTextEmail } from "@/lib/email/resend";
import { getSiteUrl } from "@/lib/site";

export async function notifyTicketOwnerOfAdminReply(input: {
  to: string;
  ticketSubject: string;
  replyPreview: string;
  ticketId: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!process.env.RESEND_API_KEY?.trim()) {
    return { ok: true };
  }

  const base = getSiteUrl();
  const link = `${base}/dashboard/suporte/${input.ticketId}`;
  const text = [
    `Nova resposta da equipe Kazaro no seu chamado: ${input.ticketSubject}`,
    "",
    input.replyPreview.slice(0, 2000),
    "",
    `Abrir conversa: ${link}`,
  ].join("\n");

  return sendTextEmail({
    to: input.to,
    subject: `Resposta no suporte: ${input.ticketSubject.slice(0, 60)}${input.ticketSubject.length > 60 ? "…" : ""}`,
    text,
  });
}
