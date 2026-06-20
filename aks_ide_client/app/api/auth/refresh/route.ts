import { NextRequest, NextResponse } from "next/server";

import { AUTH_SERVICE_URL } from "@/utils/constant";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get("redirect") || "/workspace";

  const cookies = request.headers.get("cookie") || "";

  try {
    const refreshResponse = await fetch(
      `${AUTH_SERVICE_URL}/api/v1/auth/oauth/refresh`,
      {
        method: "POST",
        headers: { Cookie: cookies },
      },
    );

    if (!refreshResponse.ok) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    const response = NextResponse.redirect(new URL(redirectTo, request.url));

    const setCookies =
      typeof refreshResponse.headers.getSetCookie === "function"
        ? refreshResponse.headers.getSetCookie()
        : ([refreshResponse.headers.get("set-cookie")].filter(
            Boolean,
          ) as string[]);

    for (const cookie of setCookies) {
      response.headers.append("Set-Cookie", cookie);
    }

    return response;
  } catch {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}
