import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ENVIRONMENT } from '@/lib/environment';
import { isPublicRoute } from './lib/routes';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname, searchParams } = request.nextUrl;
  
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 로그인 상태면 그대로 진행
  if (token?.user) {
    return NextResponse.next();
  }

  // 로그인 페이지 접근은 허용
  if (pathname.startsWith(`${ENVIRONMENT.BASE_PATH}/login`)) {
    return NextResponse.next();
  }

  // 로그인 페이지로 리다이렉트
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = `${ENVIRONMENT.BASE_PATH}/login`;

  // 원래 가려던 경로 저장
  const targetPath = pathname.replace(ENVIRONMENT.BASE_PATH, '');
  if (targetPath && targetPath !== '/') {
    loginUrl.searchParams.set('r', targetPath);
  }

  // 기존 쿼리 유지
  searchParams.forEach((value, key) => {
    loginUrl.searchParams.append(key, value);
  });

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|images|login).*)',
    '/'
  ],
};
