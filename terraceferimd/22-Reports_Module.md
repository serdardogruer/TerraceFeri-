# Reports Module — Raporlama Modülü

Version: 1.0  
Status: Approved

---

# Amaç

Tesis yönetimine ait tüm verilerin raporlanması ve dışarı aktarılması.

---

# Kullanıcı Rolleri

| Rol | Yetki |
|---|---|
| ADMIN | Tüm raporlar |
| TECHNICAL | Teknik raporlar |
| Diğer | ❌ |

---

# Rapor Türleri

## 1. Günlük 18:00 Yönetim Raporu

- **Tetikleyici**: Her gün saat 18:00 otomatik veya manuel
- **İçerik**:
  - Bugün oluşturulan arızalar
  - Çözülen arızalar
  - Tamamlanan görevler
  - Bekleyen görevler
  - Son sayaç okumaları
- **Format**: A4 dikey, yazdırılabilir PDF

## 2. Sayaç A4 Raporu

- **İçerik**: Dönemsel sayaç verileri tablosu
- **Sütunlar**: Tarih, Saat, Elk. Aktif, Reaktif, Kapasitif, Doğalgaz, Su Daireler, Su Dükkanlar
- **Format**: A4 dikey, PDF
- **Not**: Fotoğraf sütunu kesinlikle bulunmaz

## 3. Arıza Raporu

- Tarih aralığı, öncelik, durum filtresi
- Özet istatistikler + detay listesi

## 4. Ekipman Raporu

- Ekipman durumu özeti
- Garanti bitiş tarihleri
- Çalışma saatleri

## 5. Stok Raporu

- Kritik stok listesi
- Satın alma talepleri

---

# Dashboard İstatistikler

| Metrik | Açıklama |
|---|---|
| Açık Arıza Sayısı | Bugünkü durum |
| Çözüm Süresi Ort. | Son 30 gün |
| Tamamlanan Görev | Bu hafta |
| Kritik Stok | Mevcut |

---

# Grafik Türleri (Recharts)

- Arıza trend grafiği (çizgi)
- Öncelik dağılımı (pasta)
- Aylık görev tamamlama (çubuk)
- Sayaç tüketim grafiği (alan)

---

# API Endpoint'leri

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/reports/daily` | GET | Günlük 18:00 raporu |
| `/api/reports/meters` | GET | Sayaç raporu |
| `/api/reports/faults` | GET | Arıza raporu |
| `/api/reports/equipment` | GET | Ekipman raporu |
| `/api/reports/inventory` | GET | Stok raporu |
| `/api/reports/export/pdf` | POST | PDF oluştur |

---

# Yazdırma

- `window.print()` ile tarayıcı yazdırma
- CSS `@media print` ile A4 optimizasyonu
- Fotoğraf, sayfa numarası, tarih otomatik eklenir

---

# WhatsApp Paylaşımı

Günlük raporlar WhatsApp şablonu olarak paylaşılabilir.

```
📋 TerraceFeri Günlük Rapor - 29.07.2026
━━━━━━━━━━━━━━━━━━
🔴 Açık Arızalar: 3
✅ Çözülen: 5
📋 Bekleyen Görev: 2
━━━━━━━━━━━━━━━━━━
```
