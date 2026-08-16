# Service Module — Servis Firmaları Modülü

Version: 1.0  
Status: Approved

---

# Amaç

Tesis ekipmanlarının bakım ve onarımını yapan servis firmalarının rehberi.

---

# Kullanıcı Rolleri

| Rol | Yetki |
|---|---|
| ADMIN | Tam erişim |
| TECHNICAL | Görüntüle, oluştur, güncelle |
| Diğer | ❌ |

---

# Veri Modeli

```typescript
interface Service {
  id: string;
  brand: string;          // 'WILO', 'Aksa', 'Grundfos'
  serviceName: string;    // Firma adı
  phone1: string;
  phone2?: string;
  email?: string;
  contactPerson?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

# Sayfalar

## Servis Listesi (`/services`)

- Marka bazlı sıralama
- Arama (marka, firma adı)
- Hızlı arama (sesli komut ile)

## Servis Formu

| Alan | Tip | Zorunlu |
|---|---|---|
| Marka | Text | ✅ |
| Firma / Servis Adı | Text | ✅ |
| Telefon 1 | Tel | ✅ |
| Telefon 2 | Tel | ❌ |
| E-posta | Email | ❌ |
| İlgili Kişi | Text | ❌ |
| Adres | Text | ❌ |
| Özel Notlar | Textarea | ❌ |

---

# Sesli Komut Entegrasyonu

"WILO servisi" → Sesli asistan WILO servis bilgisini seslendirir.

---

# Hızlı İletişim

- Telefon numarasına tıklama → direkt arama
- WhatsApp ile paylaşım

---

# API Endpoint'leri

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/services` | GET | Servis listesi |
| `/api/services` | POST | Yeni servis |
| `/api/services/:id` | GET | Servis detayı |
| `/api/services/:id` | PUT | Güncelle |
| `/api/services/:id` | DELETE | Sil (soft) |

---

# Socket.IO Olayları

| Olay | Açıklama |
|---|---|
| `service:created` | Yeni servis |
| `service:updated` | Servis güncellendi |
