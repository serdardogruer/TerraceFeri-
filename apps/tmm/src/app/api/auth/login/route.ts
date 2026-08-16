import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { coreDb } from '@modules/core/database/client';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production');

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'E-posta ve şifre gereklidir' }, { status: 400 });
    }

    let user: any = null;

    // 1. Veritabanından kullanıcı kontrolü
    try {
      user = await coreDb.user.findUnique({
        where: { email }
      });
    } catch (dbErr) {
      console.warn('Veritabanı kullanıcı sorgusu başarısız, fallback deneniyor:', dbErr);
    }

    // 2. Kullanıcı doğrulama (Veritabanı veya varsayılan admin)
    const isDbMatch = user && user.password === password && user.status === 'ACTIVE';
    const isDefaultAdmin = email === 'admin@terraceferi.com' && password === 'admin123';

    if (isDbMatch || isDefaultAdmin) {
      const userRole = user?.role || 'ADMIN';
      const userId = user?.id || 'default-admin-id';
      const userName = user?.name || 'Sistem Yöneticisi';

      const token = await new SignJWT({ 
        sub: userId, 
        email: email,
        name: userName,
        role: userRole
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);

      const response = NextResponse.json({ 
        success: true, 
        message: 'Giriş başarılı',
        user: {
          id: userId,
          email,
          name: userName,
          role: userRole
        }
      }, { status: 200 });
      
      response.cookies.set('tmm_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 gün
      });

      return response;
    }

    return NextResponse.json({ success: false, message: 'Geçersiz e-posta veya şifre' }, { status: 401 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
