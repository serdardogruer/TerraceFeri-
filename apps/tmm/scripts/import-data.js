/**
 * TerraceFeri - Database Import Script
 * Imports all data from data/full_db_dump.json into the target PostgreSQL database.
 */

const fs = require('fs');
const path = require('path');

// Parse .env
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

const { PrismaClient: CoreClient } = require('@prisma-clients/core');
const { PrismaClient: AreaClient } = require('@prisma-clients/area');
const { PrismaClient: ApartmentClient } = require('@prisma-clients/apartment');
const { PrismaClient: CompanyClient } = require('@prisma-clients/company');
const { PrismaClient: EquipmentClient } = require('@prisma-clients/equipment');
const { PrismaClient: FaultClient } = require('@prisma-clients/fault');
const { PrismaClient: PersonnelClient } = require('@prisma-clients/personnel');
const { PrismaClient: ManagementClient } = require('@prisma-clients/management');
const { PrismaClient: MeterClient } = require('@prisma-clients/meter');

const defaultUrl = process.env.DATABASE_URL || 'postgresql://terraceferi_user:Srdrdgrr1213.@127.0.0.1:5432/terraceferi?schema=public';

const coreDb = new CoreClient({ datasources: { db: { url: process.env.CORE_DATABASE_URL || defaultUrl } } });
const areaDb = new AreaClient({ datasources: { db: { url: process.env.AREA_DATABASE_URL || defaultUrl } } });
const apartmentDb = new ApartmentClient({ datasources: { db: { url: process.env.APARTMENT_DATABASE_URL || defaultUrl } } });
const companyDb = new CompanyClient({ datasources: { db: { url: process.env.COMPANY_DATABASE_URL || defaultUrl } } });
const equipmentDb = new EquipmentClient({ datasources: { db: { url: process.env.EQUIPMENT_DATABASE_URL || defaultUrl } } });
const faultDb = new FaultClient({ datasources: { db: { url: process.env.FAULT_DATABASE_URL || defaultUrl } } });
const personnelDb = new PersonnelClient({ datasources: { db: { url: process.env.PERSONNEL_DATABASE_URL || defaultUrl } } });
const managementDb = new ManagementClient({ datasources: { db: { url: process.env.MANAGEMENT_DATABASE_URL || defaultUrl } } });
const meterDb = new MeterClient({ datasources: { db: { url: process.env.METER_DATABASE_URL || defaultUrl } } });

async function importAll(customDumpPath) {
  const dumpPath = customDumpPath || path.join(__dirname, '../data/full_db_dump.json');
  if (!fs.existsSync(dumpPath)) {
    console.error(`❌ Hata: Veri dosyası bulunamadı: ${dumpPath}`);
    process.exit(1);
  }

  const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'));
  console.log('🔄 Veritabanına aktarım başlatılıyor...\n');

  try {
    // 1. Core Users
    if (dump.core && dump.core.users && dump.core.users.length > 0) {
      let count = 0;
      for (const user of dump.core.users) {
        await coreDb.user.upsert({
          where: { email: user.email },
          update: { ...user },
          create: { ...user },
        }).catch(e => console.warn('User upsert warn:', e.message));
        count++;
      }
      console.log(`✅ Core: ${count} kullanıcı aktarıldı/güncellendi.`);
    }

    // 2. Area Data
    if (dump.area && dump.area.areas && dump.area.areas.length > 0) {
      let count = 0;
      for (const area of dump.area.areas) {
        await areaDb.area.upsert({
          where: { id: area.id },
          update: { ...area },
          create: { ...area },
        }).catch(e => console.warn('Area upsert warn:', e.message));
        count++;
      }
      console.log(`✅ Area: ${count} alan aktarıldı/güncellendi.`);
    }

    // 3. Apartment Data
    if (dump.apartment && dump.apartment.apartments && dump.apartment.apartments.length > 0) {
      let count = 0;
      for (const apt of dump.apartment.apartments) {
        await apartmentDb.apartment.upsert({
          where: { id: apt.id },
          update: { ...apt },
          create: { ...apt },
        }).catch(e => console.warn('Apartment upsert warn:', e.message));
        count++;
      }
      console.log(`✅ Apartment: ${count} daire aktarıldı/güncellendi.`);
    }

    // 4. Company Data
    if (dump.company && dump.company.companies && dump.company.companies.length > 0) {
      let count = 0;
      for (const company of dump.company.companies) {
        await companyDb.company.upsert({
          where: { id: company.id },
          update: { ...company },
          create: { ...company },
        }).catch(e => console.warn('Company upsert warn:', e.message));
        count++;
      }
      console.log(`✅ Company: ${count} firma aktarıldı/güncellendi.`);
    }

    // 5. Equipment Data
    if (dump.equipment && dump.equipment.equipments && dump.equipment.equipments.length > 0) {
      let count = 0;
      for (const eq of dump.equipment.equipments) {
        await equipmentDb.equipment.upsert({
          where: { id: eq.id },
          update: { ...eq },
          create: { ...eq },
        }).catch(e => console.warn('Equipment upsert warn:', e.message));
        count++;
      }
      console.log(`✅ Equipment: ${count} ekipman aktarıldı/güncellendi.`);
    }

    // 6. Fault Data
    if (dump.fault && dump.fault.faultRecords && dump.fault.faultRecords.length > 0) {
      let count = 0;
      for (const fault of dump.fault.faultRecords) {
        await faultDb.faultRecord.upsert({
          where: { id: fault.id },
          update: { ...fault },
          create: { ...fault },
        }).catch(e => console.warn('Fault upsert warn:', e.message));
        count++;
      }
      console.log(`✅ Fault: ${count} arıza kaydı aktarıldı/güncellendi.`);
    }

    // 7. Personnel Data
    if (dump.personnel) {
      if (dump.personnel.locationSettings && dump.personnel.locationSettings.length > 0) {
        for (const loc of dump.personnel.locationSettings) {
          await personnelDb.locationSetting.upsert({
            where: { id: loc.id },
            update: { ...loc },
            create: { ...loc },
          }).catch(e => console.warn('LocationSetting upsert warn:', e.message));
        }
        console.log(`✅ Personnel: ${dump.personnel.locationSettings.length} konum ayarı aktarıldı.`);
      }

      if (dump.personnel.personnel && dump.personnel.personnel.length > 0) {
        for (const p of dump.personnel.personnel) {
          await personnelDb.personnel.upsert({
            where: { id: p.id },
            update: { ...p },
            create: { ...p },
          }).catch(e => console.warn('Personnel upsert warn:', e.message));
        }
        console.log(`✅ Personnel: ${dump.personnel.personnel.length} personel aktarıldı.`);
      }
    }

    // 8. Management Data
    if (dump.management && dump.management.managementRequests && dump.management.managementRequests.length > 0) {
      let count = 0;
      for (const req of dump.management.managementRequests) {
        await managementDb.managementRequest.upsert({
          where: { id: req.id },
          update: { ...req },
          create: { ...req },
        }).catch(e => console.warn('ManagementRequest upsert warn:', e.message));
        count++;
      }
      console.log(`✅ Management: ${count} yönetim talebi aktarıldı/güncellendi.`);
    }

    // 9. Meter Data
    if (dump.meter) {
      if (dump.meter.meters && dump.meter.meters.length > 0) {
        for (const m of dump.meter.meters) {
          await meterDb.meter.upsert({
            where: { meterNo: m.meterNo },
            update: { ...m },
            create: { ...m },
          }).catch(e => console.warn('Meter upsert warn:', e.message));
        }
        console.log(`✅ Meter: ${dump.meter.meters.length} sayaç tanımı aktarıldı.`);
      }

      if (dump.meter.readings && dump.meter.readings.length > 0) {
        let count = 0;
        for (const r of dump.meter.readings) {
          await meterDb.meterReading.upsert({
            where: {
              meterId_readDate: {
                meterId: r.meterId,
                readDate: r.readDate
              }
            },
            update: { ...r },
            create: { ...r },
          }).catch(e => console.warn('Reading upsert warn:', e.message));
          count++;
        }
        console.log(`✅ Meter: ${count} sayaç okuma kaydı aktarıldı.`);
      }
    }

    console.log('\n🎉 Tüm veriler veritabanına başarıyla aktarıldı!');
  } catch (error) {
    console.error('❌ İçe aktarma hatası:', error);
  } finally {
    await coreDb.$disconnect().catch(() => {});
    await areaDb.$disconnect().catch(() => {});
    await apartmentDb.$disconnect().catch(() => {});
    await companyDb.$disconnect().catch(() => {});
    await equipmentDb.$disconnect().catch(() => {});
    await faultDb.$disconnect().catch(() => {});
    await personnelDb.$disconnect().catch(() => {});
    await managementDb.$disconnect().catch(() => {});
    await meterDb.$disconnect().catch(() => {});
    if (require.main === module) process.exit(0);
  }
}

module.exports = { importAll };

if (require.main === module) {
  importAll();
}
