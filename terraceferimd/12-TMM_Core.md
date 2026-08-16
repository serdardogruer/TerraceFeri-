# TMM Core — Çekirdek Sistem

Version: 1.0  
Status: Approved

---

# Amaç

TMM Core, TerraceFeri platformunun merkezi altyapısıdır.

Tüm modüller TMM Core servislerini kullanır.

Modüller birbirine bağımlı değildir; iletişim TMM Core üzerinden sağlanır.

---

# Bileşenler

```
TMM Core
│
├── Authentication Service
├── Authorization (RBAC) Service
├── Module Manager
├── Dashboard Engine
├── Notification Engine
├── Realtime Engine (Socket.IO)
├── File Manager
├── Audit Log Service
├── Settings Service
├── Shared Components (UI)
└── Shared Services (utilities)
```

---

# Authentication Service

- JWT üretimi ve doğrulama
- Refresh Token yönetimi
- Oturum kontrolü

→ Detay: `06-Authentication.md`

---

# Authorization Service

- RBAC yetki kontrolü
- `hasPermission(role, action)` fonksiyonu
- Middleware entegrasyonu

→ Detay: `07-RBAC.md`

---

# Module Manager

- Modüllerin kayıt edilmesi
- Modül aktif/pasif durumu
- Modül konfigürasyonu

→ Detay: `13-Module_Manager.md`

---

# Dashboard Engine

- Her modülden widget veri toplama
- Role göre widget filtreleme
- Gerçek zamanlı veri güncelleme

```typescript
interface DashboardWidget {
  id: string;
  title: string;
  module: string;
  roles: Role[];
  getData: () => Promise<WidgetData>;
}
```

---

# Notification Engine

Merkezi bildirim sistemi.

```typescript
interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  metadata?: Record<string, unknown>;
}

async function sendNotification(payload: NotificationPayload): Promise<void>
```

Kanallar:
- Web (Socket.IO)
- In-App (veritabanı)
- E-posta (v2)
- Push Notification (v2)

→ Detay: `20-Notification_Module.md`

---

# Realtime Engine

Socket.IO tabanlı gerçek zamanlı iletişim.

```typescript
// Olay yayını
function broadcast(event: string, data: unknown): void

// Odaya yayın
function broadcastToRoom(room: string, event: string, data: unknown): void

// Kullanıcıya özel
function sendToUser(userId: string, event: string, data: unknown): void
```

→ Detay: `24-Realtime_System.md`

---

# File Manager

Dosya yükleme ve yönetimi.

```typescript
interface FileUploadResult {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

async function uploadFile(file: File, entity: string, entityId: string): Promise<FileUploadResult>
```

→ Detay: `23-File_Manager.md`

---

# Audit Log Service

Tüm kritik işlemler kaydedilir.

```typescript
async function log(params: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
}): Promise<void>
```

Tetiklendiği durumlar:
- Kayıt oluşturma
- Kayıt güncelleme
- Kayıt silme
- Kullanıcı girişi/çıkışı
- Yetki değişikliği

---

# Settings Service

```typescript
async function getSetting(key: string): Promise<string | null>
async function setSetting(key: string, value: string): Promise<void>
```

---

# Shared Services

```
shared/
├── api.ts          → HTTP istek yardımcıları
├── date.ts         → Tarih formatlaması (date-fns)
├── format.ts       → Para, sayı formatları
├── storage.ts      → Dosya işlemleri
├── validator.ts    → Zod şemaları
└── socket.ts       → Socket.IO istemcisi
```

---

# Shared Components

```
components/shared/
├── DataTable/      → Veri tablosu
├── SearchBar/      → Arama
├── FilterBar/      → Filtreler
├── StatusBadge/    → Durum rozeti
├── PriorityBadge/  → Öncelik rozeti
├── FileUpload/     → Dosya yükleme
├── ConfirmDialog/  → Onay diyaloğu
├── EmptyState/     → Boş durum
└── LoadingSpinner/ → Yükleme
```

---

# Bağımlılık Kuralı

```
Modül → TMM Core Servisleri   ✅
Modül → Başka Modül           ❌ (yasak)
```
