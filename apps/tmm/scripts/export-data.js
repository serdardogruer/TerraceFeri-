/**
 * TerraceFeri - Local/Remote Database Export Script
 * Exports all records across all 9 Prisma modules into a consolidated JSON dump.
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

async function exportAll() {
  console.log('🔄 Veritabanları taranıyor ve dışa aktarılıyor...\n');
  const dump = {
    exportedAt: new Date().toISOString(),
    core: { users: [] },
    area: { areas: [] },
    apartment: { apartments: [] },
    company: { companies: [] },
    equipment: { equipments: [] },
    fault: { faultRecords: [] },
    personnel: {
      personnel: [],
      personnelDevices: [],
      timesheetLogs: [],
      locationSettings: [],
    },
    management: {
      managementRequests: [],
    },
    meter: {
      meters: [],
      readings: [],
    }
  };

  try {
    dump.core.users = await coreDb.user.findMany().catch((e) => { console.warn('User error:', e.message); return []; });
    console.log(`✅ Core: ${dump.core.users.length} kullanıcı`);

    dump.area.areas = await areaDb.area.findMany().catch((e) => { console.warn('Area error:', e.message); return []; });
    console.log(`✅ Area: ${dump.area.areas.length} alan`);

    dump.apartment.apartments = await apartmentDb.apartment.findMany().catch((e) => { console.warn('Apartment error:', e.message); return []; });
    console.log(`✅ Apartment: ${dump.apartment.apartments.length} daire`);

    dump.company.companies = await companyDb.company.findMany().catch((e) => { console.warn('Company error:', e.message); return []; });
    console.log(`✅ Company: ${dump.company.companies.length} firma`);

    dump.equipment.equipments = await equipmentDb.equipment.findMany().catch((e) => { console.warn('Equipment error:', e.message); return []; });
    console.log(`✅ Equipment: ${dump.equipment.equipments.length} ekipman`);

    dump.fault.faultRecords = await faultDb.faultRecord.findMany().catch((e) => { console.warn('Fault error:', e.message); return []; });
    console.log(`✅ Fault: ${dump.fault.faultRecords.length} arıza kaydı`);

    dump.personnel.locationSettings = await personnelDb.locationSetting.findMany().catch((e) => { console.warn('LocationSetting error:', e.message); return []; });
    dump.personnel.personnel = await personnelDb.personnel.findMany().catch((e) => { console.warn('Personnel error:', e.message); return []; });
    dump.personnel.personnelDevices = await personnelDb.personnelDevice.findMany().catch((e) => { console.warn('Device error:', e.message); return []; });
    dump.personnel.timesheetLogs = await personnelDb.timesheetLog.findMany().catch((e) => { console.warn('Timesheet error:', e.message); return []; });
    console.log(`✅ Personnel: ${dump.personnel.personnel.length} personel, ${dump.personnel.locationSettings.length} konum ayarı`);

    dump.management.managementRequests = await managementDb.managementRequest.findMany().catch((e) => { console.warn('ManagementRequest error:', e.message); return []; });
    console.log(`✅ Management: ${dump.management.managementRequests.length} yönetim talebi/duyurusu`);

    dump.meter.meters = await meterDb.meter.findMany().catch((e) => { console.warn('Meter error:', e.message); return []; });
    dump.meter.readings = await meterDb.meterReading.findMany().catch((e) => { console.warn('MeterReading error:', e.message); return []; });
    console.log(`✅ Meter: ${dump.meter.meters.length} sayaç, ${dump.meter.readings.length} sayaç okuma kaydı`);

    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const exportPath = path.join(dataDir, 'full_db_dump.json');
    fs.writeFileSync(exportPath, JSON.stringify(dump, null, 2), 'utf-8');
    console.log(`\n🎉 Tüm veritabanı yedeği başarıyla oluşturuldu: ${exportPath}`);
  } catch (err) {
    console.error('❌ Dışa aktarma hatası:', err);
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

module.exports = { exportAll };

if (require.main === module) {
  exportAll();
}
