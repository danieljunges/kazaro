/** Feedback mínimo em login e cadastro (padrão comum em sites). */
export const AUTH_FLOW_MIN_MS = 700;

/** Logout: sem espera artificial — o utilizador percebia “sair duas vezes” com 700ms. */
export const AUTH_SIGNOUT_MIN_MS = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Garante que passou pelo menos `ms` desde `startedAt` (Date.now()). */
export async function ensureMinElapsedSince(startedAt: number, ms = AUTH_FLOW_MIN_MS): Promise<void> {
  const left = ms - (Date.now() - startedAt);
  if (left > 0) await sleep(left);
}
