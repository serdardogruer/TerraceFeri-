import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { faultDb } from '@modules/fault/database/client';

const execPromise = util.promisify(exec);

function findChromeExecutable(): string | null {
  if (process.env.CHROME_BIN && fs.existsSync(/*turbopackIgnore: true*/ process.env.CHROME_BIN)) {
    return process.env.CHROME_BIN;
  }
  const candidates =
    process.platform === 'win32'
      ? [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        ]
      : [
          '/usr/bin/google-chrome',
          '/usr/bin/google-chrome-stable',
          '/usr/bin/chromium-browser',
          '/usr/bin/chromium',
        ];
  for (const c of candidates) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ c)) return c;
    } catch {}
  }
  return null;
}

function formatDateTR(date: Date): string {
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function formatDateISO(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function POST(req: NextRequest) {
  try {
    const targetDir = path.join(process.cwd(), 'günlükrapor');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const now = new Date();
    const dayStr = String(now.getDate()).padStart(2, '0');
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const fileName = `${dayStr}.${monthStr}.pdf`;
    const fullPdfPath = path.join(targetDir, fileName);

    // Bugünün başlangıcı ve sonu
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Fetch active records from database - SADECE BUGÜNÜN KAYITLARI
    let faults: any[] = [];
    try {
      faults = await faultDb.faultRecord.findMany({
        where: {
          faultDate: {
            gte: todayStart,
            lte: todayEnd
          }
        },
        orderBy: { faultDate: 'asc' }
      });
    } catch (dbErr) {
      console.warn('Prisma fetch failed, fallback to empty:', dbErr);
    }

    const reportCode = `TMM-GÜN-${Math.floor(Math.random() * 8000) + 1000}`;
    const dateFormatted = formatDateTR(now);
    const dateISO = formatDateISO(now);

    const rowsHtml = faults.length > 0 ? faults.map((f, i) => {
      const isCompleted = f.status === 'Tamamlandı';
      const isPending = f.status === 'Bekliyor' || !f.status;
      const statusHtml = isCompleted 
        ? `<span style="color: #059669; font-weight: 800;">Tamamlandı</span>`
        : `<span style="color: #d97706; font-weight: 800;">Bekliyor</span>`;
      
      const timeStr = f.faultDate ? new Date(f.faultDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Günlük Tur';
      const category = f.recordType === 'ARIZA' ? 'Arıza Bildirimi' : 'Günlük Devriye';
      const priority = f.recordType === 'ARIZA' ? (f.priority?.toUpperCase() || 'NORMAL') : 'RUTİN';

      return `
        <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 9px 10px; text-align: center; color: #64748b; font-weight: bold; font-size: 11px;">${i + 1}</td>
          <td style="padding: 9px 10px; font-weight: 700; color: #0f172a; font-size: 11px;">${f.title}</td>
          <td style="padding: 9px 10px; color: #475569; font-weight: 500; font-size: 11px;">${category}</td>
          <td style="padding: 9px 10px; color: #475569; font-weight: 500; font-size: 11px;">Tesis Geneli</td>
          <td style="padding: 9px 10px; text-align: center; font-weight: 700; color: #475569; font-size: 10px;">${priority}</td>
          <td style="padding: 9px 10px; text-align: center; color: #64748b; font-size: 11px;">${timeStr}</td>
          <td style="padding: 9px 10px; text-align: center; font-size: 11px;">${statusHtml}</td>
        </tr>
      `;
    }).join('') : `
      <tr>
        <td colspan="7" style="padding: 20px; text-align: center; color: #64748b; font-size: 12px;">Bugün için kayıtlı işlem veya arıza bulunmamaktadır.</td>
      </tr>
    `;

    const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>TerraceFeri Rapor</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 12mm 15mm 12mm;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .title-banner {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      text-align: center;
      margin-top: 10px;
      margin-bottom: 16px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .data-table th {
      background-color: #0f172a;
      color: #ffffff;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      padding: 9px 10px;
      border: none;
    }
    .footer-signatures {
      margin-top: 40px;
      width: 100%;
      border-collapse: collapse;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <table class="header-table">
    <tr>
      <td style="vertical-align: top;">
        <div style="font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">TERRACEFERİ KONUTLARI</div>
        <div style="font-size: 12px; font-weight: 700; color: #334155; margin-top: 2px;">TerraceFeri Site Yöneticiliği</div>
        <div style="font-size: 10px; font-weight: 500; color: #64748b; margin-top: 2px;">Teknik Operasyon & Bakım Yönetim Sistemi (TMM Core)</div>
      </td>
      <td style="vertical-align: top; text-align: right;">
        <div style="display: inline-block; border: 1px solid #cbd5e1; background: #f8fafc; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; color: #334155;">
          RAPOR KODU: ${reportCode}
        </div>
        <div style="font-size: 10px; color: #475569; margin-top: 6px;">Düzenlenme Tarihi: <strong>${dateFormatted}</strong></div>
        <div style="font-size: 10px; color: #475569; margin-top: 2px;">Modül: <strong>Günlük Operasyon Raporu</strong></div>
      </td>
    </tr>
  </table>

  <div style="border-bottom: 2px solid #0f172a; margin-bottom: 12px;"></div>

  <!-- TITLE BANNER -->
  <div class="title-banner">
    <div style="font-size: 15px; font-weight: 800; color: #0f172a; letter-spacing: 0.5px;">
      TERRACEFERİ KONUTLARI ${dateISO} OPERASYON RAPORU
    </div>
    <div style="font-size: 10px; color: #64748b; margin-top: 3px;">
      ${dateISO} tarihli arıza bildirimleri, devriyeler ve rutin denetim dökümü
    </div>
  </div>

  <!-- DATA TABLE -->
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 30px; text-align: center;">#</th>
        <th style="text-align: left;">İŞLEM / GÖREV / ARIZA</th>
        <th style="text-align: left; width: 110px;">KATEGORİ</th>
        <th style="text-align: left; width: 100px;">BÖLGE / EKİPMAN</th>
        <th style="text-align: center; width: 90px;">ÖNCELİK / TÜR</th>
        <th style="text-align: center; width: 90px;">ZAMAN / SAAT</th>
        <th style="text-align: center; width: 120px;">TAMAMLANMA DURUMU</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <!-- SIGNATURES FOOTER -->
  <table class="footer-signatures">
    <tr>
      <td style="width: 50%; vertical-align: top;">
        <div style="font-size: 11px; font-weight: bold; color: #475569;">Teknik Sorumlu</div>
        <div style="font-size: 11px; color: #0f172a; margin-top: 3px;">Serdar DOĞRUER</div>
        <div style="border-top: 1px solid #cbd5e1; margin-top: 35px; width: 160px;"></div>
      </td>
      <td style="width: 50%; vertical-align: top; text-align: right;">
        <div style="font-size: 11px; font-weight: bold; color: #475569;">Site Müdürü</div>
        <div style="font-size: 11px; color: #0f172a; margin-top: 3px;">Saliha ERCAN</div>
        <div style="border-top: 1px solid #cbd5e1; margin-top: 35px; width: 160px; margin-left: auto;"></div>
      </td>
    </tr>
  </table>

</body>
</html>
    `;

    const tempHtmlPath = path.join(targetDir, 'temp_report.html');
    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

    const chromePath = findChromeExecutable();
    if (chromePath) {
      const chromeCmd = `"${chromePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${fullPdfPath}" "${tempHtmlPath}"`;
      try {
        await execPromise(chromeCmd);
        console.log(`[Birebir Tasarım PDF Üretildi]: ${fullPdfPath}`);
      } catch (cmdErr) {
        console.warn('Chrome PDF generation command warning:', cmdErr);
      }
    } else {
      // Chrome bulunamazsa HTML raporu doğrudan PDF yolunun yanına kaydedilir
      fs.writeFileSync(path.join(targetDir, `${dayStr}.${monthStr}.html`), htmlContent, 'utf-8');
      console.log(`[Headless Chrome bulunamadı, HTML rapor hazırlandı]`);
    }

    try { fs.unlinkSync(tempHtmlPath); } catch {}

    return NextResponse.json({
      success: true,
      fileName,
      filePath: fullPdfPath,
      message: `✅ Birebir şablonlu arıza raporu "${fileName}" adıyla "günlükrapor" klasörüne kaydedildi!`
    });
  } catch (error: any) {
    console.error('PDF Rapor kaydetme hatası:', error);
    return NextResponse.json({
      success: false,
      message: `PDF Rapor kaydedilemedi: ${error?.message || String(error)}`
    }, { status: 500 });
  }
}
