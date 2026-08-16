# Website — Kurumsal Web Sitesi

Version: 2.0  
Status: Completed (Tamamlandı - `web/` klasöründe Next.js + React + Tailwind CSS ile tamamlandı)

---

# Amaç

Bu doküman TerraceFeri Rezidans'ın kurumsal web sitesini tanımlar.

Web sitesi; mevcut sakinlere, potansiyel kiracı / alıcılara ve kamuoyuna yönelik **lüks rezidans vitrini** olarak tasarlanacaktır.

Klasik bir apartman sitesi değil; premium bir yaşam alanı deneyimi sunmak öncelikli hedeftir.

---

# Proje Bilgileri

| Bilgi | Değer |
|---|---|
| Proje Adı | TerraceFeri Rezidans |
| Konum | Feriköy, Şişli / İstanbul |
| Adres | Yay Meydanı Caddesi No:15, 34377 Şişli / İstanbul |
| İnşaat Firması | İnanlar |
| Proje Durumu | Satışı tamamlanmış, yaşam devam ediyor |

---

# Hedef Kitle

- Aileler
- Beyaz yakalı çalışanlar
- Şehir merkezinde yaşamak isteyenler
- Yatırımcılar

---

# URL Yapısı

```
https://terraceferi.com/              → Ana Sayfa
https://terraceferi.com/hakkimizda   → Hakkımızda
https://terraceferi.com/galeri        → Galeri
https://terraceferi.com/sosyal-alanlar → Sosyal Alanlar
https://terraceferi.com/konum         → Konum
https://terraceferi.com/iletisim      → İletişim
```

---

# Sayfalar

## 1. Ana Sayfa (/)

### Hero Bölümü

- Tam ekran arka plan (video veya yüksek çözünürlüklü drone fotoğrafı)
- Başlık: **"Şişli'nin Kalbinde Modern Yaşam"**
- Alt başlık: "Feriköy'ün prestijli noktasında, İstanbul'un merkezinde yaşamanın ayrıcalığı"
- CTA Butonları:
  - "Galeriyi Keşfet"
  - "Bize Ulaşın"
- Scroll-down ok animasyonu

### İstatistik Bölümü (Animasyonlu Sayaçlar)

| Sayaç | Değer |
|---|---|
| Yıllardır Hizmet | Aktif |
| Ortak Sosyal Tesis | 13+ |
| 7/24 Güvenlik | ✅ |
| Merkezi Isıtma | ✅ |

### Öne Çıkan Özellikler (Kart Grid)

- 🏊 Kapalı Yüzme Havuzu
- 💪 Fitness Salonu
- 🧖 Sauna (Bay / Bayan)
- 🛡️ 7/24 Güvenlik
- 🔥 Merkezi Isıtma
- 🚗 Kapalı Otopark

### Konum Özeti

- Kısa metin: "Taksim'e 5 dakika, İstanbul'un her noktasına kolay ulaşım"
- Mini harita önizlemesi
- "Konuma Git" butonu

### Hızlı İletişim

- Telefon
- E-posta
- İletişim Formu (kısa versiyon)

---

## 2. Hakkımızda (/hakkimizda)

### Proje Hikayesi

- TerraceFeri Rezidans'ın doğuşu
- İnanlar inşaat firmasının vizyonu
- Feriköy'ün dönüşümündeki rolü

### Konum Anlatımı

- Feriköy, Şişli / İstanbul
- İstanbul'un merkezinde konumlanma avantajı
- Çevrenin sunduğu yaşam kalitesi

### Mimari Yaklaşım

- Modern mimari dil
- Kaliteli malzeme kullanımı
- Yaşam kalitesine yönelik tasarım

### Yaşam Konsepti

- "Şehrin merkezinde huzurlu bir ada"
- Premium ortak alanlar
- Güvenli ve konforlu yaşam

### İnşaat Firması

- İnanlar — kurumsal güvence mesajı

---

## 3. Galeri (/galeri)

### Kategoriler (Tab/Filtre)

| Kategori | İçerik |
|---|---|
| Dış Cephe | Binanın dış görünümü, giriş |
| İç Mekan | Ortak alanlar, lobi |
| Havuz | Kapalı yüzme havuzu |
| Fitness | Spor salonu görselleri |
| Sauna | Bay / Bayan sauna |
| Otopark | Kapalı otopark |
| Ortak Alanlar | Diğer sosyal alanlar |

### Görünüm

- Masonry grid veya lightbox galeri
- Görsel üzerine gelindiğinde büyütme efekti
- Lightbox ile tam ekran görüntüleme
- Mobilde swipe desteği

---

## 4. Sosyal Alanlar (/sosyal-alanlar)

Her tesis kart şeklinde sunulur.

### Tesis Listesi

| İkon | Tesis | Açıklama |
|---|---|---|
| 🏊 | Kapalı Yüzme Havuzu | Isıtmalı, tam donanımlı |
| 💪 | Fitness Salonu | Modern ekipmanlarla donatılmış |
| 🧖‍♂️ | Bay Sauna | Özel, ferah ortam |
| 🧖‍♀️ | Bayan Sauna | Özel, ferah ortam |
| 🚗 | Kapalı Otopark | Güvenli, kapalı araç parkı |
| 🛡️ | 7/24 Güvenlik | Kesintisiz güvenlik hizmeti |
| 🛗 | Asansör | Modern yük ve yolcu asansörü |
| ⚡ | Jeneratör | Kesintisiz elektrik güvencesi |
| 🔥 | Merkezi Isıtma | Konforlu ısınma sistemi |
| 🌡️ | Isı Pay Ölçer | Bireysel kullanım takibi |
| 🚨 | Yangın Güvenlik Sistemi | Tam donanımlı yangın önlemi |
| 💧 | Su Deposu + Hidrofor | Kesintisiz su tesisatı |
| 🔧 | Teknik Servis Hizmeti | Yerinde teknik destek |

---

## 5. Konum (/konum)

### Harita

- Google Maps iframe (Yay Meydanı Caddesi No:15, 34377 Şişli / İstanbul)
- Yakın noktaları gösteren pin'ler

### Yakın Noktalar (Kategorili)

**Alışveriş & Eğlence**
- Cevahir AVM
- City's AVM
- İstiklal Caddesi
- Nişantaşı

**Ulaşım Merkezi**
- Taksim
- Mecidiyeköy
- Metro hatları
- Otobüs güzergahları

**Eğitim**
- İstanbul Bilgi Üniversitesi
- Beykent Üniversitesi

### Mesafe Tablosu

| Nokta | Tahmini Süre |
|---|---|
| Taksim | ~5 dk |
| Nişantaşı | ~5 dk |
| Mecidiyeköy | ~5 dk |
| Cevahir AVM | ~5 dk |
| İstiklal Caddesi | ~10 dk |

---

## 6. Duyurular (/duyurular)

Yönetim panelinden yayınlanan duyurular burada görüntülenir.

### Duyuru Tipleri

| Tip | Açıklama |
|---|---|
| Aidat | Aidat bilgilendirmeleri |
| Su Kesintisi | Planlı / acil su kesintisi |
| Elektrik Kesintisi | Planlı / acil elektrik kesintisi |
| Toplantı | Kat malikleri / yönetim toplantıları |
| Bakım | Periyodik bakım çalışmaları |
| Genel | Diğer duyurular |

### Görünüm

- Kart listesi (tarih, başlık, tip rozeti, özet)
- Detay sayfası (tam metin)
- Sayfalama
- Tip bazlı filtre

### Erişim

- Herkese açık (public) — giriş gerekmez
- Yönetim panelinden yayınlanır (`/admin/announcements`)

---

## 7. İletişim (/iletisim)

### Bilgiler

| Bilgi | Değer |
|---|---|
| Adres | Yay Meydanı Caddesi No:15, 34377 Şişli / İstanbul |
| Konum | Feriköy, Şişli |

### Google Maps

- Tam ekran harita gömüsü
- "Yol Tarifi Al" butonu (Google Maps deep link)

### İletişim Formu

| Alan | Tip | Zorunlu |
|---|---|---|
| Ad Soyad | Text | ✅ |
| Telefon | Tel | ✅ |
| E-posta | Email | ✅ |
| Konu | Select | ✅ |
| Mesaj | Textarea | ✅ |

**Konu seçenekleri:**
- Genel bilgi
- Kiralık daire
- Sakin başvurusu
- Şikayet / öneri
- Diğer

---

# Tasarım Sistemi

## Konsept

Lüks rezidans vitrini — premium yaşam deneyimi.

## Renk Paleti

| Renk | Kullanım | Değer |
|---|---|---|
| Koyu Gri (Ana Arka Plan) | Sayfa arka planı | `#0f0f0f` |
| Orta Gri | Bölümler arası | `#1a1a1a` |
| Beyaz | Ana metin | `#ffffff` |
| Altın (Vurgu) | Başlıklar, CTA, dekor | `#c9a84c` |
| Altın Açık | Hover durumu | `#e8c97a` |
| Cam Beyaz | Glassmorphism kartlar | `rgba(255,255,255,0.05)` |

## Tipografi

| Kullanım | Font | Ağırlık |
|---|---|---|
| Ana Başlık | Cormorant Garamond (serif) | 300–400 |
| Alt Başlıklar | Inter | 400–600 |
| Body Text | Inter | 400 |
| Etiketler / Rozetler | Inter | 500–600 |

> Google Fonts — `next/font` ile optimize edilir.

## Efektler

| Efekt | Kullanım |
|---|---|
| Glassmorphism | Kart bileşenleri (`backdrop-blur`, `bg-white/5`) |
| Gradient Overlay | Hero bölümü video/görsel üzeri |
| Animasyonlu Sayaçlar | Ana sayfada istatistikler |
| Smooth Scroll | Sayfa içi bölüm geçişleri |
| Hover Lift | Kartlar üzerine gelindiğinde yükselme efekti |
| Fade-In on Scroll | Bölümler görünüme girdiğinde belirme |
| Parallax | Hero arkaplan hafif parallax kaydırma |

## Responsive Davranış

| Ekran | Navbar | Hero | Kart Grid | Galeri |
|---|---|---|---|---|
| Masaüstü (≥1280px) | Yatay menü | Tam ekran video | 3 sütun | 4 sütun masonry |
| Tablet (768–1279px) | Yatay + küçük | Tam ekran | 2 sütun | 3 sütun |
| Mobil (<768px) | Hamburger drawer | Tam ekran görsel | 1 sütun | 2 sütun |

---

# Bileşenler

## Navbar

- Logo (sol)
- Menü linkleri (orta — masaüstü)
- "Sakin Girişi" butonu (sağ)
- Mobilde hamburger menü → drawer
- Sayfa kaydırıldığında `backdrop-blur` ile donuk arka plan

## Footer

- Logo + kısa açıklama
- Hızlı linkler
- Adres: Yay Meydanı Caddesi No:15, 34377 Şişli / İstanbul
- © TerraceFeri Rezidans — Tüm hakları saklıdır

## Hero

- Tam ekran (100vh)
- Video veya yüksek çözünürlüklü görsel arka plan
- Koyu gradient overlay (`rgba(0,0,0,0.55)`)
- Ortalanmış metin bloğu
- CTA butonları (altın renkli + outline)
- Aşağı ok animasyonu

---

# SEO

| Sayfa | Title | Description |
|---|---|---|
| Ana Sayfa | TerraceFeri Rezidans — Şişli'nin Kalbinde Modern Yaşam | Feriköy, Şişli'de lüks rezidans yaşamı. Kapalı havuz, fitness, sauna ve daha fazlası. |
| Hakkımızda | Hakkımızda — TerraceFeri Rezidans | TerraceFeri Rezidans projesi hakkında bilgi alın. |
| Galeri | Galeri — TerraceFeri Rezidans | Kapalı havuz, fitness, sauna ve ortak alanların fotoğrafları. |
| Konum | Konum — TerraceFeri Rezidans | Yay Meydanı Caddesi No:15, Şişli. Taksim ve Nişantaşı'na yakın. |
| Duyurular | Duyurular — TerraceFeri Rezidans | Yönetimden güncel duyurular. |
| İletişim | İletişim — TerraceFeri Rezidans | Bize ulaşın. |

- Open Graph tag'leri (tüm sayfalar)
- Structured Data — `LocalBusiness` ve `Residence` JSON-LD
- `sitemap.xml` otomatik oluşturulur
- `robots.txt` yapılandırılır

---

# Performans

- Next.js Static Generation (SSG) — tüm statik sayfalar
- Duyurular: Incremental Static Regeneration (ISR, 60 sn revalidate)
- `next/image` ile görsel optimizasyonu (WebP, lazy load)
- `next/font` ile font optimizasyonu
- Dynamic import ile Harita bileşeni lazy load
- Suspense boundaries
- Core Web Vitals hedefi: Yeşil (LCP < 2.5s, CLS < 0.1)

---

# Güvenlik

- HTTPS zorunlu
- CSP Headers (`next.config.js`)
- reCAPTCHA v3 (iletişim formu)
- Input sanitizasyonu (Zod validation)
- Rate limiting (iletişim formu API)

---

# API Endpoint'leri

| Endpoint | Metod | Açıklama | Auth |
|---|---|---|---|
| `/api/announcements` | GET | Yayınlanan duyuruları listele | ❌ Public |
| `/api/announcements/:id` | GET | Duyuru detayı | ❌ Public |
| `/api/contact` | POST | İletişim formu gönder | ❌ Public |

---

# Veritabanı — Duyuru Modeli

Web sitesi duyurular sayfası yönetim panelinden beslenir.

```
/admin/announcements  →  Yönetici duyuru oluşturur
         │
         ▼ (isPublished: true)
/duyurular  →  Web sitesinde görüntülenir
```

```prisma
model Announcement {
  id          String           @id @default(uuid())
  title       String
  body        String
  type        AnnouncementType
  isPublished Boolean          @default(false)
  publishedAt DateTime?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  deletedAt   DateTime?
}

enum AnnouncementType {
  AIDAT
  SU_KESINTISI
  ELEKTRIK_KESINTISI
  TOPLANTI
  BAKIM
  GENEL
}
```
