/** Onde o serviço acontece (coluna `pro_services.attendance_mode`). */
export const SERVICE_ATTENDANCE_MODES = ["at_client", "at_venue", "both"] as const;
export type ServiceAttendanceMode = (typeof SERVICE_ATTENDANCE_MODES)[number];

export const SERVICE_ATTENDANCE_OPTIONS: readonly {
  value: ServiceAttendanceMode;
  title: string;
  hint: string;
}[] = [
  {
    value: "at_venue",
    title: "No meu espaço",
    hint: "Cliente vem ao salão, estúdio, barbearia ou consultório.",
  },
  {
    value: "at_client",
    title: "Vou até você",
    hint: "Deslocamento até o endereço do cliente.",
  },
  {
    value: "both",
    title: "Os dois",
    hint: "No agendamento, a pessoa escolhe: seu espaço ou deslocamento.",
  },
] as const;

export function isServiceAttendanceMode(s: string): s is ServiceAttendanceMode {
  return (SERVICE_ATTENDANCE_MODES as readonly string[]).includes(s);
}

/** Selo curto no perfil / lista. */
export function labelAttendanceShort(mode: ServiceAttendanceMode | string | null | undefined): string {
  if (mode === "at_client") return "Vou até você";
  if (mode === "at_venue") return "No meu espaço";
  if (mode === "both") return "Presencial ou deslocamento";
  return "";
}

/** Texto para ajuda no fluxo de agendamento. */
export function labelAttendanceBookingHint(mode: ServiceAttendanceMode): string {
  if (mode === "at_client") {
    return "Este serviço é feito no endereço que você informar abaixo.";
  }
  if (mode === "at_venue") {
    return "Este serviço é feito no espaço do profissional. Você não precisa informar endereço residencial; o local costuma ser combinado após a confirmação.";
  }
  return "Este profissional atende no próprio espaço ou pode ir até você. Escolha abaixo antes de preencher o endereço.";
}
