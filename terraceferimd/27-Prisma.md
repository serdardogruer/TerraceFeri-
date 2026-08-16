# Prisma ORM (Modüler Mimari)

Version: 2.0  
Status: Approved

---

# Amaç

Bu doküman Prisma ORM kullanım kurallarını ve **modüler mimari** konfigürasyonunu tanımlar.
Sistemdeki her modül bağımsız bir veritabanına sahip olduğu için, Prisma yapılandırması da her modül için ayrı ayrı gerçekleştirilir.

---

# Kurulum

```bash
npm install prisma @prisma/client
```

Her modül için ayrı bir `prisma` klasörü oluşturulur:
```bash
cd apps/tmm/modules/area
npx prisma init
```

---

# Konfigürasyon

Her modül kendi `schema.prisma` dosyasını kullanır.

```prisma
// modules/area/database/schema.prisma

generator client {
  provider = "prisma-client-js"
  // Modüle özel Prisma istemcisinin çıkarılacağı yer (çakışmaları önlemek için)
  output   = "../../../node_modules/@prisma-clients/area"
}

datasource db {
  provider = "postgresql"
  url      = env("AREA_DATABASE_URL")
}
```

```env
# .env
AREA_DATABASE_URL="postgresql://user:password@localhost:5432/area_db?schema=public"
FAULT_DATABASE_URL="postgresql://user:password@localhost:5432/fault_db?schema=public"
```

---

# Client Kullanımı

Her modül kendi veritabanı bağlantısını kendi `client.ts` veya `db.ts` dosyasında yönetir.

```typescript
// modules/area/database/client.ts

import { PrismaClient } from '@prisma-clients/area';

const globalForAreaPrisma = globalThis as unknown as {
  prismaArea: PrismaClient | undefined;
};

export const areaDb =
  globalForAreaPrisma.prismaArea ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForAreaPrisma.prismaArea = areaDb;
}
```

---

# Migration Komutları

Migration işlemleri her modül için kendi klasörü içinde çalıştırılmalıdır.

```bash
# Alan (Area) modülünde migration
cd modules/area
npx prisma migrate dev --name init --schema=./database/schema.prisma

# Client güncelle (Tüm modüller için ayrı ayrı veya merkezi bir script ile)
npx prisma generate --schema=./database/schema.prisma
```

---

# CRUD Örnekleri ve Veri Entegrasyonu

Modüller arası foreign key KULLANILMADIĞI için, ilişkili veriler Prisma (`include: {...}`) ile doğrudan getirilemez. Bunun yerine API veya servisler üzerinden birleştirilir (Aggregation).

## Listeleme (Modüller Arası Veri Birleştirme)

```typescript
// Fault Module - faultService.ts

export async function getFaults() {
  // 1. FaultDB'den kayıtları getir
  const faults = await faultDb.fault.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  // 2. İlgili modüllerin API'lerinden (veya servislerinden) verileri çek ve birleştir
  const enrichedFaults = await Promise.all(faults.map(async (fault) => {
    let areaData = null;
    if (fault.areaId) {
       areaData = await areaService.getAreaById(fault.areaId); // Veya fetch('/api/areas/...')
    }
    return {
      ...fault,
      area: areaData
    };
  }));

  return enrichedFaults;
}
```

## Oluşturma

```typescript
const fault = await faultDb.fault.create({
  data: {
    title,
    areaId, // String ID olarak kaydedilir
    priority: 'CRITICAL',
    status: 'OPEN',
    reporterId: user.id, // String ID olarak kaydedilir
  },
});
```

---

# Hata Yönetimi

```typescript
import { Prisma } from '@prisma-clients/area'; // Modülün kendi client'ından import edilir

try {
  await areaDb.area.create({ data });
} catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2002') {
      throw new Error('Bu kayıt zaten mevcut.');
    }
  }
  throw e;
}
```
