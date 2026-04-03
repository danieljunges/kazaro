import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseEnv } from "./env";

function withPathHeader(request: NextRequest): Headers {
  const h = new Headers(request.headers);
  h.set("x-kz-pathname", request.nextUrl.pathname);
  return h;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: withPathHeader(request) },
  });

  const { url, publishableKey } = getSupabaseEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request: { headers: withPathHeader(request) },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return supabaseResponse;
}
