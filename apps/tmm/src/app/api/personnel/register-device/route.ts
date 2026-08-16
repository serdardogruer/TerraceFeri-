import { NextResponse } from 'next/server';
import { prismaPersonnel } from '../../../../../modules/personnel/database/client';
// crypto.randomUUID natively available in Node/Web APIs

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ success: false, message: 'Telefon numarası gereklidir' }, { status: 400 });
    }

    // Numarayı temizle (boşlukları sil vb. basit temizlik)
    const cleanPhone = phone.replace(/\s+/g, '');

    // Veritabanında personeli bul
    const personnel = await prismaPersonnel.personnel.findUnique({
      where: { phone: cleanPhone }
    });

    if (!personnel) {
      return NextResponse.json({ 
        success: false, 
        message: 'Sistemde kayıtlı böyle bir telefon numarası bulunamadı. Lütfen yöneticinizle görüşün.' 
      }, { status: 404 });
    }

    if (personnel.status !== 'ACTIVE') {
      return NextResponse.json({ 
        success: false, 
        message: 'Personel kaydınız aktif değil.' 
      }, { status: 403 });
    }

    // Yeni cihaz kaydı oluştur
    const deviceId = crypto.randomUUID();
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    await prismaPersonnel.personnelDevice.create({
      data: {
        personnelId: personnel.id,
        deviceId,
        userAgent
      }
    });

    return NextResponse.json({ success: true, deviceId });

  } catch (error) {
    console.error('Device registration error:', error);
    return NextResponse.json({ success: false, message: 'Sunucu hatası' }, { status: 500 });
  }
}
