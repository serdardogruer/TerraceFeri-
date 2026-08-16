# Roadmap — Yol Haritası

Version: 2.0  
Status: Aktif Geliştirme

---

# Mevcut Durum (v2.0 Güncel)

- **[x] Kurumsal Web Sitesi**: Next.js 16 + React 19 + Tailwind CSS v4 (`web/` projesi tamamlandı).
- **[ ] TMM Core & Paneller**: Planlama aşamasında, veritabanı ve API altyapısı geliştirilecek.

---

# Faz 1 — Kurumsal Web Sitesi (TAMAMLANDI)

- [x] Next.js App Router ile Kurumsal Web Sitesi mimarisi (`web/`)
- [x] Ana Sayfa (`/`) - Hero, İstatistikler, Hizmetler, Galeri Önizleme, Hızlı İletişim
- [x] Hakkımızda Sayfası (`/hakkimizda`) - Proje hikayesi, mimari detaylar ve değerler
- [x] Galeri Sayfası (`/galeri`) - Yüksek çözünürlüklü görsel kataloğu
- [x] Sosyal Alanlar Sayfası (`/sosyal-alanlar`) - Tesis imkanları ve aktivite alanları
- [x] Konum & Ulaşım Sayfası (`/konum`) - Harita entegrasyonu ve ulaşım rehberi
- [x] İletişim Sayfası (`/iletisim`) - İletişim formu ve adres bilgileri
- [x] Duyarlı (Responsive) Mobil Uyumlu UI Tasarımı

---

# Faz 2 — Altyapı ve Veritabanı (YAPILACAKLAR)

## 2.1 — Veritabanı ve ORM
- [ ] PostgreSQL veritabanı kurulumu ve yapılandırması
- [ ] Prisma ORM şeması (User, Role, Apartment, Fault, Maintenance, Meter vb.)
- [ ] Veritabanı çoklu dil (i18n) modelleme altyapısı (JSONB / Translation tabloları)

## 2.2 — Çekirdek Sistem (TMM Core) & API
- [ ] Next.js API Routes & Gateway katmanı
- [ ] JWT + Refresh Token kimlik doğrulama (Authentication)
- [ ] Rol Tabanlı Yetkilendirme (RBAC - Admin, Yönetim, Sakin, Teknik, Temizlik, Güvenlik)
- [ ] Türkçe / İngilizce (TR / EN) i18n altyapısı (`next-intl`)
- [ ] Dark / Light tema seçici yapılandırması

---

# Faz 3 — Kullanıcı Panelleri ve Modüller (YAPILACAKLAR)

## 3.1 — Paneller
- [ ] **Yönetim Paneli**: Tüm tesis operasyonu, sakin ve personel yönetimi
- [ ] **Daire Sakini Paneli**: Arıza kaydı, duyurular, belgeler, bildirimler
- [ ] **Personel Paneli**: Teknik, Temizlik ve Güvenlik görev yönetim ekranları

## 3.2 — Modüller
- [ ] Arıza Modülü (`14-Fault_Module.md`)
- [ ] Bakım / Görev Modülü (`15-Maintenance_Module.md`, `16-Task_Module.md`)
- [ ] Sayaç Okuma & Anormallik Modülü (`17-Meter_Module.md`)
- [ ] Stok / Malzeme Modülü (`18-Inventory_Module.md`)
- [ ] Servis & Firma Rehberi Modülü (`19-Service_Module.md`)
- [ ] Bildirim Merkezi (`20-Notification_Module.md`)
- [ ] Takvim & Etkinlik Modülü (`21-Calendar_Module.md`)
- [ ] Raporlama Modülü (`22-Reports_Module.md`)

---

# Faz 4 — Gerçek Zamanlı Sistem & Mobil (YAPILACAKLAR)

- [ ] Socket.IO ile canlı veri senkronizasyonu ve anlık bildirimler
- [ ] Android APK Mobil Uygulaması (Teknik/Sakin mobil kullanım)

---

# Faz 5 — AI & RAG Entegrasyonu (YAPILACAKLAR)

- [ ] PostgreSQL + pgvector ile RAG mimarisi (`34-RAG_Architecture.md`)
- [ ] AI Tool Calling & Otomasyon (`35-AI_Tools_Integration.md`)

---

# Öncelik Matrisi

| Özellik | Önem | Aciliyet | Durum | Sürüm |
|---|---|---|---|---|
| Kurumsal Web Sitesi | Yüksek | Yüksek | **Tamamlandı** | 1.0 |
| PostgreSQL + Prisma Schema | Yüksek | Yüksek | Bekliyor | 2.0 |
| Auth & RBAC | Yüksek | Yüksek | Bekliyor | 2.0 |
| i18n & Tema Desteği | Yüksek | Orta | Bekliyor | 2.0 |
| Yönetim & Sakin Paneli | Yüksek | Yüksek | Bekliyor | 2.1 |
| Arıza & Bakım Modülü | Yüksek | Yüksek | Bekliyor | 2.2 |
| Socket.IO Realtime | Orta | Orta | Bekliyor | 2.3 |
| Android APK | Orta | Orta | Bekliyor | 2.5 |
| RAG & AI Tools | Orta | Düşük | Bekliyor | 3.0 |

