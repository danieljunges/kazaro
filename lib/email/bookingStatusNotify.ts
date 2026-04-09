import { bookingStatusLabelLong } from "@/lib/booking/workflow";
import { sendTextEmail } from "@/lib/email/resend";
import { getSiteUrl } from "@/lib/site";

function emailSubjectLead(status: string): string {
  switch (status) {
    case "pending":
      return "Aguardando confirmação";
    case "confirmed":
      return "Confirmado";
    case "in_progress":
      return "Serviço iniciado";
    case "cancelled":
      return "Cancelado";
    case "completed":
      return "Concluído";
    case "archived":
      return "Pedido arquivado";
    default:
      return "Atualizado";
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
  const statusLong = bookingStatusLabelLong(input.status);
  const subjectLead = emailSubjectLead(input.status);

  const extra =
    input.status === "in_progress"
      ? [
          "",
          "O profissional marcou que já começou a execução do serviço (chegada no local ou início do trabalho).",
          "Se algo não bater com o combinado, use o chat do Kazaro na mesma conversa do pedido.",
        ]
      : input.status === "archived"
        ? [
            "",
            "O prestador arquivou este pedido na lista dele (organização interna). O registro continua no seu histórico.",
          ]
        : [""];

  const text = [
    `Atualização do seu pedido no Kazaro`,
    "",
    `Serviço: ${input.serviceLabel}`,
    `Profissional: ${input.professionalName}`,
    `Quando: ${input.whenLabel}`,
    "",
    `Situação: ${statusLong}`,
    ...extra,
    "",
    `Acompanhe o status e converse pelo app:`,
    historico,
  ].join("\n");

  await sendTextEmail({
    to: input.to,
    subject: `${subjectLead} · ${input.serviceLabel.slice(0, 40)}${input.serviceLabel.length > 40 ? "…" : ""}`,
    text,
  });
}
