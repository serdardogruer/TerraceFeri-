# 🏢 TerraceFeri — Production Canlıya Alma ve Dağıtım Kılavuzu

**Hedef Sunucu:** VDS (IP: `104.233.4.15`, SSH Port: `25416`, Kullanıcı: `root`, Ubuntu 24.04 LTS)  
**Canlı Domain:** `https://terraceferi.codapi.site`  
**Canlı Çalışma Modu:** Docker (`/opt/terraceferi`)  

---

## ⚡ Hızlı Komutlar (Tek Tıkla İşlemler)

### 📥 Canlı Veritabanını & Sayaç Verilerini Lokale Çekme
Lokal bilgisayarınızda canlıdaki tüm güncel arızaları, daireleri ve sayaçları görmek için:
```bash
cd apps/tmm
npm run db:pull:live
```

### 🚀 Canlıya Yeni Kodları Yayınlama (Deploy)
Lokalde geliştirilen özellikleri VDS sunucusuna derleyip yayınlamak için:
```bash
cd apps/tmm
npm run deploy:vds
```

---

## 📋 10 Temel Dağıtım Sorusu & Cevapları

### 1. Proje nasıl build ediliyor?
```bash
cd apps/tmm
npm run build
```
Bu komut sırasıyla:
1. `npm run prisma:generate` çalıştırarak 9 modüler Prisma Client'ı (`@prisma-clients/*`) derler.
2. Next.js 16 Turbopack optimizasyonlu production bundle'ını (`.next`) oluşturur.

---

### 2. Production nasıl başlatılıyor?
```bash
cd apps/tmm
npm run start
```
`scripts/start-server.js` scripti, ortam değişkenlerinden gelen `PORT` (varsayılan: `3000`) ve `HOSTNAME` (varsayılan: `0.0.0.0`) değerlerini kullanarak sunucuyu güvenli şekilde ayağa kaldırır.

---

### 3. PM2 hangi komutla çalıştırılmalı?
```bash
# apps/tmm dizininde:
cd apps/tmm
pm2 start ecosystem.config.js --env production

# Veya proje kök dizininde:
pm2 start ecosystem.config.js --env production

# Sunucu yeniden başlatıldığında otomatik açılması için:
pm2 save
pm2 startup
```

---

### 4. Hangi port kullanılıyor?
- **Varsayılan Port:** `3000`
- **Host:** `0.0.0.0` (Nginx reverse proxy'den gelen tüm yerel ve ters bağlantıları dinler).
- Farklı bir port kullanmak için `.env` dosyasına `PORT=3005` yazmanız yeterlidir.

---

### 5. Hangi environment variable'lar gerekli?
`.env` dosyanızda bulunması gereken asgari değişkenler:

```env
# Çalışma Ortamı
NODE_ENV="production"
PORT=3000
HOSTNAME="0.0.0.0"

# Domain & URL
NEXT_PUBLIC_APP_URL="https://terraceferi.codapi.site"
APP_URL="https://terraceferi.codapi.site"

# Güvenlik
JWT_SECRET="guclu-ve-rastgele-en-az-32-karakter-jwt-secret"

# PostgreSQL Veritabanı (Tekil Bağlantı)
DATABASE_URL="postgresql://terraceferi_user:GucluSifre123!@127.0.0.1:5432/terraceferi?schema=public&sslmode=prefer"

# İsteğe Bağlı: AI & WhatsApp Bot
# GROQ_API_KEY="gsk_..."
```

---

### 6. Nginx reverse proxy için hangi ayarlar gerekli?
Nginx konfigürasyon dosyası projede `nginx/terraceferi.codapi.site.conf` olarak hazırdır.

```bash
# 1. Konfigürasyonu Nginx dizinine kopyalayın
sudo cp nginx/terraceferi.codapi.site.conf /etc/nginx/sites-available/terraceferi.codapi.site

# 2. Sembolik bağ oluşturun
sudo ln -s /etc/nginx/sites-available/terraceferi.codapi.site /etc/nginx/sites-enabled/

# 3. Nginx test edin ve yeniden yükleyin
sudo nginx -t
sudo systemctl reload nginx

# 4. SSL Sertifikası alın (Let's Encrypt / Certbot)
sudo certbot --nginx -d terraceferi.codapi.site
```

**Önemli Nginx Özellikleri:**
- WebSocket upgrade desteği (`Upgrade $http_upgrade`, `Connection "upgrade"`).
- Yüksek çözünürlüklü sayaç ve arıza fotoğrafları için `client_max_body_size 50M;`.
- Gzip sıkıştırma ve Next.js `_next/static` statik önbelleklemesi.
- SSL & Güvenlik başlıkları (X-Frame-Options, X-Content-Type-Options, HSTS).

---

### 7. PostgreSQL tabloları ve migrationlar nasıl aktarılır?
TerraceFeri 7 bağımsız modüler şemaya sahiptir (Core, Area, Apartment, Company, Equipment, Fault, Personnel). Tek komutla PostgreSQL'e aktarılır:

```bash
cd apps/tmm
npm run db:push
```
Bu script `scripts/db-push-all.js` dosyasını çalıştırarak 7 şemayı eksiksiz şekilde veritabanına uygular.

---

### 8. İlk Admin kullanıcı nasıl oluşturulacak?
Veritabanı tabloları oluşturulduktan sonra:

```bash
cd apps/tmm
npm run db:seed
```
Veya özel kullanıcı bilgileriyle:
```bash
node scripts/seed-admin.js admin@terraceferi.com GucluSifre123! "Sistem Yöneticisi"
```

**Varsayılan Giriş Bilgileri:**
- **URL:** `https://terraceferi.codapi.site/login`
- **E-posta:** `admin@terraceferi.com`
- **Şifre:** `admin123` (Seed veya arayüz üzerinden değiştirilebilir)

---

### 9. Sıfırdan VDS Production Deployment Adımları (Ubuntu 24.04)

```bash
# 1. Sunucu Paketlerini Güncelleyin
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ufw nginx postgresql postgresql-contrib

# 2. Node.js 22.x LTS Kurun
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 3. PostgreSQL Veritabanı ve Kullanıcısını Oluşturun
sudo -u postgres psql
# PostgreSQL komut satırında:
CREATE DATABASE terraceferi;
CREATE USER terraceferi_user WITH ENCRYPTED PASSWORD 'GucluSifre123!';
GRANT ALL PRIVILEGES ON DATABASE terraceferi TO terraceferi_user;
GRANT ALL ON SCHEMA public TO terraceferi_user;
\q

# 4. Projeyi Sunucuya Çekin
cd /var/www
git clone <REPO_URL> terraceferi
cd terraceferi/apps/tmm

# 5. Ortam Değişkenlerini Tanımlayın
cp .env.example .env
nano .env   # (DATABASE_URL, JWT_SECRET ve NEXT_PUBLIC_APP_URL alanlarını düzenleyin)

# 6. Bağımlılıkları Kurun ve Veritabanını Senkronize Edin
npm install
npm run db:push
npm run db:seed

# 7. Production Build Alın
npm run build

# 8. PM2 ile Başlatın
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# 9. Nginx ve SSL Yapılandırın
sudo cp nginx/terraceferi.codapi.site.conf /etc/nginx/sites-available/terraceferi.codapi.site
sudo ln -s /etc/nginx/sites-available/terraceferi.codapi.site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 10. SSL (Certbot) Kurulumu
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d terraceferi.codapi.site
```

---

### 10. Kalan TODO ve İyileştirme Önerileri
1. **WhatsApp AI Bot Oturumu:** WhatsApp botu kullanılacaksa sunucu üzerinde `pm2 start ecosystem.config.js --only terraceferi-whatsapp-bot` ile başlatılıp terminal veya QR kod üzerinden eşleştirilebilir.
2. **Headless Chrome (PDF Çıktısı için):** Sunucuda otomatik PDF arıza raporu üretimi için opsiyonel olarak `sudo apt install -y chromium-browser` kurulabilir (kurulmazsa sistem otomatik olarak HTML raporu üretmeye devam eder).
3. **Yedekleme (Backup Cron):** Günlük veritabanı yedeği için crontab'a `0 3 * * * pg_dump -U terraceferi_user terraceferi > /var/backups/terraceferi_$(date +\%F).sql` eklenebilir.
4. **Health Check İzleme:** `/api/health` endpoint'i UptimeRobot veya benzeri bir izleme aracına eklenerek sunucu sağlığı 7/24 takip edilebilir.

---

## 🔒 Güvenlik Kontrol Listesi
- [x] Hard-coded localhost bağlantıları kaldırıldı.
- [x] Tüm API istekleri dinamik `NEXT_PUBLIC_APP_URL` / `APP_URL` yapısına bağlandı.
- [x] `.env` dosyaları `.gitignore` ile korunuyor.
- [x] Hassas JWT anahtarları ve veritabanı URL'leri environment variable üzerinden yönetiliyor.
- [x] PWA manifest ve Service Worker hazırlandı (HTTPS uyumlu).
- [x] Nginx 50MB görsel upload ve WebSocket desteği yapılandırıldı.
- [x] PM2 otomatik yeniden başlatma ve bellek koruması (`max_memory_restart: 1G`) eklendi.
