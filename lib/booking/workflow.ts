/** Estados do ciclo de vida de um agendamento (espelha o check constraint em `bookings.status`). */
export type BookingWorkflowStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "cancelled"
  | "completed"
  | "archived";

export const BOOKING_WORKFLOW_STATUSES: BookingWorkflowStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
  "cancelled",
  "completed",
  "archived",
];

export function isBookingWorkflowStatus(s: string): s is BookingWorkflowStatus {
  return (BOOKING_WORKFLOW_STATUSES as string[]).includes(s);
}

/** Rótulos curtos (tabelas, admin). */
export function bookingStatusLabelShort(status: string): string {
  switch (status) {
    case "pending":
      return "Pendente";
    case "confirmed":
      return "Confirmado";
    case "in_progress":
      return "Em andamento";
    case "cancelled":
      return "Cancelado";
    case "completed":
      return "Concluído";
    case "archived":
      return "Arquivado";
    default:
      return status;
  }
}

/** Rótulos para e-mail / histórico do cliente (mais explicativos). */
export function bookingStatusLabelLong(status: string): string {
  switch (status) {
    case "pending":
      return "Aguardando confirmação do profissional";
    case "confirmed":
      return "Confirmado, aguardando o horário combinado";
    case "in_progress":
      return "Profissional iniciou o serviço";
    case "cancelled":
      return "Cancelado";
    case "completed":
      return "Concluído";
    case "archived":
      return "Encerrado na lista do prestador (arquivado)";
    default:
      return status;
  }
}

/**
 * Transições que o profissional (ou admin via mesma action) pode aplicar.
 * Cliente não altera status aqui.
 */
export function canProTransitionBooking(from: string, to: BookingWorkflowStatus): boolean {
  switch (from) {
    case "pending":
      return to === "confirmed" || to === "cancelled" || to === "archived";
    case "confirmed":
      return to === "in_progress" || to === "cancelled" || to === "archived";
    case "in_progress":
      return to === "completed" || to === "cancelled" || to === "archived";
    case "completed":
    case "cancelled":
    case "archived":
      return false;
    default:
      return false;
  }
}
