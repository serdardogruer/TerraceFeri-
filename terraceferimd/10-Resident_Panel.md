# Resident Panel — Daire Sakini Paneli

Version: 1.0  
Status: Approved

---

# Amaç

Daire sakinlerinin kendi dairelerine ait işlemleri yapabildiği panel.

---

# Erişim

- Rol: `RESIDENT`
- URL: `/resident`
- Platform: Web + Android

---

# Menü

```
/resident
├── /dashboard     → Ana sayfa
├── /fault         → Arıza bildir
├── /my-faults     → Arıza takibi
├── /announcements → Duyurular
├── /documents     → Belgeler
└── /profile       → Profilim
```

---

# Dashboard

| Widget | Açıklama |
|---|---|
| Açık Arızalarım | Kendi bildirdiği arızalar |
| Duyurular | Son duyurular |
| Belgeler | Yüklenen belgeler |

---

# Arıza Bildirimi

## Form Alanları

| Alan | Tip | Zorunlu |
|---|---|---|
| Başlık | Text | ✅ |
| Açıklama | Textarea | ✅ |
| Öncelik | Select | ✅ |
| Fotoğraf | File Upload | ❌ |

## Kural

Sakin yalnızca kendi dairesine ait arıza bildirir.

---

# Arıza Takibi

- Sakin yalnızca kendi bildirdiği arızaları görür.
- Durum güncellemelerinde bildirim alır.

---

# Duyurular

- Yönetim tarafından yayınlanan duyurular görüntülenir.
- Okundu/Okunmadı takibi.

---

# Belgeler

- Aidat dekontları (ileride)
- Sigorta belgeleri
- Yönetim belgeleri

---

# Profil

- Ad, telefon güncelleme
- Şifre değiştirme
- Bildirim tercihleri
