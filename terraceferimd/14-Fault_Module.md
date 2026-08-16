# Fault Module — Arıza Modülü

Version: 1.0  
Status: Approved

---

# Amaç

Tesis içindeki arızaların bildirilmesi, takibi ve çözüme kavuşturulması.

---

# Kullanıcı Rolleri

| Rol | Yetki |
|---|---|
| ADMIN | Tam erişim |
| TECHNICAL | Görüntüle, oluştur, güncelle |
| SECURITY | Görüntüle, oluştur |
| RESIDENT | Yalnızca kendi dairesi |
| CLEANING | ❌ |

---

# Veritabanı

Bu modül kendine ait bağımsız **FaultDB** veritabanını ve Prisma şemasını kullanır. 
Diğer modüllere (Alan, Ekipman vb.) ait verilere ihtiyaç duyduğunda, yalnızca ID'lerini referans olarak saklar ve detayları API üzerinden çeker.

---

# Veri Modeli

```typescript
interface Fault {
  id: string;
  title: string;
  areaId?: string;
  equipmentId?: string;
  apartmentId?: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  description?: string;
  reporterId?: string;
  photoUrl?: string;
  voiceUrl?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

# İş Akışı

```
Arıza Bildirimi
    │
    ▼
Durum: OPEN
    │
    ▼ (Teknik personel üstlenir)
Durum: IN_PROGRESS
    │
    ▼ (Çözüldü işaretlendi)
Durum: RESOLVED
    │
    ▼ (Admin onayı)
Durum: CLOSED
```

---

# Sayfalar

## Liste Sayfası (`/faults`)

### Filtreler
- Durum (Tüm, Açık, İşlemde, Çözüldü)
- Öncelik (Acil, Yüksek, Normal, Düşük)
- Alan
- Tarih Aralığı

### Sıralama
- Oluşturma tarihi (varsayılan: en yeni)
- Öncelik
- Durum

### Görünüm
- Dikey liste
- Her satır: başlık, alan, öncelik rozeti, durum rozeti, tarih

---

## Arıza Formu

| Alan | Tip | Zorunlu |
|---|---|---|
| Başlık | Text | ✅ |
| Bağlı Alan | Select | ❌ |
| Bağlı Ekipman | Select | ❌ |
| Bağlı Daire | Select | ❌ |
| Öncelik | Select | ✅ |
| Açıklama | Textarea | ❌ |
| Fotoğraf | File Upload | ❌ |
| Ses Kaydı | Audio Recorder | ❌ |

---

## Arıza Detay Sayfası

- Arıza bilgileri
- Durum güncelleme butonu
- Fotoğraf / ses kayıtları
- Yorum/not geçmişi (v2)
- Audit log

---

# Öncelik Rozetleri

| Öncelik | Renk |
|---|---|
| CRITICAL (Acil) | Kırmızı |
| HIGH (Yüksek) | Turuncu |
| NORMAL | Sarı |
| LOW (Düşük) | Yeşil |

---

# API Endpoint'leri

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/faults` | GET | Arıza listesi |
| `/api/faults` | POST | Yeni arıza |
| `/api/faults/:id` | GET | Arıza detayı |
| `/api/faults/:id` | PUT | Güncelle |
| `/api/faults/:id` | DELETE | Sil (soft) |

---

# Socket.IO Olayları

| Olay | Açıklama |
|---|---|
| `fault:created` | Yeni arıza oluşturuldu |
| `fault:updated` | Arıza güncellendi |
| `fault:resolved` | Arıza çözüldü |

---

# Bildirimler

| Tetikleyici | Alıcı |
|---|---|
| Yeni arıza (Acil) | Admin + Tüm teknik personel |
| Durum değişikliği | Bildiren kullanıcı |
| Çözüldü | Bildiren kullanıcı + Admin |

---

# Klasör Yapısı

```
modules/fault/
├── frontend/
│   ├── pages/
│   │   ├── FaultListPage.tsx
│   │   ├── FaultDetailPage.tsx
│   │   └── FaultFormPage.tsx
│   └── components/
│       ├── FaultCard.tsx
│       ├── FaultForm.tsx
│       ├── FaultStatusBadge.tsx
│       └── FaultPriorityBadge.tsx
├── api/
│   └── route.ts
├── services/
│   └── faultService.ts
├── types/
│   └── fault.types.ts
└── hooks/
    └── useFaults.ts
```
