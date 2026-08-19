const { Client } = require('ssh2');
const path = require('path');
const { config } = require('./vds-exec');

const filesToUpload = [
  'prisma/schema.prisma',
  'src/lib/meters-db.ts',
  'src/lib/mock-db.ts',
  'src/app/api/meters/route.ts',
  'src/app/api/meters/registry/route.ts',
  'src/app/api/meters/autofill-sundays/route.ts',
  'scripts/seed-meters-from-json.js',
  'scripts/export-data.js',
  'scripts/import-data.js',
  'modules/meter/database/client.ts'
];

async function upload() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect(config));
  const sftp = await new Promise((res, rej) => conn.sftp((err, s) => err ? rej(err) : res(s)));

  const baseDir = path.join(__dirname, '..');
  for (const relPath of filesToUpload) {
    const localP = path.join(baseDir, relPath);
    const remoteP = '/opt/terraceferi/apps/tmm/' + relPath.replace(/\\/g, '/');
    const remoteDir = path.dirname(remoteP);

    await new Promise((res) => conn.exec(`mkdir -p "${remoteDir}"`, () => res()));
    await new Promise((res, rej) => sftp.fastPut(localP, remoteP, (err) => err ? rej(err) : res()));
    console.log('📤 Yüklendi ->', relPath);
  }
  conn.end();
  console.log('\n✅ Tüm dosyalar başarıyla VDS sunucusuna aktarıldı.');
}

upload().catch((e) => { console.error('Upload Error:', e); process.exit(1); });
