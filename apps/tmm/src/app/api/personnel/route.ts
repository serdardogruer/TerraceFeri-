import { NextResponse } from 'next/server';
import { prismaPersonnel } from '../../../../modules/personnel/database/client';

export async function GET() {
  try {
    const personnel = await prismaPersonnel.personnel.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: 'asc' }
    });
    return NextResponse.json({ success: true, personnel });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.firstName || !data.lastName || !data.phone) {
      return NextResponse.json({ error: 'Ad, soyad ve telefon zorunludur.' }, { status: 400 });
    }

    const newPersonnel = await prismaPersonnel.personnel.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        tcNo: data.tcNo || null,
        shiftStartTime: data.shiftStartTime || '08:00',
        shiftEndTime: data.shiftEndTime || '18:00',
        status: 'ACTIVE',
      }
    });

    return NextResponse.json({ success: true, personnel: newPersonnel });

  } catch (error: any) {
    console.error('Error creating personnel:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Bu telefon numarası veya TC ile zaten bir kayıt var.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
