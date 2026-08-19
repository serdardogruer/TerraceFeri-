const { Client } = require('ssh2');

const config = {
  host: process.env.VDS_HOST || '104.233.4.15',
  port: parseInt(process.env.VDS_PORT || '25416', 10),
  username: process.env.VDS_USER || 'root',
  password: process.env.VDS_PASSWORD || 'Srdrdgrr1213.',
};

function runRemote(cmd) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log(`[SSH] Bağlandı -> ${config.host}:${config.port}`);
      conn.exec(cmd, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        let stdout = '';
        let stderr = '';
        stream.on('close', (code, signal) => {
          conn.end();
          resolve({ code, stdout, stderr });
        }).on('data', (data) => {
          stdout += data.toString();
          process.stdout.write(data);
        }).stderr.on('data', (data) => {
          stderr += data.toString();
          process.stderr.write(data);
        });
      });
    }).on('error', (err) => {
      reject(err);
    }).connect(config);
  });
}

module.exports = { runRemote, config };

if (require.main === module) {
  const testCmd = process.argv.slice(2).join(' ') || 'hostname && uptime && docker ps -a && pm2 list';
  console.log(`[SSH] Komut çalıştırılıyor: ${testCmd}\n`);
  runRemote(testCmd).then((res) => {
    console.log(`\n[SSH] Bitti (Exit Code: ${res.code})`);
  }).catch((err) => {
    console.error('[SSH] Hata:', err.message);
    process.exit(1);
  });
}
