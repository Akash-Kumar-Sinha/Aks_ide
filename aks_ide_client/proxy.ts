import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth/refresh")) {
    return NextResponse.next();
  }

  const isProtected =
    pathname.startsWith("/workspace") || pathname.startsWith("/profile");

  if (isProtected && !accessToken) {
    if (refreshToken) {
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      refreshUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(refreshUrl);
    }
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (pathname === "/auth" && accessToken) {
    return NextResponse.redirect(new URL("/workspace", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/workspace/:path*", "/profile/:path*", "/auth", "/api/auth/refresh"],
};
