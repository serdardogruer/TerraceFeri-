/**
 * TerraceFeri - 1-Click Deploy to VDS
 * 
 * 1. Pushes latest Git commits (or pulls on VDS)
 * 2. Runs prisma db push & generate on VDS
 * 3. Builds Next.js production bundle on VDS
 * 4. Gracefully reloads PM2 process (terraceferi-web)
 */

const { runRemote } = require('./vds-exec');

async function deploy() {
  console.log('========================================================');
  console.log('🚀 TERRACEFERI - VDS CANLIYA ALMA (DEPLOY) BAŞLATILDI');
  console.log('========================================================\n');

  const remoteCmd = `
    set -e
    echo "📥 1/4 Son kodlar GitHub/Depodan çekiliyor..."
    cd /var/www/terraceferi
    git pull origin main || true

    cd /var/www/terraceferi/apps/tmm
    echo "📦 2/4 Veritabanı tabloları ve Prisma güncelleniyor..."
    npx prisma db push --schema=prisma/schema.prisma --accept-data-loss

    echo "🏗️ 3/4 Next.js production build alınıyor..."
    npm run build

    echo "🔄 4/4 PM2 servisi kesintisiz yeniden başlatılıyor..."
    pm2 reload terraceferi-web

    echo "🎉 Canlıya alma başarıyla tamamlandı!"
  `;

  try {
    const res = await runRemote(remoteCmd);
    if (res.code === 0) {
      console.log('\n========================================================');
      console.log('✅ DAĞITIM BAŞARILI: https://terraceferi.codapi.site');
      console.log('========================================================');
      process.exit(0);
    } else {
      console.error('\n❌ Dağıtım sırasında hata oluştu (Exit Code:', res.code, ')');
      process.exit(1);
    }
  } catch (err) {
    console.error('\n❌ Bağlantı hatası:', err.message);
    process.exit(1);
  }
}

deploy();
