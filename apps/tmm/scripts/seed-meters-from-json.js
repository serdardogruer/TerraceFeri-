/**
 * TerraceFeri - Seed Meters and Readings from JSON into PostgreSQL
 */

const fs = require('fs');
const path = require('path');

// Manually parse .env
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  });
}

const { PrismaClient } = require('@prisma-clients/meter');
const defaultUrl = process.env.METER_DATABASE_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  ...(defaultUrl ? { datasources: { db: { url: defaultUrl } } } : {})
});

async function migrateMeters() {
  const jsonPath = path.join(__dirname, '../data/meters_data.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ meters_data.json bulunamadı:', jsonPath);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log('====================================================');
  console.log('⚡ SAYAÇ VERİLERİ POSTGRESQL VERİTABANINA AKTARILIYOR');
  console.log('====================================================\n');

  try {
    // 1. Sayaç Tanımları
    console.log(`⏳ ${rawData.meters.length} adet sayaç tanımı aktarılıyor...`);
    for (const m of rawData.meters) {
      await prisma.meter.upsert({
        where: { meterNo: m.meterNo },
        update: {
          name: m.name,
          type: m.type,
          unit: m.unit,
          location: m.location || null
        },
        create: {
          id: m.id,
          meterNo: m.meterNo,
          name: m.name,
          type: m.type,
          unit: m.unit,
          location: m.location || null
        }
      });
    }
    console.log('✅ Sayaç tanımları başarıyla aktarıldı.\n');

    // 2. Sayaç Okuma Değerleri
    console.log(`⏳ ${rawData.readings.length} adet okuma kaydı aktarılıyor...`);
    let count = 0;
    for (const r of rawData.readings) {
      const dataPayload = {
        meterId: r.meterId,
        meterNo: r.meterNo,
        type: r.type,
        unit: r.unit,
        location: r.location || null,
        readDate: r.readDate,
        readTime: r.readTime || '10:00',
        aktif: Number(r.aktif ?? 0),
        prevAktif: Number(r.prevAktif ?? 0),
        reaktif: Number(r.reaktif ?? 0),
        prevReaktif: Number(r.prevReaktif ?? 0),
        kapasitif: Number(r.kapasitif ?? 0),
        prevKapasitif: Number(r.prevKapasitif ?? 0),
        value: Number(r.value ?? (r.aktif ?? 0)),
        prevValue: Number(r.prevValue ?? 0),
        status: r.status || 'Normal',
        notes: r.notes || null,
      };

      await prisma.meterReading.upsert({
        where: {
          meterId_readDate: {
            meterId: r.meterId,
            readDate: r.readDate
          }
        },
        update: dataPayload,
        create: {
          id: r.id || `r-${r.readDate}-${r.meterId}`,
          ...dataPayload
        }
      });
      count++;
    }

    console.log(`✅ ${count} adet okuma kaydı PostgreSQL'e eksiksiz aktarıldı!`);
    console.log('\n====================================================');
    console.log('🎉 SAYAÇLAR ARTIK TAMAMEN POSTGRESQL DB ÜZERİNDEN ÇALIŞIYOR!');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Aktarım hatası:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    if (require.main === module) process.exit(0);
  }
}

module.exports = { migrateMeters };

if (require.main === module) {
  migrateMeters();
}
