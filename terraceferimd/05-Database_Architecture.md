# Database Architecture

Version: 2.0  
Status: Approved

---

# Amaç

Bu doküman TerraceFeri sisteminin **modüler** veritabanı mimarisini tanımlar.

Sistem monolitik bir veritabanı yerine, her modülün kendi veritabanına ve Prisma şemasına sahip olduğu, **mikroservis benzeri ayrık bir yapı** kullanmaktadır (Bknz: `MODUL_SPEC.md`). 

---

# Genel Kurallar

- **Bağımsız Veritabanları**: Her modül kendi veritabanını (örn. AreaDB, FaultDB) yönetir.
- **Foreign Key Yasakları**: Modüller arası foreign key ilişkisi (doğrudan DB bağlantısı) **kurulamaz**. 
- **ID Referansları**: Başka bir modüldeki veriye ihtiyaç duyan tablo, yalnızca o verinin ID'sini string/UUID olarak saklar (Örn: Fault tablosundaki `areaId String`).
- **Veri Entegrasyonu**: Detaylı verilere ihtiyaç duyulduğunda, ilgili modülün API'si üzerinden veri çekilir (örn: `GET /api/areas/:id`).
- Tüm tablolar `UUID` primary key kullanır.
- Tüm tablolarda `createdAt` ve `updatedAt` alanları bulunur.
- **Soft Delete**: Silinen kayıtlar `deletedAt` ile işaretlenir, fiziksel silinmez.

---

# Örnek Modül Şemaları

Her modül `modules/[modül-adi]/database/schema.prisma` yolunda kendi şemasını barındıracaktır.

## 1. CoreDB (Kullanıcılar & Temel Ayarlar)

Tüm modüllerin API üzerinden doğrulama yapacağı temel kimlik yönetimi.

```prisma
// modules/core/database/schema.prisma

model User {
  id          String    @id @default(uuid())
  name        String
  email       String    @unique
  password    String
  role        Role
  status      UserStatus @default(ACTIVE)
  lastLogin   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?
}

enum Role {
  ADMIN
  RESIDENT
  TECHNICAL
  CLEANING
  SECURITY
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}
```

---

## 2. AreaDB (Alan Yönetimi)

```prisma
// modules/area/database/schema.prisma

model Area {
  id        String   @id @default(uuid())
  parentId  String?
  name      String
  type      String   @default("General")
  qrCode    String?
  notes     String?
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  // Aynı DB içinde hiyerarşi için foreign key kullanılabilir:
  parent    Area?    @relation("AreaParent", fields: [parentId], references: [id])
  children  Area[]   @relation("AreaParent")
}
```

---

## 3. EquipmentDB (Ekipman Yönetimi)

```prisma
// modules/equipment/database/schema.prisma

model Equipment {
  id           String   @id @default(uuid())
  areaId       String?  // DİKKAT: AreaDB'deki Area tablosuna API referansıdır, Foreign Key YOKTUR.
  name         String
  type         String?
  brand        String?
  model        String?
  serialNumber String?
  status       String   @default("Operasyonel")
  installDate  DateTime?
  warrantyEnd  DateTime?
  hourMeter    Float    @default(0)
  photoUrl     String?
  specs        Json     @default("{}")
  notes        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  deletedAt    DateTime?
}
```

---

## 4. FaultDB (Arıza Bildirim)

```prisma
// modules/fault/database/schema.prisma

model Fault {
  id          String      @id @default(uuid())
  title       String
  areaId      String?     // API Referansı -> AreaDB
  equipmentId String?     // API Referansı -> EquipmentDB
  apartmentId String?     // API Referansı -> Core/ApartmentDB
  priority    FaultPriority @default(NORMAL)
  status      FaultStatus   @default(OPEN)
  description String?
  reporterId  String?     // API Referansı -> CoreDB (User)
  photoUrl    String?
  voiceUrl    String?
  resolvedAt  DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?
}

enum FaultPriority {
  CRITICAL
  HIGH
  NORMAL
  LOW
}

enum FaultStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}
```

---

## 5. MeterDB (Sayaç Okuma)

```prisma
// modules/meter/database/schema.prisma

model Meter {
  id           String   @id @default(uuid())
  equipmentId  String?  // API Referansı -> EquipmentDB
  areaId       String?  // API Referansı -> AreaDB
  meterType    String
  currentValue Float
  activeVal    Float    @default(0)
  reactiveVal  Float    @default(0)
  capacitiveVal Float   @default(0)
  unit         String   @default("kWh")
  photoUrl     String?
  loggedAt     DateTime @default(now())
}
```

---

# Modüller Arası İletişim Stratejisi (Veritabanı Katmanı)

Modüller birbirlerinin verilerine doğrudan `join` sorgusu atamazlar. 
Bunun yerine API Gateway veya Modül Servisleri kullanılır:

Örnek (Arıza modülünün Arıza Detayını getirirken Ekipman bilgisini alması):
1. `FaultDB`'den Arıza (Fault) kaydı okunur. (örn. `equipmentId: "123-abc"`)
2. `Equipment` API'sine istek atılır: `GET /api/equipment/123-abc`
3. Dönen sonuçlar birleştirilerek (Aggregation) frontend'e sunulur.

---

# Soft Delete Stratejisi

Tüm kritik tablolarda `deletedAt` alanı bulunur.

Prisma middleware veya Prisma Client Extension ile tüm sorgulara otomatik `WHERE deletedAt IS NULL` eklenir.

Fiziksel silme yalnızca sistem yöneticisi tarafından manuel yapılabilir.

---

# Migration Kuralları

Her modül kendi migration geçmişine sahiptir.

```bash
# Alan modülü için migration oluştur
cd modules/area
npx prisma migrate dev --name init

# Equipment modülü için migration oluştur
cd modules/equipment
npx prisma migrate dev --name init
```
