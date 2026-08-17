import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Çıkış yapıldı' });
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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const response = NextResponse.redirect(new URL('/login', url.origin));
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
