import { NextRequest, NextResponse } from 'next/server';
import { coreDb } from '@modules/core/database/client';

export async function GET() {
  try {
    const users = await coreDb.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        permissions: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role = 'TECHNICAL', status = 'ACTIVE', permissions = [] } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'İsim, e-posta ve şifre zorunludur' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Check if user already exists
    const existing = await coreDb.user.findFirst({
      where: { email: cleanEmail }
    });

    if (existing) {
      return NextResponse.json({ success: false, message: 'Bu e-posta adresi zaten kullanımda' }, { status: 400 });
    }

    const newUser = await coreDb.user.create({
      data: {
        name: String(name).trim(),
        email: cleanEmail,
        password: String(password).trim(),
        role: role,
        status: status,
        permissions: permissions !== undefined ? permissions : [],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        permissions: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, password, role, status, permissions } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Kullanıcı ID gereklidir' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = String(name).trim();
    if (email) updateData.email = String(email).trim().toLowerCase();
    if (password && String(password).trim() !== '') updateData.password = String(password).trim();
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (permissions !== undefined) updateData.permissions = permissions;

    const updatedUser = await coreDb.user.update({
      where: { id },
      data: updateData,

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        permissions: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({ success: true, data: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Kullanıcı ID gereklidir' }, { status: 400 });
    }

    // Protect primary admin from deletion
    const user = await coreDb.user.findUnique({ where: { id } });
    if (user && user.email === 'serdardogruer@gmail.com') {
      return NextResponse.json({ success: false, message: 'Ana süper yönetici hesabı silinemez' }, { status: 403 });
    }

    await coreDb.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Kullanıcı başarıyla silindi' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
