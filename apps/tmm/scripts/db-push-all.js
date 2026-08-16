/**
 * TerraceFeri - PostgreSQL Multi-Schema Push Automation Script
 * Pushes all 7 Prisma schemas to the target database.
 */

const { execSync } = require('child_process');
const path = require('path');

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
console.log('====================================================\n');

let hasError = false;

for (const schema of schemas) {
  const schemaName = schema.split('/')[1];
  console.log(`⏳ [${schemaName.toUpperCase()}] şeması uygulanıyor...`);
  try {
    execSync(`npx prisma db push --schema=${schema} --accept-data-loss`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
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
  console.log('🎉 Tüm PostgreSQL tabloları başarıyla oluşturuldu!');
  console.log('====================================================');
}
