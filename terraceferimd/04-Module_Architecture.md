# Module Architecture

Version: 1.0

---

# Amaç

TerraceFeri Rezidans Yönetim Sistemi tamamen modüler olarak geliştirilecektir.

Her özellik bağımsız bir modül olacaktır.

Modüller;

- kurulabilir
- kaldırılabilir
- devre dışı bırakılabilir
- güncellenebilir

olmalıdır.

---

# Genel Mimari

```
TerraceFeri
    ↓
Website
    ↓
Authentication
    ↓
Kullanıcı Panelleri
    ↓
TMM Core
    ↓
Modules
```

---

# Kullanıcı Panelleri

## Yönetim Paneli

- Web
- Android

---

## Daire Sakini Paneli

- Web
- Android

---

## Personel Paneli

Alt Roller

- 
- Admin
- Yönetim

- Teknik
- Temizlik
- Güvenlik

Platformlar

- Web
- Android

---

# TMM Core

TMM Core;

uygulamanın çekirdeğidir.

Hiçbir iş modülü doğrudan birbirine bağlı değildir.

Tüm modüller TMM Core üzerinden haberleşir.

---

# TMM Core Bileşenleri

| Bileşen | Açıklama |
|---|---|
| Authentication | Kimlik doğrulama |
| Authorization (RBAC) | Rol tabanlı yetkilendirme |
| Dashboard Engine | Modüllerden veri toplayan merkez |
| Module Manager | Modül yükleme/kaldırma yönetimi |
| API Gateway | Merkezi API katmanı |
| Notification Engine | Bildirim merkezi |
| Realtime Engine | Socket.IO gerçek zamanlı iletişim |
| File Manager | Dosya yükleme ve yönetimi |
| Settings | Sistem ayarları |
| Audit Log | Tüm işlem kayıtları |
| Shared Services | Ortak servisler |
| Shared Components | Ortak UI bileşenleri |
| Database Layer | Veritabanı erişim katmanı |

---

# Modül Klasör Yapısı

Her modül aşağıdaki standart klasör yapısını kullanacaktır.

```
Module/
├── frontend/
├── backend/
├── api/
├── database/
├── services/
├── hooks/
├── components/
├── types/
├── utils/
├── socket/
├── permissions/
├── tests/
├── docs/
└── README.md
```

---

# Modül Kuralları

Bir modül;

başka bir modülün

koduna **erişemez**.

İletişim yalnızca;

- API
- Events
- Socket
- Shared Services

üzerinden yapılacaktır.

---

# Veritabanı İzolasyonu

Her modül;

- Kendi bağımsız veritabanına sahiptir (örn: AreaDB, FaultDB).
- Kendi Prisma şemasını barındırır.
- Başka bir modülün veritabanına doğrudan (foreign key) bağlanamaz.
- İlişkisel veriler, ID (string) olarak saklanır ve ihtiyaç duyulduğunda API üzerinden çekilir.

---

# Zorunlu Modüller

| Modül | Açıklama |
|---|---|
| Daire Yönetimi | Daire Sakini bilgileri | Arıza bildirim  |
| Alanlar Yönetimi | Tesisdeki Teknik odalar, İçindeki ekipmanların takibi |
| Ekipmanlar Yönetimi | Tesisde Kullanılan Tüm ekipmanların takibi  |
| Servisler Yönetimi | Tesise Gelen Tüm Servislerin Bilgileri |
| Bakım Yönetimi | Periyodik bakım planlaması |
| Görev Yönetimi | Zamanlanmış görevler |
| Sayaç Yönetimi | Elektrik, su, gaz sayaçları |
| Malzeme Yönetimi | Stok ve satın alma |
| Servis Yönetimi | Servis firmaları rehberi |
| Takvim | Planlama ve hatırlatmalar |
| Raporlama | Dönemsel raporlar |
| Bildirim Merkezi | Tüm bildirimler |
| Personel Yönetimi | Personel bilgileri ve görevleri |
| Dosya Yönetimi | Döküman ve fotoğraflar |

---

# Opsiyonel Modüller

- AI Assistant
- Muhasebe
- Enerji Yönetimi
- Akıllı Bina
- QR Yönetimi
- NFC
- Barkod
- Ziyaretçi
- Araç Takibi
- Kargo Yönetimi
- Rezervasyon
- Aidat Yönetimi

---

# Module Manager

Module Manager;

sistemde yüklü modülleri yönetir.

Görevleri

- Modül yükleme
- Modül kaldırma
- Modül güncelleme
- Modül etkinleştirme
- Modül devre dışı bırakma
- Modül bağımlılıklarını kontrol etme

---

# Shared Components

Tüm ortak arayüzler

Shadcn/ui

üzerinde geliştirilecektir.

---

# Shared Services

| Servis | Açıklama |
|---|---|
| API | HTTP istek yönetimi |
| Socket | Socket.IO bağlantı yönetimi |
| Helpers | Yardımcı fonksiyonlar |
| Utilities | Genel araçlar |
| Date | Tarih işlemleri (date-fns) |
| Storage | Dosya işlemleri |
| Notification | Bildirim gönderimi |
| Permission | Yetki kontrolü |

---

# Dashboard Engine

Dashboard;

modüllerden gelen verileri toplar.

Her modül Dashboard'a widget ekleyebilir.

---

# Notification Engine

Merkezi bildirim sistemi.

Destekler;

- Web
- Mobil
- Socket
- İleride Push Notification

---

# Realtime Engine

Socket.IO

Gerçek zamanlı senkronizasyon.

---

# Yetkilendirme

Her modül;

hangi rollerin erişebileceğini

kendisi tanımlar.

---

# Modül Yaşam Döngüsü

```
Install
    ↓
Register
    ↓
Initialize
    ↓
Run
    ↓
Update
    ↓
Disable
    ↓
Uninstall
```

---

# Gelecek

İleride;

- Marketplace
- Plugin Store
- Üçüncü Parti Modüller

desteklenecektir.

---

# Sonuç

Bu mimari sayesinde sistem;

- büyüyebilir
- yönetilebilir
- sürdürülebilir
- yeniden kullanılabilir

bir yapıya sahip olacaktır.
