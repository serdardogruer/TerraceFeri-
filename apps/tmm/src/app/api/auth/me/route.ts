import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { coreDb } from '@modules/core/database/client';
import { parseUserPermissions, SUPER_ADMIN_PERMISSIONS } from '@/lib/permissions';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production'
);

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('tmm_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Giriş yapılmamış' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = String(payload.sub || '');
    const userEmail = String(payload.email || '');

    // Fetch up-to-date user from database
    let user = null;
    if (userId) {
      user = await coreDb.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          permissions: true,
        }
      });
    }

    if (!user && userEmail) {
      user = await coreDb.user.findFirst({
        where: { email: userEmail },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          permissions: true,
        }
      });
    }

    // Fallback
    if (!user) {
      user = {
        id: userId || 'admin-id',
        name: String(payload.name || 'Yönetici'),
        email: userEmail,
        role: String(payload.role || 'ADMIN'),
        status: 'ACTIVE',
        permissions: payload.permissions || null,
      };
    }

    const isSuperAdmin = user.email === 'serdardogruer@gmail.com' || user.role === 'SUPER_ADMIN';
    const permissions = parseUserPermissions(user.permissions, isSuperAdmin);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: isSuperAdmin ? 'SUPER_ADMIN' : user.role,
        status: user.status,
        permissions: permissions,
      }
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 401 });
  }
}
