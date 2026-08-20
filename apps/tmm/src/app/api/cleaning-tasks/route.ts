import { NextRequest, NextResponse } from 'next/server';
import { faultDb } from '../../../../modules/fault/database/client';

const DEFAULT_ROUTINES = [
  { code: 'RUT-01', title: 'A Blok Çöp Toplama (Sabah Turu)', area: 'A Blok (Kat 1 - Kat 8)', period: 'SABAH', priority: 'Önemli' },
  { code: 'RUT-02', title: 'B Blok Çöp Toplama (Sabah Turu)', area: 'B Blok (Kat 1 - Kat 8)', period: 'SABAH', priority: 'Önemli' },
  { code: 'RUT-03', title: 'Lobi & Ana Giriş Zemin Paspaslama', area: 'Ana Giriş & Danışma', period: 'SABAH', priority: 'Rutin' },
  { code: 'RUT-04', title: 'Lobi & Giriş Kapısı Cam Temizliği', area: 'Giriş Camları & Turnikeler', period: 'SABAH', priority: 'Rutin' },
  { code: 'RUT-05', title: 'A Blok Kat Koridorları Paspaslama', area: 'A Blok Kat Koridorları', period: 'ÖĞLE', priority: 'Rutin' },
  { code: 'RUT-06', title: 'B Blok Kat Koridorları Paspaslama', area: 'B Blok Kat Koridorları', period: 'ÖĞLE', priority: 'Rutin' },
  { code: 'RUT-07', title: 'Asansör Kabin & Ayna Hijyen Temizliği', area: 'A & B Blok 4 Asansör', period: 'ÖĞLE', priority: 'Önemli' },
  { code: 'RUT-08', title: 'Sosyal Tesis & Spor Salonu Dezenfeksiyonu', area: 'Sosyal Tesis & Soyunma Odaları', period: 'GÜN BOYU', priority: 'Rutin' },
  { code: 'RUT-09', title: 'A & B Blok Çöp Toplama (Akşam Turu)', area: 'Tüm Bloklar', period: 'AKŞAM', priority: 'Önemli' }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateQuery = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const startOfDay = new Date(`${dateQuery}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateQuery}T23:59:59.999Z`);

    // Seçilen güne ait temizlik kayıtlarını veritabanından çek
    let records = await faultDb.faultRecord.findMany({
      where: {
        deletedAt: null,
        recordType: { in: ['TEMIZLIK_RUTIN', 'TEMIZLIK_EKSTRA'] },
        faultDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Eğer bugün için henüz rutinler veritabanına yazılmamışsa, otomatik başlat
    if (records.length === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (dateQuery === todayStr) {
        for (const routine of DEFAULT_ROUTINES) {
          await faultDb.faultRecord.create({
            data: {
              title: routine.title,
              description: routine.area,
              recordType: 'TEMIZLIK_RUTIN',
              priority: routine.priority,
              status: 'Pending',
              faultDate: new Date(),
              serviceReport: JSON.stringify({
                code: routine.code,
                area: routine.area,
                period: routine.period,
                notes: ''
              })
            }
          });
        }

        records = await faultDb.faultRecord.findMany({
          where: {
            deletedAt: null,
            recordType: { in: ['TEMIZLIK_RUTIN', 'TEMIZLIK_EKSTRA'] },
            faultDate: {
              gte: startOfDay,
              lte: endOfDay
            }
          },
          orderBy: { createdAt: 'asc' }
        });
      }
    }

    // Formatlayıp frontend'e ilet
    const formatted = records.map(r => {
      let extraData: any = {};
      try {
        if (r.serviceReport) extraData = JSON.parse(r.serviceReport);
      } catch (e) {}

      return {
        id: r.id,
        code: extraData.code || (r.recordType === 'TEMIZLIK_EKSTRA' ? 'EKS' : 'RUT'),
        title: r.title,
        area: extraData.area || r.description || 'Ortak Alan',
        period: extraData.period || (r.recordType === 'TEMIZLIK_EKSTRA' ? 'ANLIK' : 'GÜN BOYU'),
        priority: r.priority.toUpperCase(),
        recordType: r.recordType,
        isCompleted: r.status === 'Completed' || r.status === 'TAMAMLANDI',
        completedBy: r.reporterName || undefined,
        completedAt: extraData.completedAt || undefined,
        notes: extraData.notes || r.resolutionNote || ''
      };
    });

    return NextResponse.json({ success: true, data: formatted, date: dateQuery });
  } catch (error: any) {
    console.error('Error in cleaning tasks API GET:', error);
    return NextResponse.json({ success: false, message: 'Veritabanı hatası: ' + (error?.message || String(error)) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ success: false, message: 'Görev başlığı zorunludur.' }, { status: 400 });
    }

    const isExtra = body.isExtra !== false;
    const recordType = isExtra ? 'TEMIZLIK_EKSTRA' : 'TEMIZLIK_RUTIN';
    const code = isExtra ? `EKS-${Math.floor(100 + Math.random() * 900)}` : `RUT-${Math.floor(10 + Math.random() * 90)}`;

    const newRecord = await faultDb.faultRecord.create({
      data: {
        title: body.title.trim(),
        description: body.area?.trim() || 'Tesis Geneli',
        recordType: recordType,
        priority: body.priority || 'Normal',
        status: 'Pending',
        faultDate: new Date(),
        isRecurringTemplate: !!body.isRecurring,
        serviceReport: JSON.stringify({
          code: code,
          area: body.area?.trim() || 'Tesis Geneli',
          period: body.period || (isExtra ? 'ANLIK' : 'GÜN BOYU'),
          notes: body.notes?.trim() || ''
        })
      }
    });

    return NextResponse.json({ success: true, data: newRecord }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating cleaning task:', error);
    return NextResponse.json({ success: false, message: 'Kayıt eklenemedi: ' + (error?.message || String(error)) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ success: false, message: 'Görev ID zorunludur.' }, { status: 400 });
    }

    const existing = await faultDb.faultRecord.findUnique({
      where: { id: body.id }
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Görev bulunamadı.' }, { status: 404 });
    }

    let extraData: any = {};
    try {
      if (existing.serviceReport) extraData = JSON.parse(existing.serviceReport);
    } catch (e) {}

    const isDone = body.isCompleted === true;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (isDone) {
      extraData.completedAt = body.completedAt || timeStr;
      extraData.completedBy = body.completedBy || 'Temizlik Personeli';
    } else {
      delete extraData.completedAt;
      delete extraData.completedBy;
    }

    const updated = await faultDb.faultRecord.update({
      where: { id: body.id },
      data: {
        status: isDone ? 'Completed' : 'Pending',
        reporterName: isDone ? (body.completedBy || 'Temizlik Personeli') : null,
        resolutionNote: isDone ? `${body.completedBy} tarafından saat ${extraData.completedAt} tamamlandı.` : null,
        serviceReport: JSON.stringify(extraData)
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating cleaning task:', error);
    return NextResponse.json({ success: false, message: 'Güncelleme hatası: ' + (error?.message || String(error)) }, { status: 500 });
  }
}
