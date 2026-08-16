/**
 * TerraceFeri Production Server Launcher
 * Binds to HOSTNAME (default: 0.0.0.0) and PORT (default: 3000)
 */

const { spawn } = require('child_process');
const path = require('path');

const port = process.env.PORT || '3000';
const host = process.env.HOSTNAME || '0.0.0.0';

console.log('====================================================');
console.log('🚀 TerraceFeri Production Sunucusu Başlatılıyor');
console.log(`🌐 Host: ${host}`);
console.log(`🔌 Port: ${port}`);
console.log(`🌱 Ortam: ${process.env.NODE_ENV || 'production'}`);
console.log('====================================================\n');

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

const nextProcess = spawn(npxCmd, ['next', 'start', '-H', host, '-p', port], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
  env: {
    ...process.env,
    PORT: port,
    HOSTNAME: host,
    NODE_ENV: process.env.NODE_ENV || 'production'
  }
});

nextProcess.on('error', (err) => {
  console.error('Sunucu başlatma hatası:', err);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Sunucu ${code} çıkış koduyla durdu.`);
  }
  process.exit(code || 0);
});

process.on('SIGINT', () => {
  nextProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  nextProcess.kill('SIGTERM');
  process.exit(0);
});
