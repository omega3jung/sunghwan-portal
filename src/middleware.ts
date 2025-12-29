// middleware.ts
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { ENVIRONMENT } from "@/lib/environment";
import { isPublicRoute } from "@/lib/routes";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // static / internal assets.
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  // Detect unsupported browsers.
  const ua = request.headers.get("user-agent")?.toLowerCase() ?? "";

  const isIE =
    ua.includes("trident") ||
    ua.includes("msie") ||
    ua.includes("windows nt 6.1; wow64; trident");

  if (isIE && !request.nextUrl.pathname.startsWith("/unsupported-browser")) {
    return NextResponse.redirect(new URL("/unsupported-browser", request.url));
  }

  // public route
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // login page
  if (pathname.startsWith(`${ENVIRONMENT.BASE_PATH}/login`)) {
    return NextResponse.next();
  }

  // Protects only HTML navigation requests
  const isDocumentNavigation =
    request.headers.get("sec-fetch-dest") === "document";

  if (!isDocumentNavigation) {
    return NextResponse.next();
  }

  // ⛔ Internal protected page movement is not blocked by middleware.
  const isProtectedRoot =
    pathname === `${ENVIRONMENT.BASE_PATH}` ||
    pathname === `${ENVIRONMENT.BASE_PATH}/`;

  if (!isProtectedRoot) {
    return NextResponse.next();
  }

  // ✅ JWT-based login check (v4 standard)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token?.accessToken) {
    return NextResponse.next();
  }

  if (token?.accessToken && pathname.startsWith("/login")) {
    redirect("/");
  }

  // ❌ Not logged in → login redirect
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = `${ENVIRONMENT.BASE_PATH}/login`;
  loginUrl.search = "";

  const targetPath = pathname.replace(ENVIRONMENT.BASE_PATH, "");
  if (targetPath && targetPath !== "/") {
    loginUrl.searchParams.set("r", targetPath);
  }

  searchParams.forEach((value, key) => {
    loginUrl.searchParams.append(key, value);
  });

  return NextResponse.redirect(loginUrl, {
    headers: { "Cache-Control": "no-store" },
  });
}

export const config = {
  matcher: ["/((?!api|_next|images|favicon.ico|login).*)", "/"],
};
