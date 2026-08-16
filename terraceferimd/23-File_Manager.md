# File Manager — Dosya Yöneticisi

Version: 1.0  
Status: Approved

---

# Amaç

Tesis belgelerinin, ekipman fotoğraflarının ve ses kayıtlarının merkezi yönetimi.

---

# Desteklenen Dosya Türleri

| Tür | Uzantılar |
|---|---|
| Görsel | jpg, jpeg, png, webp |
| PDF | pdf |
| Ses | webm, mp4, wav |
| Video | mp4 (v2) |

---

# Yükleme

```typescript
// Dosya yükleme servisi
interface FileUploadResult {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

// API
POST /api/upload
Content-Type: multipart/form-data
Body: { file: File, entity: string, entityId: string }
```

---

# Depolama

## v1 — Yerel Disk

- `/uploads/` dizini
- Statik dosya servisi (Express/Next.js)
- Dosya adı: `{fieldname}-{timestamp}-{random}.{ext}`

## v2 — Bulut

- Amazon S3
- MinIO (self-hosted)

---

# Entegrasyon Noktaları

| Modül | Dosya Türü |
|---|---|
| Arıza | Fotoğraf + Ses kaydı |
| Ekipman | Fotoğraf + PDF kılavuz |
| Görev | Ses kaydı |
| Sayaç | Fotoğraf |
| Belgeler | PDF |

---

# Dosya Listesi

URL: `/admin/files`

- Tüm yüklenen dosyalar
- Entity bazlı filtreleme
- Tarih bazlı sıralama
- Önizleme
- İndirme
- Silme

---

# Güvenlik

- Maksimum dosya boyutu: 10 MB
- Yalnızca izin verilen MIME tipleri
- Dosya adı sanitizasyonu
- Yetkisiz erişim engellemesi

---

# API Endpoint'leri

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/upload` | POST | Dosya yükle |
| `/api/files` | GET | Dosya listesi |
| `/api/files/:id` | DELETE | Dosya sil |
| `/uploads/:filename` | GET | Statik dosya servisi |
