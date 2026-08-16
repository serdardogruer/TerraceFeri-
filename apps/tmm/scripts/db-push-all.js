/**
 * TerraceFeri - PostgreSQL Multi-Schema Push Automation Script
 * Pushes all 7 Prisma schemas to the target database with fallback to DATABASE_URL.
 */

const { execSync } = require('child_process');
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

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/terraceferi_db?schema=public';

// Ensure all module specific URLs have a fallback to main DATABASE_URL
const envVars = {
  ...process.env,
  CORE_DATABASE_URL: process.env.CORE_DATABASE_URL || dbUrl,
  AREA_DATABASE_URL: process.env.AREA_DATABASE_URL || dbUrl,
  APARTMENT_DATABASE_URL: process.env.APARTMENT_DATABASE_URL || dbUrl,
  COMPANY_DATABASE_URL: process.env.COMPANY_DATABASE_URL || dbUrl,
  EQUIPMENT_DATABASE_URL: process.env.EQUIPMENT_DATABASE_URL || dbUrl,
  FAULT_DATABASE_URL: process.env.FAULT_DATABASE_URL || dbUrl,
  PERSONNEL_DATABASE_URL: process.env.PERSONNEL_DATABASE_URL || dbUrl,
  DATABASE_URL: dbUrl
};

const schemas = [
  'modules/core/database/schema.prisma',
  'modules/area/database/schema.prisma',
  'modules/apartment/database/schema.prisma',
  'modules/company/database/schema.prisma',
  'modules/equipment/database/schema.prisma',
  'modules/fault/database/schema.prisma',
  'modules/personnel/database/schema.prisma'
];

console.log('====================================================');
console.log('🚀 TerraceFeri - PostgreSQL Tabloları Senkronize Ediliyor');
console.log(`🔗 Veritabanı Hedefi: ${dbUrl.replace(/:[^:@]+@/, ':****@')}`);
console.log('====================================================\n');

let hasError = false;

for (const schema of schemas) {
  const schemaName = schema.split('/')[1];
  console.log(`⏳ [${schemaName.toUpperCase()}] şeması uygulanıyor...`);
  try {
    execSync(`npx prisma db push --schema=${schema} --accept-data-loss`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: envVars
    });
    console.log(`✅ [${schemaName.toUpperCase()}] başarıyla güncellendi.\n`);
  } catch (err) {
    console.error(`❌ [${schemaName.toUpperCase()}] şeması uygulanırken hata oluştu:`, err.message);
    hasError = true;
  }
}

if (hasError) {
  console.error('\n⚠️ Bazı şemalar aktarılırken hata oluştu. Lütfen DATABASE_URL bağlantısını kontrol edin.');
  process.exit(1);
} else {
  console.log('====================================================');
  console.log('🎉 Tüm 7 modülün PostgreSQL tabloları başarıyla oluşturuldu!');
  console.log('====================================================');
}
