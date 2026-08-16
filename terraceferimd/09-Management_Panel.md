# Management Panel

Version: 1.0  
Status: Approved

---

# Amaç

Bu doküman tesis yöneticilerine ait Yönetim Paneli'ni tanımlar.

---

# Erişim

- Rol: `ADMIN`
- URL: `/admin`
- Platform: Web + Android

---

# Menü Yapısı

```
/admin
├── /dashboard          → Genel bakış
├── /apartments         → Daire yönetimi
├── /areas              → Alan yönetimi
├── /equipment          → Ekipman yönetimi
├── /faults             → Arıza takibi
├── /maintenance        → Bakım planlaması
├── /tasks              → Görev yönetimi
├── /meters             → Sayaç yönetimi
├── /inventory          → Stok yönetimi
├── /services           → Servis firmaları
├── /reports            → Raporlar
├── /calendar           → Takvim
├── /users              → Kullanıcı yönetimi
├── /files              → Dosya yönetimi
└── /settings           → Sistem ayarları
```

---

# Dashboard

## Widget'lar

| Widget | Açıklama |
|---|---|
| Açık Arızalar | Toplam + Acil sayısı |
| Bekleyen Görevler | Bugün vadesi gelen |
| Stok Uyarısı | Kritik seviyedeki malzemeler |
| Son Sayaç | Son okunan değerler |
| Aktif Personel | Online personel sayısı |
| Günlük Özet | Son 24 saatin özeti |

---

# Daire Yönetimi

## Liste Sayfası

- Blok ve daire numarasına göre sıralama
- Arama (sakin adı, daire no, plaka)
- Blok filtresi
- Yeni daire ekleme butonu

## Daire Kaydı

| Alan | Tip |
|---|---|
| Blok Adı | Text |
| Daire Numarası | Text |
| Daire Tipi | Select (2+1, 3+1 vb.) |
| Kat | Number |
| Sakin Adı | Text |
| Telefon | Tel |
| E-posta | Email |
| Araç Plakası 1 | Text |
| Araç Plakası 2 | Text |
| Ev Sahibi / Kiracı | Radio |
| Notlar | Textarea |

---

# Kullanıcı Yönetimi

## Kullanıcı Kaydı

| Alan | Tip |
|---|---|
| Ad Soyad | Text |
| E-posta | Email |
| Şifre | Password |
| Rol | Select |
| Durum | Select (Aktif/Pasif) |

## İşlemler

- Kullanıcı oluşturma
- Rol değiştirme
- Şifre sıfırlama
- Hesap askıya alma
- Hesap silme (soft delete)

---

# Sistem Ayarları

| Ayar | Açıklama |
|---|---|
| Tesis Adı | Sistem genelinde görünen ad |
| Logo | Tesis logosu |
| Bildirim Ayarları | E-posta / Push tercihleri |
| Sayaç Tipleri | Özelleştirilebilir |
| Yedekleme | Manuel yedek alma |

---

# Header

- Tesis adı ve logosu
- Bildirim zili
- Kullanıcı menüsü (profil, çıkış)
- Dark/Light mod

---

# Sidebar

- Tam menü
- Aktif sekme vurgusu
- Çöktürülebilir (collapsible)
- Mobilde drawer olarak açılır

---

# Responsive

| Ekran | Davranış |
|---|---|
| Masaüstü | Tam sidebar + içerik |
| Tablet | Collapsible sidebar |
| Mobil | Bottom Navigation + Drawer |
