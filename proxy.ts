import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ACCESS_COOKIE = "filmshow_admin_access";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/admin/grant") &&
    !pathname.startsWith("/admin/grant/login")
  ) {
    const hasAccessCookie = Boolean(request.cookies.get(ADMIN_ACCESS_COOKIE)?.value);
    if (!hasAccessCookie) {
      return NextResponse.redirect(new URL("/admin/grant/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/grant/:path*"],
};
