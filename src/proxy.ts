import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';

const API_AUTH_PATHS = ['/api/auth'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (/\.[^/]+$/.test(pathname)) {
    return NextResponse.next();
  }

  const isPublicPath = pathname === '/auth' || pathname.startsWith('/auth/');
  const isAuthAPI = API_AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isPublicPath || isAuthAPI) {
    const token = request.cookies.get('auth_token')?.value;
    const payload = token ? verifyToken(token) : null;

    if (payload && isPublicPath) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = verifyToken(token);

  if (!payload) {
    const loginUrl = new URL('/auth/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth_token');
    return response;
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.userId);
  response.headers.set('x-user-role', payload.role);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
