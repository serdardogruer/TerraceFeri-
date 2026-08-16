# System Architecture

Version: 1.0  
Status: Approved

---

# Amaç

Bu doküman TerraceFeri Rezidans Yönetim Sistemi'nin teknik mimarisini tanımlar.

---

# Fiziksel Proje Ayrımı

- **`web/` Klasörü**: Yalnızca kamuoyuna açık **Kurumsal Web Sitesi** (Vitrin) kod tabanını içerir. Bağımsız olarak çalışır ve yönetilir.
- **`tmm/` Klasörü**: **TMM Core ve Rezidans Yönetim Sistemi** (Yönetim, Sakin ve Personel Panelleri, API Routes, Prisma ORM, PostgreSQL veritabanı ve Socket.IO) kod tabanını içerir.

---

# Katmanlı Mimari

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│   web/ (Vitrin Web)   │   tmm/ (Yönetim Panelleri)      │
│   Web Browser         │   Android APK / Tablet          │
└────────────────────────────┬────────────────────────────┘
                             │ HTTPS / WSS
┌────────────────────────────▼────────────────────────────┐
│              APPLICATION & API LAYER                    │
│           Next.js (App Router - tmm/)                   │
│   Server Components  │  API Routes  │ Middleware        │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                   SERVICE LAYER                         │
│   Auth │ RBAC │ Module Manager │ File Manager           │
│   Notification │ Realtime (Socket.IO Engine)            │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                    DATA LAYER                           │
│   Modüler Veritabanları (AreaDB, FaultDB, vb.)          │
└─────────────────────────────────────────────────────────┘
```

---

# Sistem Bileşenleri

## Frontend

- Next.js App Router
- React Server Components
- Client Components (yalnızca gerektiğinde)
- Shadcn/ui + Tailwind CSS

## Backend

- Next.js API Routes
- Prisma ORM
- PostgreSQL

## Gerçek Zamanlı

- Socket.IO Server
- Event-Driven Architecture

## Dosya Depolama

- Yerel disk (v1)
- S3 / MinIO (v2+)

---

# Panel Mimarisi

```
TerraceFeri Platform
│
├── /                    → Kurumsal Web Sitesi
├── /auth                → Giriş / Kayıt
├── /admin               → Yönetim Paneli
├── /resident            → Daire Sakini Paneli
├── /personnel           → Personel Paneli
│     ├── /technical     → Teknik Personel
│     ├── /cleaning      → Temizlik Personeli
│     └── /security      → Güvenlik Personeli
└── /api                 → REST API
```

---

# Veri Akışı

## Kullanıcı İsteği

```
User Action
    │
    ▼
Next.js Page (RSC)
    │
    ▼
API Route Handler
    │
    ▼
Module API (Rest/gRPC)
    │
    ▼
Prisma ORM (Modüle Özel)
    │
    ▼
Module Database (örn. AreaDB)
    │
    ▼
Response
    │
    ▼
Socket.IO Broadcast → Diğer bağlı istemciler
```

---

# Güvenlik Katmanları

| Katman | Mekanizma |
|---|---|
| Ağ | HTTPS / WSS |
| Kimlik Doğrulama | JWT + Refresh Token |
| Yetkilendirme | RBAC Middleware |
| Veri | Prisma Type Safety |
| API | Rate Limiting |
| Input | Zod Validation |

---

# Ortamlar

| Ortam | Açıklama |
|---|---|
| Development | Yerel geliştirme |
| Staging | Test ortamı |
| Production | Canlı sistem |

---

# Ölçeklenebilirlik

## Yatay Ölçekleme

- Stateless API tasarımı
- JWT ile merkezi oturum yönetimi gerekmiyor
- Load Balancer arkasında çalışabilir

## Dikey Ölçekleme

- PostgreSQL bağlantı havuzu (Prisma)
- Redis cache (v2+)

---

# Felaket Kurtarma

- Günlük PostgreSQL yedek
- Dosya yedekleme
- PM2 process yönetimi
- Nginx reverse proxy

---

# Monitoring

- Server Log
- Error Log
- Audit Log
- Performance Metrics (v2+)
