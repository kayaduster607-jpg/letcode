import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'hot100_session';
const PROTECTED_PREFIXES = ['/', '/learn', '/problem', '/wrong-book', '/admin'];

function isProtectedPath(pathname: string) {
  if (pathname === '/') return true;
  return PROTECTED_PREFIXES.some((prefix) => prefix !== '/' && (pathname === prefix || pathname.startsWith(`${prefix}/`)));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (hasSession) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.search = '';
  if (pathname !== '/') {
    loginUrl.searchParams.set('next', `${pathname}${search}`);
  }

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/', '/learn/:path*', '/problem/:path*', '/wrong-book/:path*', '/admin/:path*'],
};
