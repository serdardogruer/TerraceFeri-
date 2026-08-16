/**
 * TerraceFeri - PostgreSQL Multi-Schema Push & Auto-Import Automation Script
 * Pushes all 7 Prisma schemas to PostgreSQL and imports all data.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Parse and ensure .env has all 7 module URLs
const envPath = path.join(__dirname, '../.env');
let envContent = '';
const envMap = {};

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8');
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
        envMap[key] = value;
      }
    }
  });
}

const mainUrl = envMap['DATABASE_URL'] || 
                envMap['CORE_DATABASE_URL'] || 
                envMap['AREA_DATABASE_URL'] || 
                process.env.DATABASE_URL || 
                'postgresql://postgres:postgres@localhost:5432/terraceferi_db?schema=public';

const requiredKeys = [
  'DATABASE_URL',
  'CORE_DATABASE_URL',
  'AREA_DATABASE_URL',
  'APARTMENT_DATABASE_URL',
  'COMPANY_DATABASE_URL',
  'EQUIPMENT_DATABASE_URL',
  'FAULT_DATABASE_URL',
  'PERSONNEL_DATABASE_URL'
];

let envUpdated = false;
let appendStr = '';

for (const key of requiredKeys) {
  if (!envMap[key]) {
    envMap[key] = mainUrl;
    appendStr += `\n${key}="${mainUrl}"`;
    envUpdated = true;
  }
  process.env[key] = envMap[key];
}

if (envUpdated && fs.existsSync(envPath)) {
  fs.appendFileSync(envPath, appendStr, 'utf-8');
  console.log('ℹ️ Eksik modül veritabanı değişkenleri .env dosyasına eklendi.');
}

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
console.log(`🔗 Veritabanı Hedefi: ${mainUrl.replace(/:[^:@]+@/, ':****@')}`);
console.log('====================================================\n');

let hasError = false;

for (const schema of schemas) {
  const schemaName = schema.split('/')[1];
  console.log(`⏳ [${schemaName.toUpperCase()}] şeması uygulanıyor...`);
  try {
    execSync(`npx prisma db push --schema=${schema} --accept-data-loss`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, ...envMap }
    });
    console.log(`✅ [${schemaName.toUpperCase()}] başarıyla güncellendi.\n`);
  } catch (err) {
    console.error(`❌ [${schemaName.toUpperCase()}] şeması uygulanırken hata:`, err.message);
    hasError = true;
  }
}

if (hasError) {
  console.error('\n⚠️ Bazı şemalar aktarılırken hata oluştu.');
  process.exit(1);
} else {
  console.log('====================================================');
  console.log('🎉 Tüm 7 modülün PostgreSQL tabloları başarıyla oluşturuldu!');
  console.log('====================================================\n');

  // Auto run import
  console.log('📦 Veriler otomatik olarak içe aktarılıyor...');
  try {
    execSync('node scripts/import-data.js', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, ...envMap }
    });
  } catch (err) {
    console.error('İçe aktarma hatası:', err.message);
  }
}
