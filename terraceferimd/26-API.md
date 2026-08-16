# API Documentation

Version: 1.0  
Status: Approved

---

# Amaç

TerraceFeri sisteminin tüm REST API endpoint'lerinin dokümantasyonu.

---

# Base URL

```
Geliştirme:   http://localhost:3001
Üretim:       https://{server-ip}:3002
```

---

# Kimlik Doğrulama

Tüm korumalı endpoint'ler için:

```
Cookie: access_token={jwt_token}
```

---

# Standart Yanıt Formatı

## Başarılı

```json
{
  "success": true,
  "data": { ... },
  "message": "İşlem başarılı"
}
```

## Hata

```json
{
  "success": false,
  "error": "Hata mesajı",
  "code": 404
}
```

---

# HTTP Durum Kodları

| Kod | Açıklama |
|---|---|
| 200 | Başarılı |
| 201 | Oluşturuldu |
| 400 | Hatalı istek |
| 401 | Kimlik doğrulama hatası |
| 403 | Yetkisiz |
| 404 | Bulunamadı |
| 422 | Doğrulama hatası |
| 500 | Sunucu hatası |

---

# Auth API

| Endpoint | Metod | Body | Açıklama |
|---|---|---|---|
| `/api/auth/login` | POST | `{email, password}` | Giriş |
| `/api/auth/logout` | POST | — | Çıkış |
| `/api/auth/refresh` | POST | — | Token yenile |
| `/api/auth/me` | GET | — | Mevcut kullanıcı |

---

# Areas API

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/areas` | GET | Alan listesi |
| `/api/areas` | POST | Yeni alan |
| `/api/areas/:id` | GET | Alan detayı |
| `/api/areas/:id` | PUT | Güncelle |
| `/api/areas/:id` | DELETE | Sil |
| `/api/areas/reorder` | PUT | Sırala |

---

# Apartments API

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/apartments` | GET | Daire listesi |
| `/api/apartments` | POST | Yeni daire |
| `/api/apartments/:id` | GET | Daire detayı |
| `/api/apartments/:id` | PUT | Güncelle |
| `/api/apartments/:id` | DELETE | Sil |

---

# Equipment API

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/equipment` | GET | Ekipman listesi |
| `/api/equipment` | POST | Yeni ekipman |
| `/api/equipment/:id` | GET | Ekipman detayı |
| `/api/equipment/:id` | PUT | Güncelle |
| `/api/equipment/:id` | DELETE | Sil |

---

# Faults API

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/faults` | GET | Arıza listesi |
| `/api/faults` | POST | Yeni arıza |
| `/api/faults/:id` | GET | Arıza detayı |
| `/api/faults/:id` | PUT | Güncelle |
| `/api/faults/:id` | DELETE | Sil |

Query Params: `status`, `priority`, `areaId`, `start`, `end`

---

# Tasks API

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/tasks` | GET | Görev listesi |
| `/api/tasks` | POST | Yeni görev |
| `/api/tasks/:id` | GET | Görev detayı |
| `/api/tasks/:id` | PUT | Güncelle |
| `/api/tasks/:id` | DELETE | Sil |

---

# Meters API

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/meters` | GET | Sayaç listesi |
| `/api/meters` | POST | Yeni okuma |
| `/api/meters/:id` | PUT | Güncelle |
| `/api/meters/:id` | DELETE | Sil |
| `/api/meters/reorder-types` | PUT | Tip sıralama |
| `/api/meters/type/rename` | PUT | Tip yeniden adlandır |
| `/api/meters/type/:name` | DELETE | Tüm tipi sil |

---

# Inventory API

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/inventory` | GET | Stok listesi |
| `/api/inventory` | POST | Yeni stok |
| `/api/inventory/:id` | PUT | Güncelle |
| `/api/inventory/:id` | DELETE | Sil |

---

# Purchase Requests API

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/purchase-requests` | GET | Talep listesi |
| `/api/purchase-requests` | POST | Yeni talep |
| `/api/purchase-requests/:id` | PUT | Durum güncelle |
| `/api/purchase-requests/:id` | DELETE | Sil |

---

# Services API

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/services` | GET | Servis listesi |
| `/api/services` | POST | Yeni servis |
| `/api/services/:id` | PUT | Güncelle |
| `/api/services/:id` | DELETE | Sil |

---

# Users API

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/users` | GET | Kullanıcı listesi |
| `/api/users` | POST | Yeni kullanıcı |
| `/api/users/:id` | PUT | Güncelle |
| `/api/users/:id` | DELETE | Sil |

---

# Notifications API

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/notifications` | GET | Bildirim listesi |
| `/api/notifications/:id/read` | PUT | Okundu işaretle |
| `/api/notifications/read-all` | PUT | Tümünü okundu |

---

# Upload API

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/upload` | POST | Dosya yükle |

---

# Info API

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/info` | GET | Sunucu IP, QR data URL |

---

# Voice API

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/voice/process` | POST | Ses → Metin (Groq Whisper) |

Header: `x-api-key: {groq_key}`

---

# Rate Limiting

| Endpoint Grubu | Limit |
|---|---|
| Auth | 10 istek / dakika |
| API genel | 100 istek / dakika |
| Upload | 20 istek / dakika |
