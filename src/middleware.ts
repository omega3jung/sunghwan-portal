// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ENVIRONMENT } from "@/lib/environment";
import { isPublicRoute } from "@/lib/routes";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 정적 파일
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  // public route
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // login page
  if (pathname.startsWith(`${ENVIRONMENT.BASE_PATH}/login`)) {
    return NextResponse.next();
  }

  // HTML navigation만 보호
  const accept = request.headers.get("accept") || "";
  if (!accept.includes("text/html")) {
    return NextResponse.next();
  }

  // ✅ JWT 기준 로그인 체크 (v4 정석)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token?.accessToken) {
    return NextResponse.next();
  }

  // ❌ 비로그인 → login redirect
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
};

export const config = {
  matcher: ["/((?!api|_next|images|favicon.ico|login).*)"],
};
