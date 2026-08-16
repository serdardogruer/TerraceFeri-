# Deployment — Dağıtım

Version: 1.0  
Status: Approved

---

# Amaç

TerraceFeri sisteminin production ortamına kurulum ve dağıtım kılavuzu.

---

# Ortamlar

| Ortam | Açıklama |
|---|---|
| Development | Yerel geliştirme makinesi |
| Staging | Test sunucusu |
| Production | Canlı sunucu |

---

# Sunucu Gereksinimleri

## Minimum

| Kaynak | Değer |
|---|---|
| İşlemci | 2 vCPU |
| RAM | 4 GB |
| Disk | 50 GB SSD |
| OS | Ubuntu 22.04 LTS |

## Önerilen

| Kaynak | Değer |
|---|---|
| İşlemci | 4 vCPU |
| RAM | 8 GB |
| Disk | 100 GB SSD |

---

# Docker Compose (Production)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: terraceferi
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/terraceferi
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    depends_on:
      - postgres

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl

volumes:
  postgres_data:
```

---

# Nginx Konfigürasyonu

```nginx
# nginx.conf
server {
    listen 80;
    server_name terraceferi.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name terraceferi.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://app:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

# SSL Sertifika

## Let's Encrypt (Ücretsiz)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d terraceferi.com
sudo certbot renew --dry-run  # Otomatik yenileme testi
```

## Self-Signed (Lokal Ağ)

```bash
openssl req -x509 -newkey rsa:4096 \
  -keyout key.pem -out cert.pem \
  -days 365 -nodes \
  -subj '/CN=terraceferi.local'
```

---

# PM2 (Alternatif — Docker olmadan)

```bash
npm install -g pm2

# Uygulamayı başlat
pm2 start npm --name "terraceferi" -- start

# Otomatik başlatma
pm2 startup
pm2 save
```

---

# Ortam Değişkenleri

```env
# .env.production
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="güçlü-rastgele-string"
NEXTAUTH_URL="https://terraceferi.com"
GROQ_API_KEY="gsk_..."
NODE_ENV="production"
```

---

# Deployment Süreci

```bash
# 1. Kodu çek
git pull origin main

# 2. Bağımlılıkları kur
npm ci

# 3. Veritabanı migration
npx prisma migrate deploy

# 4. Build
npm run build

# 5. PM2 restart
pm2 restart terraceferi
```

---

# Yedekleme

```bash
# Günlük veritabanı yedeği (cron)
0 2 * * * pg_dump terraceferi > /backups/db_$(date +%Y%m%d).sql

# Dosya yedeği
0 3 * * * rsync -av /app/uploads/ /backups/uploads/
```

---

# Monitoring

- PM2 Logs: `pm2 logs terraceferi`
- Nginx Logs: `/var/log/nginx/`
- PostgreSQL Logs: `/var/log/postgresql/`

---

# Geliştirme Ortamı Başlatma

```bash
# Backend + Frontend birlikte
npm run dev

# Sadece backend
cd server && node index.js

# Sadece frontend
cd client && npm run dev
```

---

# Android APK Build

```bash
cd client
npm run build
npx cap sync android
npx cap open android
# Android Studio > Build > Generate Signed Bundle/APK
```
