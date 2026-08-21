import { NextRequest, NextResponse } from 'next/server';
import { faultDb } from '../../../../modules/fault/database/client';

/**
 * Mimari:
 *   recordType = 'GUNLUK_RUTIN_SABLON'  → Kalıcı şablon, listede gösterilmez. Her gün bu şablondan kopya oluşturulur.
 *   recordType = 'GUNLUK_RUTIN'         → Belirli bir güne ait görünür kayıt (geçmiş + güncel kopyalar).
 *   recordType = 'ARIZA' | 'AYLIK_RUTIN' → Normal kayıtlar.
 */

/**
 * Bugünün başlangıcını ve sonunu UTC olarak döner.
 * Veritabanı UTC'de sakladığından timezone bağımsız çalışır.
 */
function getTodayRangeUTC() {
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const endOfDay   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  return { startOfDay, endOfDay };
}

/**
 * Bir kerelik migration: Önceki kodun yanlışlıkla isRecurringTemplate=true yaptığı
 * GUNLUK_RUTIN kayıtları var. Bunları geri döndür:
 *   1. isRecurringTemplate: false yap → kayıtlar listede tekrar görünür
 *   2. Bu kayıtlara karşılık GUNLUK_RUTIN_SABLON şablonu oluştur (yoksa)
 *   3. Bu kayıtların yarattığı hatalı kopya kayıtları temizle
 */
async function fixMigratedRecords() {
  // Yanlış migrate edilmiş orijinal kayıtları bul
  const brokenTemplates = await faultDb.faultRecord.findMany({
    where: {
      deletedAt: null,
      recordType: 'GUNLUK_RUTIN',
      isRecurringTemplate: true,
      templateId: null,
    },
  });

  if (brokenTemplates.length === 0) return;

  const { startOfDay, endOfDay } = getTodayRangeUTC();

  for (const record of brokenTemplates) {
    // 1. Bu kaydın yarattığı hatalı bugünkü kopyaları sil
    await faultDb.faultRecord.updateMany({
      where: {
        deletedAt: null,
        templateId: record.id,
        faultDate: { gte: startOfDay, lte: endOfDay },
      },
      data: { deletedAt: new Date() },
    });

    // 2. Kaydı normale döndür → listede görünür olur
    await faultDb.faultRecord.update({
      where: { id: record.id },
      data: { isRecurringTemplate: false },
    });

    // 3. Bu kayıt için bir SABLON kaydı zaten var mı?
    const existingSablon = await faultDb.faultRecord.findFirst({
      where: {
        deletedAt: null,
        recordType: 'GUNLUK_RUTIN_SABLON',
        title: record.title,
        equipmentId: record.equipmentId,
      },
    });

    // 4. SABLON yoksa oluştur
    if (!existingSablon) {
      await faultDb.faultRecord.create({
        data: {
          equipmentId: record.equipmentId,
          companyId: record.companyId,
          title: record.title,
          description: record.description,
          reporterName: record.reporterName,
          priority: record.priority,
          status: 'Bekliyor',
          recordType: 'GUNLUK_RUTIN_SABLON',
          isRecurringTemplate: true,
          templateId: null,
          isDailyReport: record.isDailyReport,
          isMonthlyReport: record.isMonthlyReport,
          isManagerView: record.isManagerView,
          isHidden: record.isHidden,
          reportFields: record.reportFields,
          faultDate: new Date(),
        },
      });
    }
  }
}

/**
 * Her gün çağrılır. GUNLUK_RUTIN_SABLON kayıtları için bugüne ait
 * GUNLUK_RUTIN kopyası yoksa otomatik oluşturur. Idempotent.
 */
async function ensureDailyRoutineCopies() {
  const { startOfDay, endOfDay } = getTodayRangeUTC();

  // Tüm aktif şablonları al
  const templates = await faultDb.faultRecord.findMany({
    where: {
      deletedAt: null,
      recordType: 'GUNLUK_RUTIN_SABLON',
    },
  });

  if (templates.length === 0) return;

  // Bugün için zaten var olan GUNLUK_RUTIN kayıtlarını bul
  const existingTodayRoutines = await faultDb.faultRecord.findMany({
    where: {
      deletedAt: null,
      recordType: 'GUNLUK_RUTIN',
      faultDate: { gte: startOfDay, lte: endOfDay },
    },
    select: { templateId: true, title: true },
  });

  const existingTitles = new Set(existingTodayRoutines.map(c => c.title.toLowerCase().trim()));
  const copiedTemplateIds = new Set(existingTodayRoutines.map(c => c.templateId).filter(Boolean));

  // Kopyası olmayanları bul ve oluştur
  const missingTemplates = templates.filter(t => 
    !copiedTemplateIds.has(t.id) && 
    !existingTitles.has(t.title.toLowerCase().trim())
  );
  if (missingTemplates.length === 0) return;

  await faultDb.faultRecord.createMany({
    data: missingTemplates.map(template => ({
      equipmentId: template.equipmentId,
      companyId: template.companyId,
      title: template.title,
      description: template.description,
      reporterName: template.reporterName,
      priority: template.priority,
      status: 'Bekliyor',
      recordType: 'GUNLUK_RUTIN',
      templateId: template.id,
      isRecurringTemplate: false,
      isDailyReport: template.isDailyReport,
      isMonthlyReport: template.isMonthlyReport,
      isManagerView: template.isManagerView,
      isHidden: template.isHidden,
      reportFields: template.reportFields,
      faultDate: new Date(),
    })),
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const equipmentId = searchParams.get('equipmentId');

    // 1. Önceki yanlış migration'ı düzelt (idempotent)
    await fixMigratedRecords();

    // 2. Bugüne ait şablon kopyalarını oluştur (idempotent)
    await ensureDailyRoutineCopies();

    // 3. Sadece teknik kayıtları döndür (Temizlik, Rezervasyon, SABLON'lar hariç)
    const TECHNICAL_RECORD_TYPES = ['ARIZA', 'GUNLUK_RUTIN', 'AYLIK_RUTIN', 'GENEL_ISLEM', 'RUTIN_GOREV'];
    const faults = await faultDb.faultRecord.findMany({
      where: {
        deletedAt: null,
        recordType: { in: TECHNICAL_RECORD_TYPES },
        ...(equipmentId ? { equipmentId } : {})
      },
      orderBy: { faultDate: 'desc' }
    });

    return NextResponse.json({ success: true, data: faults });
  } catch (error) {
    console.error('Error fetching faults:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }

    const commonData = {
      equipmentId: body.equipmentId || '',
      companyId: body.companyId || null,
      title: body.title,
      description: body.description || null,
      reporterName: body.reporterName || null,
      priority: body.priority || 'Normal',
      serviceReport: body.serviceReport || null,
      pendingReason: body.pendingReason || null,
      resolutionNote: body.resolutionNote || null,
      reportFields: body.reportFields || '["title","description"]',
      isDailyReport: body.isDailyReport || false,
      isMonthlyReport: body.isMonthlyReport || false,
      isManagerView: body.isManagerView ?? true,
      isHidden: body.isHidden || false,
      isRecurringTemplate: false,
      templateId: null as string | null,
    };

    // GUNLUK_RUTIN eklenince: kalıcı SABLON + bugünkü görünen kopya oluştur
    if (body.recordType === 'GUNLUK_RUTIN') {
      const sablon = await faultDb.faultRecord.create({
        data: {
          ...commonData,
          status: 'Bekliyor',
          recordType: 'GUNLUK_RUTIN_SABLON',
          isRecurringTemplate: true,
          templateId: null,
          faultDate: new Date(),
        },
      });

      // Bugünkü görünen kopya
      const todayCopy = await faultDb.faultRecord.create({
        data: {
          ...commonData,
          status: body.status || 'Bekliyor',
          recordType: 'GUNLUK_RUTIN',
          isRecurringTemplate: false,
          templateId: sablon.id,
          faultDate: new Date(),
        },
      });

      return NextResponse.json({ success: true, data: todayCopy }, { status: 201 });
    }

    // Diğer türler (ARIZA, AYLIK_RUTIN vb.) normal kayıt
    const newFault = await faultDb.faultRecord.create({
      data: {
        ...commonData,
        status: body.status || 'Bekliyor',
        recordType: body.recordType || 'ARIZA',
        faultDate: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: newFault }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating fault:', error);
    return NextResponse.json({ success: false, message: `API hatası: ${error?.message || String(error)}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ success: false, message: 'Fault ID is required' }, { status: 400 });
    }

    const updatedFault = await faultDb.faultRecord.update({
      where: { id: body.id },
      data: {
        equipmentId: body.equipmentId || null,
        companyId: body.companyId || null,
        title: body.title,
        description: body.description || null,
        reporterName: body.reporterName || null,
        priority: body.priority || 'Normal',
        status: body.status || 'Bekliyor',
        serviceReport: body.serviceReport || null,
        recordType: body.recordType || 'ARIZA',
        pendingReason: body.pendingReason || null,
        resolutionNote: body.resolutionNote || null,
        reportFields: body.reportFields || '["title","description"]',
        isDailyReport: body.isDailyReport || false,
        isMonthlyReport: body.isMonthlyReport || false,
        isManagerView: body.isManagerView ?? true,
        isHidden: body.isHidden || false,
      },
    });

    return NextResponse.json({ success: true, data: updatedFault });
  } catch (error) {
    console.error('Error updating fault:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    const record = await faultDb.faultRecord.findUnique({ where: { id } });

    if (!record) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }

    // SABLON siliniyorsa tüm günlük kopyaları da kalıcı olarak sil
    if (record.recordType === 'GUNLUK_RUTIN_SABLON') {
      await faultDb.faultRecord.deleteMany({
        where: { templateId: id },
      });
    }

    // Kaydı kalıcı olarak sil (hard delete)
    await faultDb.faultRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting fault:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
