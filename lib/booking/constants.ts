/** Horários sugeridos (America/São Paulo) — mesmo conceito da vitrine. */
export const BOOKING_TIME_OPTIONS = ["09:00", "11:00", "14:00", "16:00"] as const;

export type BookingTimeOption = (typeof BOOKING_TIME_OPTIONS)[number];
