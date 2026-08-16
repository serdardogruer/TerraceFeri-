# Personnel Panel — Personel Paneli

Version: 1.0  
Status: Approved

---

# Amaç

Teknik, temizlik ve güvenlik personelinin görevlerini yönettiği panel.

---

# Erişim

| Alt Rol | URL | Yetki |
|---|---|---|
| `TECHNICAL` | `/personnel/technical` | Arıza, ekipman, sayaç, görev, stok |
| `CLEANING` | `/personnel/cleaning` | Görev, stok (okuma) |
| `SECURITY` | `/personnel/security` | Arıza bildirme, güvenlik görevleri |

---

# Teknik Personel Menüsü

```
/personnel/technical
├── /dashboard     → Bugünkü görevler
├── /faults        → Arızalar
├── /equipment     → Ekipmanlar
├── /meters        → Sayaç okuma
├── /tasks         → Görevlerim
├── /inventory     → Malzeme görüntüleme
└── /profile       → Profilim
```

---

# Dashboard

## Bugünkü İş Listesi

- Vadesi gelen görevler
- Üstüme atanan açık arızalar
- Okunacak sayaçlar

---

# Arıza Ekranı

## Teknik Personel

- Tüm arızaları görür (kısıtlama yok)
- Durumu güncelleyebilir (Açık → İşlemde → Çözüldü)
- Fotoğraf ve ses kaydı ekleyebilir

## Güvenlik Personeli

- Yeni arıza bildirebilir
- Kendi bildirdiği arızaları görür

---

# Ekipman Ekranı

- Alan ve kategoriye göre ekipman listesi
- Ekipman detayı (teknik bilgiler, çalışma saati)
- Saat sayacı güncelleme
- Fotoğraf ekleme

---

# Sayaç Okuma Ekranı

- Sayaç tipi seçimi
- Kamera ile fotoğraf çekme
- Manuel değer girişi
- Kayıt geçmişi

---

# Görev Ekranı

- Üstüme atanan görevler
- Görev tamamlama
- Not ekleme

---

# Temizlik Personeli Menüsü

```
/personnel/cleaning
├── /dashboard     → Bugünkü görevler
├── /tasks         → Görevlerim
└── /profile       → Profilim
```

---

# Güvenlik Personeli Menüsü

```
/personnel/security
├── /dashboard     → Vardiya özeti
├── /faults        → Arıza bildir
└── /profile       → Profilim
```

---

# Mobil Öncelik

Personel ekranları önce mobil tasarlanır.

- Büyük dokunma alanları
- Kamera entegrasyonu
- Hızlı kayıt formları
- Offline destek (v2+)
