import { sendTextEmail } from "@/lib/email/resend";
import { getSiteUrl } from "@/lib/site";

function statusLabelPt(status: string): string {
  switch (status) {
    case "pending":
      return "Aguardando confirmação";
    case "confirmed":
      return "Confirmado";
    case "cancelled":
      return "Cancelado";
    case "completed":
      return "Concluído";
    default:
      return status;
  }
}

/**
 * Avisa o cliente por e-mail quando o status do agendamento muda (Resend opcional).
 */
export async function notifyClientOfBookingStatusChange(input: {
  to: string;
  status: string;
  serviceLabel: string;
  whenLabel: string;
  professionalName: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY?.trim()) return;

  const base = getSiteUrl();
  const historico = `${base}/dashboard/historico`;
  const statusPt = statusLabelPt(input.status);

  const text = [
    `Atualização do seu pedido no Kazaro`,
    "",
    `Serviço: ${input.serviceLabel}`,
    `Profissional: ${input.professionalName}`,
    `Quando: ${input.whenLabel}`,
    "",
    `Novo status: ${statusPt}`,
    "",
    `Acompanhe detalhes e converse pelo app (sem trocar telefone por aqui — use o chat do Kazaro):`,
    historico,
  ].join("\n");

  await sendTextEmail({
    to: input.to,
    subject: `Pedido ${statusPt.toLowerCase()} — ${input.serviceLabel.slice(0, 40)}${input.serviceLabel.length > 40 ? "…" : ""}`,
    text,
  });
}
