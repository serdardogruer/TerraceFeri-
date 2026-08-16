import { NextResponse } from 'next/server';
import { prismaPersonnel } from '../../../../../modules/personnel/database/client';
import { differenceInMinutes, startOfDay, subHours, isAfter, isBefore, addHours } from 'date-fns';

// 5 dakikalık cooldown
const COOLDOWN_MINUTES = 5;

// Gece 02:59 (03:00'dan öncesi önceki güne aittir)
const DAY_RESET_HOUR = 3;

// Haversine mesafe hesaplama fonksiyonu (metre cinsinden)
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export async function POST(req: Request) {
  try {
    const { personnelId, locationId, lat, lng } = await req.json();

    if (!personnelId) {
      return NextResponse.json({ success: false, message: 'Personel bilgisi bulunamadı.' }, { status: 400 });
    }

    // 1. Personel Kontrolü
    const personnel = await prismaPersonnel.personnel.findUnique({
      where: { id: personnelId }
    });

    if (!personnel) {
      return NextResponse.json({ success: false, message: 'Geçersiz personel.' }, { status: 401 });
    }

    if (personnel.status !== 'ACTIVE') {
      return NextResponse.json({ success: false, message: 'Personel kaydınız aktif değil.' }, { status: 403 });
    }

    // 2. Konum ve IP Ayarlarını Veritabanından Çek
    const locationSetting = await prismaPersonnel.locationSetting.findUnique({
      where: { locationId: locationId || 'UNKNOWN' }
    });

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown';
    let isIpAllowed = false;
    let isLocationAllowed = false;

    if (locationSetting) {
      // IP Kontrolü
      if (locationSetting.allowedIps.includes(clientIp)) {
        isIpAllowed = true;
      }

      // Konum (Mesafe) Kontrolü
      if (lat && lng && locationSetting.latitude && locationSetting.longitude) {
        const distanceMeters = getDistanceFromLatLonInM(lat, lng, locationSetting.latitude, locationSetting.longitude);
        if (distanceMeters <= locationSetting.allowedRadiusMeters) {
          isLocationAllowed = true;
        }
      }

      if (!isIpAllowed && !isLocationAllowed) {
        return NextResponse.json({ 
          success: false, 
          message: `Doğrulama başarısız. Tesis sınırları (${locationSetting.allowedRadiusMeters}m) içinde değilsiniz veya şirket Wi-Fi ağına bağlı değilsiniz.` 
        }, { status: 403 });
      }
    } else {
      // Eğer veritabanında bu konum ayarı yoksa, varsayılan olarak her şeye izin ver veya kısıtla (Şimdilik gevşek bırakıyoruz)
      // Gerçek prod ortamında burası doğrudan reddedilmeli
      if (!lat && !lng && !clientIp.includes('192.168.') && !clientIp.includes('10.') && clientIp !== '127.0.0.1' && clientIp !== '::1') {
        return NextResponse.json({ 
          success: false, 
          message: 'Konum izni alınamadı ve güvenli bir ağda değilsiniz.' 
        }, { status: 403 });
      }
    }

    // 3. Tarih/Saat Hesaplamaları (Gün Dönümü)
    const now = new Date();
    // Eğer saat 03:00'dan önceyse, bu işlem bir önceki "çalışma gününe" aittir.
    const currentWorkDay = now.getHours() < DAY_RESET_HOUR 
      ? startOfDay(subHours(now, 24)) 
      : startOfDay(now);
    
    const endOfWorkDay = addHours(currentWorkDay, 24 + DAY_RESET_HOUR); // Ertesi gün 03:00

    // Bu çalışma günü içindeki son işlemi bul
    const lastScan = await prismaPersonnel.timesheetLog.findFirst({
      where: {
        personnelId: personnel.id,
        scanTime: {
          gte: currentWorkDay,
          lt: endOfWorkDay
        }
      },
      orderBy: { scanTime: 'desc' }
    });

    // 4. Cooldown Kontrolü
    if (lastScan) {
      const minutesSinceLastScan = differenceInMinutes(now, lastScan.scanTime);
      if (minutesSinceLastScan < COOLDOWN_MINUTES) {
        return NextResponse.json({ 
          success: false, 
          message: `Lütfen tekrar okutmak için ${COOLDOWN_MINUTES - minutesSinceLastScan} dakika bekleyin.` 
        }, { status: 429 });
      }
    }

    // 5. Giriş/Çıkış Tipini Belirleme
    // Kural: Bugün hiç işlem yoksa GİRİŞ. Son işlem GİRİŞ ise ÇIKIŞ. Son işlem ÇIKIŞ ise GİRİŞ.
    let scanType: 'ENTRY' | 'EXIT' = 'ENTRY';
    
    if (lastScan) {
      scanType = lastScan.type === 'ENTRY' ? 'EXIT' : 'ENTRY';
    }

    // 6. Kaydı Oluştur
    await prismaPersonnel.timesheetLog.create({
      data: {
        personnelId: personnel.id,
        type: scanType,
        latitude: lat,
        longitude: lng,
        ipAddress: clientIp,
        locationId: locationId || 'UNKNOWN'
      }
    });

    return NextResponse.json({ 
      success: true, 
      type: scanType,
      message: `${scanType === 'ENTRY' ? 'Giriş' : 'Çıkış'} işlemi başarılı.` 
    });

  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ success: false, message: 'Sunucu hatası' }, { status: 500 });
  }
}
