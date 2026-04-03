/** Feedback mínimo em login, logout e cadastro (padrão comum em sites). */
export const AUTH_FLOW_MIN_MS = 700;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Garante que passou pelo menos `ms` desde `startedAt` (Date.now()). */
export async function ensureMinElapsedSince(startedAt: number, ms = AUTH_FLOW_MIN_MS): Promise<void> {
  const left = ms - (Date.now() - startedAt);
  if (left > 0) await sleep(left);
}
