/**
 * TerraceFeri - Pull Live Production Database & Data to Local
 * 
 * 1. Connects to VDS over SSH
 * 2. Runs data export on live PostgreSQL
 * 3. Downloads live database dump & JSON state files to local
 * 4. Imports everything into local database safely
 */

const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const { importAll } = require('./import-data');

const config = {
  host: process.env.VDS_HOST || '104.233.4.15',
  port: parseInt(process.env.VDS_PORT || '25416', 10),
  username: process.env.VDS_USER || 'root',
  password: process.env.VDS_PASSWORD || 'Srdrdgrr1213.',
};

function runSSHCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', (code) => {
        if (code === 0) resolve(stdout);
        else reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
      }).on('data', (d) => {
        stdout += d.toString();
        process.stdout.write(d);
      }).stderr.on('data', (d) => {
        stderr += d.toString();
        process.stderr.write(d);
      });
    });
  });
}

function downloadFile(sftp, remotePath, localPath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    sftp.fastGet(remotePath, localPath, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function pullLive() {
  console.log('========================================================');
  console.log('🌐 CANLI VDS VERİTABANINDAN LOKALE VERİ ÇEKME BAŞLATILDI');
  console.log(`🔗 Sunucu: ${config.host}:${config.port}`);
  console.log('========================================================\n');

  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect(config);
  });

  console.log('✅ VDS sunucusuna SSH bağlantısı sağlandı.\n');

  try {
    // 1. Canlı sunucuda export scriptini çalıştır
    console.log('⏳ 1/4 Canlı sunucuda veritabanı yedeği alınıyor...');
    await runSSHCommand(conn, 'cd /var/www/terraceferi/apps/tmm && node scripts/export-data.js');

    // 2. SFTP ile verileri lokale indir
    console.log('\n⏳ 2/4 Canlı veritabanı yedeği ve sayaç verileri lokale indiriliyor...');
    const sftp = await new Promise((res, rej) => conn.sftp((err, s) => err ? rej(err) : res(s)));

    const localDataDir = path.join(__dirname, '../data');
    const localDumpPath = path.join(localDataDir, 'full_db_dump.json');

    await downloadFile(sftp, '/var/www/terraceferi/apps/tmm/data/full_db_dump.json', localDumpPath);
    console.log('  📥 full_db_dump.json indirildi.');

    // Sayaç ve diğer json dosyalarını da çek
    const filesToSync = ['meters_data.json', 'voice_history.json', 'whatsapp_history.json'];
    for (const f of filesToSync) {
      try {
        await downloadFile(sftp, `/var/www/terraceferi/apps/tmm/data/${f}`, path.join(localDataDir, f));
        console.log(`  📥 ${f} indirildi.`);
      } catch {
        // opsiyonel dosya
      }
    }

    conn.end();
    console.log('\n✅ 3/4 Canlı veriler başarıyla bilgisayara indirildi.');

    // 3. Lokal veritabanına aktar
    console.log('\n⏳ 4/4 İndirilen veriler yerel veritabanınıza (PostgreSQL) aktarılıyor...');
    await importAll(localDumpPath);

    console.log('\n========================================================');
    console.log('🎉 TEBRİKLER! Canlı veritabanı lokal ortamınızla eşitlendi.');
    console.log('👉 Artık lokalde canlıdaki tüm gerçek arıza, sayaç ve daire verilerini görebilirsiniz.');
    console.log('========================================================');
    process.exit(0);

  } catch (error) {
    conn.end();
    console.error('\n❌ Hata:', error.message);
    process.exit(1);
  }
}

pullLive();
