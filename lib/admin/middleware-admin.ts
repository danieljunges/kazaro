import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getAdminPanelBasePath, isUnderAdminPanelPath } from "@/lib/admin/panel-path";
import { getSupabaseEnv } from "@/lib/supabase/env";

/** Bloqueia URLs antigas `/admin` (não expor painel nesse caminho). */
export function blockLegacyAdminPaths(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return new NextResponse(null, { status: 404 });
  }
  return null;
}

/**
 * Camada extra no edge: sessão válida + role admin antes de renderizar o painel.
 * (As páginas e server actions continuam com `requireAdmin`.)
 */
export async function enforceAdminPanelOnEdge(
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const base = getAdminPanelBasePath();
  if (!isUnderAdminPanelPath(pathname)) return response;

  const { url, publishableKey } = getSupabaseEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    const loginUrl = new URL("/entrar", request.url);
    const next = pathname + request.nextUrl.search;
    loginUrl.searchParams.set("next", next);
    loginUrl.searchParams.set("requer", "admin");
    return NextResponse.redirect(loginUrl);
  }

  const { data: prof, error } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (error || (prof?.role as string | undefined) !== "admin") {
    return NextResponse.redirect(new URL("/dashboard?admin=negado", request.url));
  }

  return response;
}
