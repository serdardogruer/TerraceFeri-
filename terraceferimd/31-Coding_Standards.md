# Coding Standards — Kodlama Standartları

Version: 1.0  
Status: Approved

---

# Amaç

TerraceFeri projesinde tüm geliştiricilerin uyması gereken kodlama standartları.

---

# TypeScript

```typescript
// ✅ Doğru
function getFaults(filters: FaultFilters): Promise<Fault[]>

// ❌ Yanlış — any yasak
function getData(params: any): any
```

## Kurallar

- `strict: true` — Zorunlu
- `any` kullanımı — Yasak
- Her fonksiyon dönüş tipi belirtilmeli
- `unknown` kullanıldığında tip daraltılmalı
- Nullish coalescing (`??`) tercih edilmeli

---

# İsimlendirme

| Tür | Format | Örnek |
|---|---|---|
| Component | PascalCase | `FaultCard.tsx` |
| Hook | camelCase + use | `useFaults.ts` |
| Fonksiyon | camelCase | `getFaultById` |
| Sabit | SCREAMING_SNAKE | `MAX_FILE_SIZE` |
| Tip / Interface | PascalCase | `FaultFilters` |
| Dosya | kebab-case | `fault-service.ts` |

---

# Dosya Yapısı

```
components/
├── FaultCard/
│   ├── FaultCard.tsx       ← Bileşen
│   ├── FaultCard.test.tsx  ← Test
│   └── index.ts            ← Export
```

---

# React Kuralları

```typescript
// ✅ Fonksiyonel bileşen
export function FaultCard({ fault }: FaultCardProps) {
  return <div>{fault.title}</div>;
}

// ✅ Named export (default export kaçınılır)

// ✅ Props tipi tanımlanır
interface FaultCardProps {
  fault: Fault;
  onUpdate?: (id: string) => void;
}

// ❌ Gereksiz re-render önlenmeli
// Büyük listeler için useMemo/useCallback
```

---

# API Route Yapısı

```typescript
// app/api/faults/route.ts

export async function GET(request: Request) {
  try {
    const faults = await prisma.fault.findMany({ ... });
    return Response.json({ success: true, data: faults });
  } catch (error) {
    console.error('[FAULT_GET]', error);
    return Response.json({ success: false, error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = faultSchema.parse(body);
    
    const fault = await prisma.fault.create({ data: validated });
    
    // Socket.IO broadcast
    notifyAll('fault:created', fault);
    
    return Response.json({ success: true, data: fault }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ success: false, error: error.errors }, { status: 422 });
    }
    return Response.json({ success: false, error: 'Sunucu hatası' }, { status: 500 });
  }
}
```

---

# Hata Yönetimi

```typescript
// Tüm hatalar yakalanır
try {
  // ...
} catch (error) {
  // Log zorunlu
  console.error('[CONTEXT_ACTION]', error);
  
  // Kullanıcıya anlamlı mesaj
  toast.error('İşlem başarısız oldu. Lütfen tekrar deneyin.');
}
```

---

# Yorum ve Dokümantasyon

```typescript
// ✅ Açıklayıcı JSDoc (gerektiğinde)
/**
 * Belirtilen ID'ye sahip arızayı getirir.
 * @param id - Arıza UUID'si
 * @returns Arıza nesnesi veya null
 */
export async function getFaultById(id: string): Promise<Fault | null>

// ❌ Gereksiz yorum
// i'yi 1 artır
i++;
```

---

# Import Sırası

```typescript
// 1. React/Next.js
import React from 'react';
import { NextRequest } from 'next/server';

// 2. Üçüncü parti
import { z } from 'zod';
import { format } from 'date-fns';

// 3. Proje bileşenleri
import { Button } from '@/components/ui/button';

// 4. Yerel dosyalar
import { prisma } from '@/lib/prisma';
import type { Fault } from '@/types/fault.types';
```

---

# ESLint & Prettier

```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

# Git Commit Standartları

```
feat: Yeni özellik
fix: Hata düzeltme
docs: Dokümantasyon
style: Kod formatı
refactor: Yeniden yapılandırma
test: Test ekleme
chore: Konfigürasyon
```

Örnekler:
```
feat: Arıza ses kaydı desteği eklendi
fix: Sayaç raporu fotoğraf sütunu kaldırıldı
docs: 14-Fault_Module.md güncellendi
```

---

# Tamamlama Kontrol Listesi

Her PR öncesi kontrol et:

- [ ] TypeScript hata yok (`tsc --noEmit`)
- [ ] ESLint hata yok (`eslint .`)
- [ ] Prettier uygulandı
- [ ] Test çalışıyor
- [ ] Responsive kontrol edildi
- [ ] Dark mode kontrol edildi
- [ ] Socket.IO broadcast yapıldı (gerekiyorsa)
- [ ] PRD güncellendi (gerekiyorsa)
