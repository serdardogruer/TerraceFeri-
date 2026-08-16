# Calendar Module — Takvim Modülü

Version: 1.0  
Status: Approved

---

# Amaç

Bakım, görev ve etkinliklerin takvim üzerinde görselleştirilmesi.

---

# Kullanıcı Rolleri

| Rol | Yetki |
|---|---|
| ADMIN | Tam erişim |
| TECHNICAL | Görüntüle, oluştur |
| CLEANING | Sadece kendi görevleri |
| SECURITY | Sadece kendi görevleri |

---

# Veri Kaynakları

Takvim aşağıdaki modüllerden veri çeker:

- Görevler (`tasks`)
- Bakımlar (`tasks` - recurrence)
- Arızalar (oluşturma / çözüm tarihleri)

---

# Görünümler

| Görünüm | Açıklama |
|---|---|
| Aylık | Genel bakış |
| Haftalık | Detaylı planlama |
| Günlük | Bugünün işleri |
| Ajanda | Liste formatı |

---

# Takvim Öğeleri

| Tür | Renk |
|---|---|
| Bakım | Mavi |
| Görev | Yeşil |
| Acil Arıza | Kırmızı |
| Diğer Arıza | Turuncu |

---

# Özellikler

- Drag & Drop ile tarih değiştirme
- Tıklama ile detay görüntüleme
- Yeni öğe oluşturma
- Filtreler: Tip, Atanan, Alan

---

# API Endpoint'leri

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/calendar` | GET | Belirtilen tarih aralığı |

Query parametreler:
- `start` — Başlangıç tarihi
- `end` — Bitiş tarihi
- `type` — Filtre tipi

---

# Bileşen

Shadcn/ui Calendar + özel grid yapısı kullanılacaktır.
