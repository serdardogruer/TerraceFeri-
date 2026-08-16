/**
 * TerraceFeri - PM2 Production Ecosystem Configuration
 * 
 * Usage:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    {
      name: 'terraceferi-web',
      script: 'scripts/start-server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
    // İsteğe bağlı: WhatsApp AI Bot Arka Plan Servisi
    {
      name: 'terraceferi-whatsapp-bot',
      script: 'scripts/whatsapp-bot-server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-bot-error.log',
      out_file: './logs/pm2-bot-out.log',
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
