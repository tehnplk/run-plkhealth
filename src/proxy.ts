import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const proxy = auth((request) => {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/upload/login";

  if (isLoginPage) {
    return request.auth
      ? NextResponse.redirect(new URL("/upload", request.nextUrl))
      : NextResponse.next();
  }

  if (!request.auth) {
    if (pathname.startsWith("/api/upload")) {
      return Response.json({ error: "Authentication required." }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/upload/login", request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/upload/:path*", "/api/upload/:path*"],
};
