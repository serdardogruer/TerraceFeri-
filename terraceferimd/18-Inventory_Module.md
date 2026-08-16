# Inventory Module — Malzeme / Stok Modülü

Version: 1.0  
Status: Approved

---

# Amaç

Tesisin malzeme ve sarf stok takibi, satın alma talepleri yönetimi.

---

# Kullanıcı Rolleri

| Rol | Yetki |
|---|---|
| ADMIN | Tam erişim |
| TECHNICAL | Görüntüle, oluştur, güncelle, talep aç |
| CLEANING | Görüntüle |
| Diğer | ❌ |

---

# Veri Modeli

## Stok

```typescript
interface Inventory {
  id: string;
  name: string;
  category: string;
  stockQuantity: number;
  unit: string;
  minStockLevel: number;
  locationNotes?: string;
  status: 'Yeterli' | 'Azaldı' | 'Tükendi (Eksik)';
  createdAt: Date;
  updatedAt: Date;
}
```

## Satın Alma Talebi

```typescript
interface PurchaseRequest {
  id: string;
  inventoryId?: string;
  itemName: string;
  requestedQuantity: number;
  unit: string;
  urgency: 'Acil' | 'Normal' | 'Düşük';
  requestedBy: string;
  notes?: string;
  status: 'Talep Edildi' | 'Onaylandı' | 'Temin Edildi' | 'İptal';
  createdAt: Date;
}
```

---

# Stok Durum Otomasyonu

| Koşul | Durum | Renk |
|---|---|---|
| `stockQuantity = 0` | Tükendi (Eksik) | Kırmızı |
| `stockQuantity ≤ minStockLevel` | Azaldı | Turuncu |
| Diğer | Yeterli | Yeşil |

---

# Sayfalar

## Stok Listesi (`/inventory`)

### Filtreler
- Kategori
- Durum (Yeterli, Azaldı, Tükendi)
- Arama (malzeme adı)

### Görünüm
- Dikey liste
- Durum rozeti
- Miktar göstergesi

## Stok Formu

| Alan | Tip | Zorunlu |
|---|---|---|
| Malzeme Adı | Text | ✅ |
| Kategori | Select | ✅ |
| Miktar | Number | ✅ |
| Birim | Select | ✅ |
| Min. Stok | Number | ✅ |
| Konum Notu | Text | ❌ |

## Satın Alma Talebi Formu

| Alan | Tip | Zorunlu |
|---|---|---|
| Malzeme Adı | Text | ✅ |
| Miktar | Number | ✅ |
| Birim | Select | ✅ |
| Aciliyet | Select | ✅ |
| Talep Eden | Text | ✅ |
| Not | Textarea | ❌ |

---

# Kategoriler (Varsayılan)

- Sarf Malzeme
- Elektrik Malzeme
- Boru / Tesisat
- Mekanik Parça
- Temizlik Malzeme
- Güvenlik Ekipmanı
- Ofis Malzeme
- Diğer

---

# API Endpoint'leri

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/inventory` | GET | Stok listesi |
| `/api/inventory` | POST | Yeni stok |
| `/api/inventory/:id` | PUT | Güncelle |
| `/api/inventory/:id` | DELETE | Sil |
| `/api/purchase-requests` | GET | Talep listesi |
| `/api/purchase-requests` | POST | Yeni talep |
| `/api/purchase-requests/:id` | PUT | Durum güncelle |
| `/api/purchase-requests/:id` | DELETE | Sil |

---

# Socket.IO Olayları

| Olay | Açıklama |
|---|---|
| `inventory:created` | Yeni stok |
| `inventory:updated` | Stok güncellendi |
| `purchase_request:created` | Yeni satın alma talebi |

---

# Bildirimler

| Tetikleyici | Alıcı |
|---|---|
| Stok kritik seviyeye düştü | Admin |
| Yeni satın alma talebi | Admin |
