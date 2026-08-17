import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sadece /admin ve alt rotalarını koruma altına al
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('tmm_token')?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // Geçerli bir rol kontrolü
      if (!payload || !payload.role) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Yetkilendirme başarılı
      const response = NextResponse.next();
      response.headers.set('x-user-id', String(payload.sub || ''));
      response.headers.set('x-user-email', String(payload.email || ''));
      response.headers.set('x-user-role', String(payload.role || ''));
      return response;
    } catch (err) {
      console.warn('Middleware: JWT token doğrulanamadı:', err);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      // Geçersiz token çerezini temizle
      response.cookies.set('tmm_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
        expires: new Date(0)
      });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
  ],
};
