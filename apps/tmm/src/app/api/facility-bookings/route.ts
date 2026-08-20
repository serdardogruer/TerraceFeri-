import { NextRequest, NextResponse } from 'next/server';
import { faultDb } from '../../../../modules/fault/database/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const facility = searchParams.get('facility');
    const dateStr = searchParams.get('date');

    const records = await faultDb.faultRecord.findMany({
      where: {
        deletedAt: null,
        recordType: 'TESIS_RANDEVU',
        ...(facility ? { title: facility } : {})
      },
      orderBy: { createdAt: 'desc' }
    });

    const bookings = records.map(r => {
      let extra: any = {};
      try {
        if (r.serviceReport) extra = JSON.parse(r.serviceReport);
      } catch (e) {}

      return {
        id: r.id,
        facility: r.title, // 'Havuz Kullanımı' | 'Sosyal Tesis'
        dateStr: extra.dateStr || r.faultDate.toISOString().split('T')[0],
        startTime: extra.startTime || '10:00',
        endTime: extra.endTime || '10:30',
        doorNo: extra.doorNo || r.description || 'Daire',
        residentName: r.reporterName || 'Sakin',
        residentCode: extra.residentCode || '',
        notes: extra.notes || r.resolutionNote || ''
      };
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    console.error('Error fetching facility bookings:', error);
    return NextResponse.json({ success: false, message: 'Veritabanı hatası: ' + (error?.message || String(error)) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.facility || !body.dateStr || !body.startTime || !body.endTime) {
      return NextResponse.json({ success: false, message: 'Tüm randevu alanları zorunludur.' }, { status: 400 });
    }

    // Çakışma Kontrolü (Aynı tesis, aynı gün, çakışan saat aralığı)
    const existingRecords = await faultDb.faultRecord.findMany({
      where: {
        deletedAt: null,
        recordType: 'TESIS_RANDEVU',
        title: body.facility
      }
    });

    const isConflict = existingRecords.some(r => {
      try {
        const extra = JSON.parse(r.serviceReport || '{}');
        if (extra.dateStr === body.dateStr) {
          // Saat çakışması kontrolü
          const startA = body.startTime;
          const endA = body.endTime;
          const startB = extra.startTime;
          const endB = extra.endTime;
          if (startA < endB && endA > startB) {
            return true;
          }
        }
      } catch (e) {}
      return false;
    });

    if (isConflict) {
      return NextResponse.json({ success: false, message: 'Bu saat aralığı başka bir sakin tarafından rezerve edilmiştir.' }, { status: 409 });
    }

    const newBooking = await faultDb.faultRecord.create({
      data: {
        title: body.facility,
        description: `Daire ${body.doorNo || ''}`,
        recordType: 'TESIS_RANDEVU',
        priority: 'Normal',
        status: 'Confirmed',
        reporterName: body.residentName || 'Sakin',
        faultDate: new Date(`${body.dateStr}T12:00:00.000Z`),
        serviceReport: JSON.stringify({
          facility: body.facility,
          dateStr: body.dateStr,
          startTime: body.startTime,
          endTime: body.endTime,
          doorNo: body.doorNo,
          residentName: body.residentName,
          residentCode: body.residentCode,
          notes: body.notes || ''
        })
      }
    });

    return NextResponse.json({ success: true, data: newBooking }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating facility booking:', error);
    return NextResponse.json({ success: false, message: 'Randevu kaydedilemedi: ' + (error?.message || String(error)) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const residentCode = searchParams.get('residentCode');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Randevu ID zorunludur.' }, { status: 400 });
    }

    const existing = await faultDb.faultRecord.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Randevu bulunamadı.' }, { status: 404 });
    }

    // Yetki kontrolü: Sadece randevuyu alan sakin silebilir
    if (residentCode) {
      try {
        const extra = JSON.parse(existing.serviceReport || '{}');
        if (extra.residentCode && extra.residentCode !== residentCode) {
          return NextResponse.json({ success: false, message: 'Başka bir dairenin randevusunu silemezsiniz.' }, { status: 403 });
        }
      } catch (e) {}
    }

    await faultDb.faultRecord.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Randevu iptal edildi.' });
  } catch (error: any) {
    console.error('Error deleting facility booking:', error);
    return NextResponse.json({ success: false, message: 'İptal işlemi başarısız: ' + (error?.message || String(error)) }, { status: 500 });
  }
}
