/**
 * TerraceFeri - Unified PostgreSQL Schema Push & Auto-Import Script
 * Pushes all 7 modules simultaneously into PostgreSQL and imports data.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Parse .env
const envPath = path.join(__dirname, '../.env');
const envMap = {};

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
        envMap[key] = value;
      }
    }
  });
}

const mainUrl = envMap['DATABASE_URL'] || 
                envMap['CORE_DATABASE_URL'] || 
                process.env.DATABASE_URL || 
                'postgresql://postgres:postgres@localhost:5432/terraceferi_db?schema=public';

process.env.DATABASE_URL = mainUrl;

console.log('====================================================');
console.log('🚀 TerraceFeri - PostgreSQL Tabloları Senkronize Ediliyor');
console.log(`🔗 Veritabanı Hedefi: ${mainUrl.replace(/:[^:@]+@/, ':****@')}`);
console.log('====================================================\n');

try {
  console.log('⏳ Tekil şema üzerinden tüm tablolar PostgreSQL\'e uygulanıyor...');
  execSync(`npx prisma db push --schema=prisma/schema.prisma --accept-data-loss`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: mainUrl }
  });
  console.log('✅ Tüm 7 modülün tabloları başarıyla PostgreSQL\'de oluşturuldu!\n');

  console.log('📦 Veriler otomatik olarak içe aktarılıyor...');
  execSync('node scripts/import-data.js', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: mainUrl }
  });
} catch (err) {
  console.error('❌ Hata oluştu:', err.message);
  process.exit(1);
}
