import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { coreDb } from '@modules/core/database/client';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production');

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'E-posta/Kullanıcı adı ve şifre gereklidir' }, { status: 400 });
    }

    const cleanInput = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    let user: any = null;

    // 1. Veritabanından kullanıcı kontrolü (case-insensitive email)
    try {
      user = await coreDb.user.findFirst({
        where: {
          OR: [
            { email: { equals: cleanInput, mode: 'insensitive' } },
            { email: cleanInput }
          ]
        }
      });
    } catch (dbErr) {
      console.warn('Veritabanı kullanıcı sorgusu uyarısı:', dbErr);
    }

    // 2. Kullanıcı doğrulama (Veritabanı veya Tanımlı Süper Adminler)
    const isDbMatch = user && user.password === cleanPassword && user.status === 'ACTIVE';
    
    // Serdar Doğruer - Admin Girişi
    const isSerdarAdmin = (
      cleanInput === 'serdardogruer@gmail.com' ||
      cleanInput === 'serdar@terraceferi.com' ||
      cleanInput === 'serdar.dogruer@terraceferi.com' ||
      cleanInput === 'serdardogruer' ||
      cleanInput === 'serdar'
    ) && (cleanPassword === 'dgrr1213' || cleanPassword === 'Srdrdgrr1213.' || cleanPassword === 'admin123');

    // Standart Sistem Yöneticisi Girişi
    const isDefaultAdmin = (
      cleanInput === 'admin@terraceferi.com' ||
      cleanInput === 'admin'
    ) && (cleanPassword === 'dgrr1213' || cleanPassword === 'Srdrdgrr1213.' || cleanPassword === 'admin123');

    if (isDbMatch || isSerdarAdmin || isDefaultAdmin) {
      const userRole = user?.role || 'ADMIN';
      const userId = user?.id || (isSerdarAdmin ? 'usr-serdar-dogruer' : 'default-admin-id');
      const userName = user?.name || (isSerdarAdmin ? 'Serdar DOĞRUER' : 'Sistem Yöneticisi');
      const userEmail = user?.email || (isSerdarAdmin ? 'serdardogruer@gmail.com' : 'admin@terraceferi.com');

      const userPermissions = user?.permissions || (userRole === 'ADMIN' ? ['all'] : []);

      const token = await new SignJWT({ 
        sub: userId, 
        email: userEmail,
        name: userName,
        role: userRole,
        permissions: userPermissions
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
          email: userEmail,
          name: userName,
          role: userRole,
          permissions: userPermissions
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
