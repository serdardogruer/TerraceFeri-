# TerraceFeri Rezidans Yönetim Sistemi

> Modern, Modüler ve Gerçek Zamanlı Tesis Yönetim Platformu

---

# Proje Hakkında

TerraceFeri Rezidans Yönetim Sistemi; rezidanslar, siteler, apartmanlar, iş merkezleri ve benzeri yaşam alanlarının tüm operasyonlarını tek bir platform üzerinden yönetebilmek amacıyla geliştirilen modüler bir yazılım sistemidir.

Sistem;

- Yönetim
- Daire Sakini
- Personel
- Mobil Kullanıcılar

için farklı paneller sunarken, tüm bu paneller ortak bir çekirdek sistem (TMM Core) üzerinden çalışmaktadır.

---

# Proje Hedefleri

Bu projenin temel amacı;

- Teknik yönetimi dijitalleştirmek
- Kağıt kullanımını azaltmak
- Gerçek zamanlı veri paylaşımı sağlamak
- Mobil kullanım sunmak
- Modüler büyüyebilen bir yapı oluşturmak
- Tek yazılımla farklı tesis tiplerini desteklemek

---

# Desteklenen Platformlar

- Web
- Android APK
- Tablet
- Bilgisayar

---

# Kullanıcı Tipleri

## Yönetim

Yönetim panelini kullanır.

Yetkileri;

- Tüm sistemi yönetebilir.
- Modül ekleyebilir.
- Kullanıcı oluşturabilir.
- Rapor alabilir.
- Ayarları değiştirebilir.

---

## Daire Sakini

Daire sakini panelini kullanır.

İşlemleri;

- Arıza bildirimi
- Duyurular
- Belgeler
- Bildirimler
- Rezervasyonlar (ileride)

---

## Personel

Personel panelini kullanır.

Alt roller;

- Teknik
- Temizlik
- Güvenlik

Her rol yalnızca kendisine ait ekranları görebilir.

---

# Sistem Mimarisi ve Klasör Yapısı

```text
TerraceFeri Rezidans (Kök Dizin)
│
├── web/ (Kurumsal Web Sitesi - Bağımsız Vitrin Projesi)
│     ├── Ana Sayfa, Hakkımızda, Galeri, Sosyal Alanlar, Konum, İletişim
│
└── tmm/ (TMM Core & Rezidans Yönetim Sistemi Projesi)
      ├── Yönetim Paneli
      ├── Daire Sakini Paneli
      ├── Personel Paneli (Teknik, Temizlik, Güvenlik)
      ├── API Routes & Auth / RBAC
      ├── Prisma ORM & PostgreSQL
      └── Socket.IO Realtime Engine
```

---

# Teknoloji

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Lucide React
- React Hook Form

## Backend

- Next.js API
- Prisma ORM
- PostgreSQL

## Gerçek Zamanlı

- Socket.IO

## Mobil

- Android APK

---

# Proje Yapısı

Bu proje tamamen modüler geliştirilecektir.

Her modül;

- bağımsız
- genişletilebilir
- devre dışı bırakılabilir
- yeniden kullanılabilir

şekilde tasarlanacaktır.

---

# Kodlama Prensibi

Hiçbir modül başka bir modüle bağımlı olmayacaktır.

İletişim;

- API
- Event
- Socket
- Shared Services

üzerinden sağlanacaktır.

---

# UI Standardı

Tüm ekranlarda;

- Shadcn/ui
- Tailwind CSS

kullanılması zorunludur.

Başka UI kütüphaneleri kullanılmayacaktır.

---

# Veritabanı

PostgreSQL

ORM

Prisma

---

# Gerçek Zamanlı

Tüm paneller aynı anda senkronize çalışacaktır.

Bir kullanıcının yaptığı işlem diğer kullanıcılarda anında görüntülenecektir.

---

# Doküman Listesi

| No | Doküman | Açıklama |
|---|---|---|
| 00 | README | Bu dosya |
| 01 | Product_Vision | Vizyon ve misyon |
| 02 | System_Architecture | Sistem mimarisi |
| 03 | Technology_Stack | Teknoloji yığını |
| 04 | Module_Architecture | Modül mimarisi |
| 05 | Database_Architecture | Veritabanı mimarisi |
| 06 | Authentication | Kimlik doğrulama |
| 07 | RBAC | Rol tabanlı yetkilendirme |
| 08 | Website | Kurumsal web sitesi [TAMAMLANDI] |
| 09 | Management_Panel | Yönetim paneli |
| 10 | Resident_Panel | Daire sakini paneli |
| 11 | Personnel_Panel | Personel paneli |
| 12 | TMM_Core | Çekirdek sistem |
| 13 | Module_Manager | Modül yöneticisi |
| 14 | Fault_Module | Arıza modülü |
| 15 | Maintenance_Module | Bakım modülü |
| 16 | Task_Module | Görev modülü |
| 17 | Meter_Module | Sayaç modülü |
| 18 | Inventory_Module | Malzeme modülü |
| 19 | Service_Module | Servis modülü |
| 20 | Notification_Module | Bildirim modülü |
| 21 | Calendar_Module | Takvim modülü |
| 22 | Reports_Module | Raporlama modülü |
| 23 | File_Manager | Dosya yöneticisi |
| 24 | Realtime_System | Gerçek zamanlı sistem |
| 25 | Mobile_App | Mobil uygulama |
| 26 | API | API dokümantasyonu |
| 27 | Prisma | Prisma ORM |
| 28 | PostgreSQL | PostgreSQL veritabanı |
| 29 | Frontend | Frontend mimarisi |
| 30 | Shadcn_UI | Shadcn/ui standardı |
| 31 | Coding_Standards | Kodlama standartları |
| 32 | Roadmap | Yol haritası ve Durum |
| 33 | Deployment | Dağıtım |
| 34 | RAG_Architecture | RAG mimarisi |
| 35 | AI_Tools_Integration | AI araç entegrasyonu |
| -- | eklenecekler | Ek gereksinimler ve i18n/tema standartları |

---

# Lisans

Private Project

Copyright © TerraceFeri

Tüm hakları saklıdır.
