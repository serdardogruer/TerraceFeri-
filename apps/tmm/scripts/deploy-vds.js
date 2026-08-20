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
    echo "📥 1/3 Son kodlar GitHub'dan çekiliyor..."
    cd /opt/terraceferi
    git fetch origin main
    git reset --hard origin/main

    echo "🏗️ 2/3 Canlı Docker konteyneri derleniyor ve güncelleniyor..."
    docker compose build
    docker compose up -d

    echo "🔄 3/3 PM2 yedek servisi eşitleniyor..."
    cd /var/www/terraceferi
    git fetch origin main
    git reset --hard origin/main
    cd /var/www/terraceferi/apps/tmm
    npm run prisma:generate || true

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
