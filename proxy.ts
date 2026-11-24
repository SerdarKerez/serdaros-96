/* Auth gate for /admin (layer 1). Refreshes the Supabase session cookie and redirects anonymous users to
   /admin/login. Layer 2: server-side admin check in app/admin + RLS in the database. */
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isLogin = path === "/admin/login";
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    if (isLogin) return response;
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() validates the JWT with Supabase Auth (getSession() alone would trust the cookie).
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !isLogin) {
    const url = new URL("/admin/login", request.url);
    if (path !== "/admin") url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  if (user && isLogin) return NextResponse.redirect(new URL("/admin", request.url));
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
