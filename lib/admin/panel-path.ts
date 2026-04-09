/**
 * Painel interno em rota dedicada (não usar `/admin`; ver middleware).
 * Para mudar a URL: renomeie a pasta `app/kz-staff-1` e ajuste `ADMIN_PANEL_SEGMENT`.
 */
export const ADMIN_PANEL_SEGMENT = "kz-staff-1" as const;

export function getAdminPanelBasePath(): string {
  return `/${ADMIN_PANEL_SEGMENT}`;
}

/** Ex.: adminPath("/servicos") => "/kz-staff-1/servicos" */
export function adminPath(suffix = ""): string {
  const base = getAdminPanelBasePath();
  if (!suffix || suffix === "/") return base;
  const s = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return `${base}${s}`;
}

export function isUnderAdminPanelPath(pathname: string): boolean {
  const base = getAdminPanelBasePath();
  if (pathname === base) return true;
  return pathname.startsWith(`${base}/`);
}

/** `next` após login: só caminhos sob o painel admin. */
export function isSafeAdminNextRedirect(raw: string | null | undefined): raw is string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return false;
  return isUnderAdminPanelPath(raw);
}

export function safeAdminNextPath(raw: string | null): string {
  const base = getAdminPanelBasePath();
  if (!isSafeAdminNextRedirect(raw)) return base;
  return raw;
}
