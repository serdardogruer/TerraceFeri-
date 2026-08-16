# Meter Module — Sayaç Modülü

Version: 1.0  
Status: Approved

---

# Amaç

Elektrik, su ve doğalgaz sayaç okumalarının kaydedilmesi, takibi ve raporlanması.

---

# Kullanıcı Rolleri

| Rol | Yetki |
|---|---|
| ADMIN | Tam erişim |
| TECHNICAL | Okuma ekle, görüntüle |
| Diğer | ❌ |

---

# Veritabanı

Bu modül kendine ait bağımsız **MeterDB** veritabanını ve Prisma şemasını kullanır. 
Diğer modüllere (Alan, Ekipman vb.) ait verilere ihtiyaç duyduğunda, yalnızca ID'lerini referans olarak saklar ve detayları API üzerinden çeker.

---

# Veri Modeli

```typescript
interface Meter {
  id: string;
  equipmentId?: string;
  areaId?: string;
  meterType: string;        // 'Elektrik Aktif', 'Doğalgaz', 'Su Daireler'
  currentValue: number;
  activeVal: number;        // kWh
  reactiveVal: number;      // kVArh
  capacitiveVal: number;    // kVArh
  unit: string;
  photoUrl?: string;
  loggedAt: Date;
}
```

---

# Sayaç Tipleri

Varsayılan tipler (özelleştirilebilir):

| Tip | Birim |
|---|---|
| Elektrik Aktif | kWh |
| Elektrik Reaktif | kVArh |
| Elektrik Kapasitif | kVArh |
| Doğalgaz | m³ |
| Su Daireler | m³ |
| Su Dükkanlar | m³ |

---

# Sayfalar

## Sayaç Listesi (`/meters`)

- Tipe göre gruplandırılmış görünüm
- Son okunan değer
- Önceki değer ve fark
- Anormallik uyarısı (±%40 sapma)
- Sayaç tipi sıralama (sürükle-bırak)

## Sayaç Okuma Formu

| Alan | Tip | Zorunlu |
|---|---|---|
| Sayaç Tipi | Select | ✅ |
| Bağlı Alan | Select | ❌ |
| Bağlı Ekipman | Select | ❌ |
| Anlık Değer | Number | ✅ |
| Elektrik Aktif | Number | ❌ |
| Reaktif | Number | ❌ |
| Kapasitif | Number | ❌ |
| Fotoğraf | Camera/File | ❌ |

---

# Hızlı Sayaç Okuma

Header'daki **"Sayaç Okut"** butonu:
- Kamera ile fotoğraf çekme
- Sayaç tipi seçimi
- Değer girişi
- Tek tıkla kayıt

---

# A4 Baskı Raporu

Sütunlar:

| Tarih | Saat | Elk. Aktif | Elk. Reaktif | Elk. Kapasitif | Doğalgaz | Su Daireler | Su Dükkanlar |

**Kural:** Fotoğraf sütunu raporda **bulunmaz**.

---

# Anormallik Tespiti

Önceki okumaya kıyasla **±%40 sapma** tespit edildiğinde:
- 🚨 Kırmızı uyarı rozeti göster
- Admin'e bildirim gönder

---

# Sayaç Tipi Yönetimi

- Tip ekleme / düzenleme / silme
- Tip sıralaması (sürükle-bırak)
- Tüm kayıtlarıyla birlikte tip silme

---

# API Endpoint'leri

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/meters` | GET | Sayaç listesi |
| `/api/meters` | POST | Yeni okuma |
| `/api/meters/:id` | PUT | Güncelle |
| `/api/meters/:id` | DELETE | Sil |
| `/api/meters/reorder-types` | PUT | Tip sıralama |
| `/api/meters/type/rename` | PUT | Tip yeniden adlandır |
| `/api/meters/type/:name` | DELETE | Tüm tipi sil |

---

# Socket.IO Olayları

| Olay | Açıklama |
|---|---|
| `meter:logged` | Yeni sayaç okuma |
| `meter:updated` | Okuma güncellendi |
| `meter:type:renamed` | Tip adı değişti |
