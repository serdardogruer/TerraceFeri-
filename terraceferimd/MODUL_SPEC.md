 # TERRA FERI
# Teknik Yönetim Sistemi (TMM)

# MODÜL MİMARİSİ V2.0

---

# Genel Mimari

Sistem tamamen bağımsız modüllerden oluşacaktır.

Her modül;

- Kendi veritabanına (Database) sahip olacaktır.
- Kendi API'sine sahip olacaktır.
- Kendi ekranlarına sahip olacaktır.
- Bağımsız olarak geliştirilecektir.
- Bağımsız olarak sisteme yüklenecektir.
- İstenildiğinde kaldırılabilecektir.
- Güncellenebilecektir.

Modüller birbirine doğrudan bağlı olmayacaktır.

Modüller yalnızca ihtiyaç duydukları verileri diğer modüllerin API'lerinden okuyacaktır.

Bu yapı sayesinde ileride yeni modüller mevcut sistemi bozmadan sisteme eklenebilecektir.

---

# Modül Standartları

Her modülde aşağıdaki standart işlemler bulunacaktır.

- Listele
- Yeni Oluştur
- Düzenle
- Sil
- Kaydet
- Ara
- Filtrele
- Sırala
- Excel Aktar
- PDF Aktar
- Yazdır

Her modülde;

- Fotoğraf yükleme
- PDF yükleme
- Word yükleme
- Excel yükleme
- Video yükleme

özelliği desteklenecektir.

---

# 1. Alan Yönetimi Modülü

## Modül Adı

Alan Yönetimi

---

## Veritabanı

AreaDB

---

## Görev

Site içerisindeki tüm alanları, alt alanları ve ekipmanları yönetmek.

---

## Özellikler

### Alan Yönetimi

- Alan oluştur
- Düzenle
- Sil
- Kaydet

Alan Bilgileri

- Alan Adı
- Alan Kodu
- Blok
- Kat
- Açıklama
- Durum

---

### Alt Alan Yönetimi

Her alan içerisine;

- Alt Alan oluştur
- Düzenle
- Sil
- Kaydet

Örnek

Elektrik Odası

- Ana Pano
- UPS
- Sayaçlar

---

### Ekipman Yönetimi

Alan veya Alt Alan içerisine;

- Yeni ekipman ekle
- Düzenle
- Sil
- Kaydet

---

### Ekipman Kartı

Ekipmana tıklanınca kart açılır.

Kart içerisinde;

- Teknik Bilgiler
- Çalışma Prensibi
- Görevi
- Kullanım Bilgileri
- Pratik Bilgiler
- Olası Arızalar
- Belgeler
- Fotoğraflar
- Servis Bilgileri
- Arıza Geçmişi

bulunacaktır.

---

### Arıza Geçmişi

Her ekipman için;

- Tarih
- Saat
- Arızayı Bildiren
- Açıklama
- Servis Firması
- Servis Tutanağı
- Sonuç

eklenebilecektir.

Servis Firması;

Servis Firmalar Modülünden seçilecektir.

---

### Yönetim Raporu

Kutucuklarla seçilecektir.

☐ Gün Sonu Raporuna Dahil Et

☐ Ay Sonu Raporuna Dahil Et

☐ Yöneticiye Göster

☐ Gizli

---

# 2. Ekipmanlar Modülü

## Veritabanı

EquipmentDB

---

## Görev

Tüm ekipmanların merkezi listesini oluşturmak.

Alan Yönetimi modülünde oluşturulan ekipmanlar burada otomatik listelenir.

---

## Özellikler

- Listele
- Düzenle
- Sil
- Kaydet

---

## Ekipman Kartı

- Teknik Bilgiler
- Çalışma Prensibi
- Görevi
- Kullanım Bilgileri
- Pratik Bilgiler
- Olası Arızalar
- Belgeler
- Fotoğraflar
- Servis Bilgileri
- Arıza Geçmişi

---

## Arıza Geçmişi

- Tarih
- Saat
- Bildiren
- Servis
- Servis Tutanağı
- Açıklama

Servis Firması

Servis Firmalar Modülünden alınacaktır.

---

## Yönetim Raporu

☐ Gün Sonu

☐ Ay Sonu

☐ Yönetici

☐ Gizli

---

# 3. Servis Firmalar Modülü

## Modül Adı

Servis Firmalar

---

## Veritabanı

CompanyDB

---

## Firma Bilgileri

- Firma Unvanı
- Hizmet Türü
- Uzmanlık Alanı
- Yetkili Kişi
- Telefon
- E-Posta
- Web Sitesi
- Sözleşme Durumu
- Sözleşme Tarihi
- Sözleşme Süresi
- Son Servis Tarihi
- Sonraki Bakım Tarihi
- Servis Notları
- Açıklamalar

---

## Firma Listesi

Firmalar kısa bilgilerle listelenir.

Tıklanınca firma kartı açılır.

Kartta;

- Düzenle
- Sil
- Kaydet

bulunacaktır.

---

## Yönetim Raporu

☐ Gün Sonu

☐ Ay Sonu

☐ Yönetici

☐ Gizli

---

# 4. Arıza Bildirim Modülü

## Modül Adı

Arıza Bildirim

---

## Veritabanı

FaultDB

---

## Günlük Görevler

- Günlük Görev
- Haftalık Görev
- Aylık Görev

oluşturulabilir.

---

## Arıza Kaydı

Yeni Arıza

- Başlık
- Detay
- Bildiren
- Tarih
- Saat
- Öncelik
- Durum

---

## Durum

- Bekliyor
- İşlemde
- Servis Bekleniyor
- Parça Bekleniyor
- Tamamlandı
- İptal

---

## Öncelik

- Düşük
- Normal
- Yüksek
- Acil

---

## Arıza Kartı

- Yapılan İşlem
- Açıklama
- Servis
- Servis Tutanağı
- Fotoğraf
- Video
- Dosya

---

## Açık Arızalar

Kapatılmayan arızalar ertesi gün de otomatik görüntülenmeye devam edecektir.

---

## Yönetim Raporu

☐ Gün Sonu

☐ Ay Sonu

☐ Yönetici

☐ Gizli

---

# 5. Sayaç Okuma Modülü

## Modül Adı

Sayaç Okuma

---

## Veritabanı

MeterDB

---

## Sayaç Türleri

- Elektrik
- Su
- Sıcak Su
- Soğuk Su
- Doğalgaz
- Jeneratör Saati
- Yakıt

---

## Elektrik

- Tarih
- Saat
- Aktif
- Reaktif
- Kapasitif
- Ceza
- Fark

---

## Su / Doğalgaz

- Tarih
- Saat
- Değer
- Önceki Değer
- Fark
- Tüketim

---

## İşlemler

- Sayaç Ekle
- Düzenle
- Sil
- Kaydet

---

## Yönetim Raporu

☐ Gün Sonu

☐ Ay Sonu

☐ Yönetici

☐ Gizli

---

# Modüller Arası Veri Paylaşımı

Her modül kendi veritabanına sahiptir.

Örnek:

Alan Yönetimi
↓
AreaDB

Ekipmanlar
↓
EquipmentDB

Servis Firmalar
↓
CompanyDB

Arıza Bildirim
↓
FaultDB

Sayaç Okuma
↓
MeterDB

---

## Veri Entegrasyonu

Modüller birbirlerinin veritabanına doğrudan erişmez.

Veriler yalnızca API veya Modül Servisleri üzerinden okunur.

Örnek:

Servis Firmalar Modülü
↓
API
↓
Arıza Bildirim Modülü

Alan Yönetimi
↓
API
↓
Ekipman Modülü

Bu yapı sayesinde;

- Yeni modüller sisteme sonradan eklenebilir.
- Eski modüller güncellenebilir.
- Bir modül kaldırıldığında diğer modüller çalışmaya devam eder.
- Veritabanları bağımsız yönetilir.
- Bakım ve geliştirme süreçleri kolaylaşır.
- Sistem uzun yıllar ölçeklenebilir şekilde kullanılabilir.

# TERRA FERI
# Teknik Yönetim Sistemi (TMM)

Versiyon : 2.1
Mimari : Modüler Plugin Architecture
Durum : Ana Sistem Tasarımı

---

# Sistem Mimarisi

Terra Feri Teknik Yönetim Sistemi tamamen modüler bir mimaride geliştirilecektir.

Her modül;

- Bağımsız geliştirilecektir.
- Bağımsız test edilecektir.
- Bağımsız güncellenecektir.
- Bağımsız olarak sisteme eklenecektir.
- İstenildiğinde sistemden kaldırılabilecektir.
- Ana sistemi bozmayacaktır.

Bu yapı sayesinde sistem yıllarca büyütülebilecek ve yeni modüller mevcut sistemi etkilemeden sisteme dahil edilebilecektir.

---

# Genel Mimari

                    Kullanıcı
                        │
              Web / Telefon / Tablet
                        │
                Frontend (Next.js)
                        │
                REST API / WebSocket
                        │
                Backend (NestJS)
                        │
      ┌─────────────────────────────────────┐
      │          Modül Yöneticisi           │
      └─────────────────────────────────────┘
                        │
    ┌─────────┬──────────┬─────────┬──────────┬──────────┐
    │         │          │         │          │
 Alan      Ekipman     Arıza     Sayaç     Firmalar
 Modülü     Modülü      Modülü    Modülü     Modülü
    │         │          │         │          │
  AreaDB   EquipmentDB FaultDB   MeterDB   CompanyDB

---

# Frontend

Frontend yalnızca kullanıcı arayüzünü yönetir.

Görevleri;

- Menü
- Sayfalar
- Formlar
- Kartlar
- Grafikler
- Raporlar
- Bildirimler

Frontend hiçbir zaman veritabanına bağlanmaz.

Tüm işlemler Backend API üzerinden yapılır.

---

# Backend

Backend sistemin beynidir.

Görevleri;

- Kullanıcı Yetkilendirme
- API Yönetimi
- Veritabanı İşlemleri
- Dosya Yönetimi
- Loglama
- Bildirim Sistemi
- WebSocket
- Raporlama

Tüm modüller Backend üzerinden haberleşecektir.

---

# Modül Yapısı

Her modül kendi içerisinde tamamen bağımsız olacaktır.

Standart yapı;

Module

├── frontend
├── backend
├── database
├── api
├── docs
└── README.md

Her modül tek başına geliştirilebilir olacaktır.

---

# Veritabanı Yapısı

Her modülün kendi veritabanı olacaktır.

Örnek;

AreaDB

EquipmentDB

FaultDB

MeterDB

CompanyDB

UserDB

NotificationDB

ReportDB

MaintenanceDB

StockDB

VisitorDB

SecurityDB

CleaningDB

vb.

Hiçbir modül başka modülün veritabanına doğrudan bağlanmayacaktır.

---

# Modüller Arası Haberleşme

Modüller yalnızca API üzerinden veri alışverişi yapacaktır.

Örnek

Alan Yönetimi

↓

API

↓

Ekipman Modülü

-----------------------------------

Servis Firmalar

↓

API

↓

Arıza Modülü

-----------------------------------

Kullanıcı Yönetimi

↓

API

↓

Tüm Modüller

Bu yapı sayesinde veritabanları birbirinden tamamen bağımsız olacaktır.

---

# Modül Entegrasyonu

Yeni modül geliştirildiğinde;

1. Modül sisteme yüklenir.

2. Kendi Database'i oluşturulur.

3. API kayıt edilir.

4. Menüye otomatik eklenir.

5. Yetkiler oluşturulur.

6. Çalışmaya başlar.

Ana sistemde hiçbir kod değiştirilmez.

---

# Modül Standartları

Her modülde aşağıdaki işlemler bulunacaktır.

- Listele
- Yeni Oluştur
- Düzenle
- Sil
- Kaydet
- Ara
- Filtrele
- Sırala
- Yazdır
- Excel Aktar
- PDF Aktar

---

# Dosya Yönetimi

Her modül;

- Fotoğraf
- PDF
- Word
- Excel
- Video

yükleyebilecektir.

---

# Yönetim Raporu Standartları

Her kayıt için;

☐ Gün Sonu Raporuna Dahil Et

☐ Ay Sonu Raporuna Dahil Et

☐ Yöneticiye Göster

☐ Gizli

kutucukları bulunacaktır.

---

# Frontend Teknolojileri

- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn/UI
- TanStack Query
- Zustand
- Axios

---

# Backend Teknolojileri

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Redis
- BullMQ
- Socket.IO

---

# Gerçek Zamanlı Sistem

Sistem WebSocket kullanacaktır.

Örnek;

Telefon üzerinden arıza girildiğinde;

- Yönetici Paneli
- Bilgisayar
- Tablet

aynı anda güncellenecektir.

---

# Dosya Yapısı

terra-feri/

apps/
│
├── web/
├── api/
│
modules/
│
├── alan/
├── ekipman/
├── ariza/
├── sayac/
├── firma/
├── ...
│
shared/
│
uploads/
│
docs/

---

# Ortak Servisler

Tüm modüller aşağıdaki ortak servisleri kullanacaktır.

- Kullanıcı Yönetimi
- Yetkilendirme
- Dosya Yönetimi
- Bildirim Merkezi
- Log Sistemi
- Raporlama
- Takvim
- Ayarlar
- Dashboard

---

# Sistem Hedefi

Terra Feri Teknik Yönetim Sistemi;

- Tamamen modüler
- Ölçeklenebilir
- Plugin mantığında çalışan
- Kurumsal seviyede
- Uzun yıllar geliştirilebilir
- Kolay bakım yapılabilir
- Her modülü bağımsız geliştirilebilir

bir tesis yönetim platformu olarak tasarlanacaktır.

Hiçbir modül başka bir modüle doğrudan bağımlı olmayacak, yalnızca tanımlı API servisleri üzerinden veri alışverişi yapacaktır. Böylece yeni modüller mevcut sistemi değiştirmeden sisteme eklenebilecek, güncellenebilecek veya kaldırılabilecektir.