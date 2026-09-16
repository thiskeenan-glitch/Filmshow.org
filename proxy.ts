import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/proxy";

const ADMIN_ACCESS_COOKIE = "filmshow_admin_access";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    (pathname.startsWith("/admin/grant") || pathname.startsWith("/admin/live")) &&
    !pathname.startsWith("/admin/grant/login")
  ) {
    const hasAccessCookie = Boolean(request.cookies.get(ADMIN_ACCESS_COOKIE)?.value);
    if (!hasAccessCookie) {
      const loginUrl = new URL("/admin/grant/login", request.url);
      loginUrl.searchParams.set("next", pathname.startsWith("/admin/live") ? "/admin/live" : "/admin/grant");
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/live")) {
    return updateSupabaseSession(request);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/admin/grant/:path*", "/admin/live/:path*", "/live/:path*"],
};
