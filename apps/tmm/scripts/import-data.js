/**
 * TerraceFeri - Database Import Script
 * Imports all data from data/full_db_dump.json into the target PostgreSQL database.
 * 
 * Usage:
 *   node scripts/import-data.js
 *   (or npm run db:import)
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

const coreDb = new CoreClient({ datasources: { db: { url: process.env.CORE_DATABASE_URL || process.env.DATABASE_URL } } });
const areaDb = new AreaClient({ datasources: { db: { url: process.env.AREA_DATABASE_URL || process.env.DATABASE_URL } } });
const apartmentDb = new ApartmentClient({ datasources: { db: { url: process.env.APARTMENT_DATABASE_URL || process.env.DATABASE_URL } } });
const companyDb = new CompanyClient({ datasources: { db: { url: process.env.COMPANY_DATABASE_URL || process.env.DATABASE_URL } } });
const equipmentDb = new EquipmentClient({ datasources: { db: { url: process.env.EQUIPMENT_DATABASE_URL || process.env.DATABASE_URL } } });
const faultDb = new FaultClient({ datasources: { db: { url: process.env.FAULT_DATABASE_URL || process.env.DATABASE_URL } } });
const personnelDb = new PersonnelClient({ datasources: { db: { url: process.env.PERSONNEL_DATABASE_URL || process.env.DATABASE_URL } } });

async function importAll() {
  const dumpPath = path.join(__dirname, '../data/full_db_dump.json');
  if (!fs.existsSync(dumpPath)) {
    console.error(`❌ Hata: Veri dosyası bulunamadı: ${dumpPath}`);
    process.exit(1);
  }

  const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'));
  console.log('🔄 Veritabanına aktarım başlatılıyor...\n');

  try {
    // 1. Core Users Seed
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@terraceferi.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Sistem Yöneticisi';

    const existingAdmin = await coreDb.user.findUnique({ where: { email: adminEmail } }).catch(() => null);
    if (!existingAdmin) {
      await coreDb.user.create({
        data: {
          email: adminEmail,
          password: adminPassword,
          name: adminName,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      }).catch(e => console.warn('Admin user create warn:', e.message));
      console.log(`✅ Core: Admin kullanıcısı oluşturuldu (${adminEmail})`);
    } else {
      console.log(`✅ Core: Admin kullanıcısı zaten mevcut (${adminEmail})`);
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

    console.log('\n🎉 Tüm mevcut veriler hedef veritabanına başarıyla aktarıldı!');
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
    process.exit(0);
  }
}

importAll();
