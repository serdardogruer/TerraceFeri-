/**
 * TerraceFeri - Root PM2 Production Ecosystem Configuration
 */

module.exports = {
  apps: [
    {
      name: 'terraceferi-web',
      script: 'scripts/start-server.js',
      cwd: './apps/tmm',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './apps/tmm/logs/pm2-error.log',
      out_file: './apps/tmm/logs/pm2-out.log',
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
    {
      name: 'terraceferi-whatsapp-bot',
      script: 'scripts/whatsapp-bot-server.js',
      cwd: './apps/tmm',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './apps/tmm/logs/pm2-bot-error.log',
      out_file: './apps/tmm/logs/pm2-bot-out.log',
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
