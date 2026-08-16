import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production');

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('tmm_token')?.value;

  // Basic route protection
  if (request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/resident') || 
      request.nextUrl.pathname.startsWith('/personnel')) {
    
    // Geliştirme ortamında (Local IP testlerinde) login'i es geçmek için
    // tüm blok devre dışı bırakıldı.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/resident/:path*', '/personnel/:path*'],
};
