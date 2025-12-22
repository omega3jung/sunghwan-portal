import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ENVIRONMENT } from "@/lib/environment";
import { isPublicRoute } from "./lib/routes";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 정적 파일 / 내부 요청 통과
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  // ✅ public route는 무조건 통과
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // ✅ login 페이지는 무조건 통과
  if (pathname.startsWith(`${ENVIRONMENT.BASE_PATH}/login`)) {
    return NextResponse.next();
  }

  // 🔥 HTML navigation만 보호
  const accept = request.headers.get("accept") || "";
  if (!accept.includes("text/html")) {
    return NextResponse.next();
  }

  // ✅ 로그인 상태면 통과 (JWT 기준)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token?.access_token) {
    return NextResponse.next();
  }

  // ❌ 여기부터는 "비로그인 + 보호 페이지"
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = `${ENVIRONMENT.BASE_PATH}/login`;
  loginUrl.search = "";

  const targetPath = pathname.replace(ENVIRONMENT.BASE_PATH, "");
  if (targetPath && targetPath !== "/") {
    loginUrl.searchParams.set("r", targetPath);
  }

  // 기존 쿼리 유지
  searchParams.forEach((value, key) => {
    loginUrl.searchParams.append(key, value);
  });

  return NextResponse.redirect(loginUrl, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export const config = {
  matcher: ["/((?!api|_next|images|favicon.ico|login).*)"],
};
