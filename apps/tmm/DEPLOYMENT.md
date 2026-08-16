# 🏢 TerraceFeri — Production Canlıya Alma ve Dağıtım Kılavuzu

Lütfen ana kılavuz için projenin kök dizinindeki [DEPLOYMENT.md](../../DEPLOYMENT.md) dosyasına veya aşağıdaki hızlı komutlara başvurun:

## Hızlı Dağıtım Komutları
```bash
# 1. Ortam değişkenlerini hazırla
cp .env.example .env

# 2. Kurulum & Veritabanı
npm install
npm run db:push
npm run db:seed

# 3. Build & Başlatma
npm run build
pm2 start ecosystem.config.js --env production
```
