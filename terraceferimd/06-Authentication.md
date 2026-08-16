# Authentication

Version: 1.0  
Status: Approved

---

# Amaç

Bu doküman TerraceFeri sisteminin kimlik doğrulama mimarisini tanımlar.

---

# Kimlik Doğrulama Yöntemi

JWT (JSON Web Token) + Refresh Token

---

# Token Yapısı

## Access Token

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "ADMIN",
  "iat": 1700000000,
  "exp": 1700003600
}
```

| Alan | Değer |
|---|---|
| Algoritma | HS256 |
| Süre | 1 saat |
| Depolama | HTTP-Only Cookie |

## Refresh Token

| Alan | Değer |
|---|---|
| Süre | 7 gün |
| Depolama | HTTP-Only Cookie |
| Yenileme | Otomatik (sessiz) |

---

# Giriş Akışı

```
Kullanıcı (email + şifre)
    │
    ▼
POST /api/auth/login
    │
    ▼
Email varlık kontrolü
    │
    ▼
bcrypt şifre doğrulama
    │
    ▼
Access Token üret
Refresh Token üret
    │
    ▼
HTTP-Only Cookie olarak set et
    │
    ▼
Kullanıcı bilgisi döndür (şifre hariç)
```

---

# Çıkış Akışı

```
POST /api/auth/logout
    │
    ▼
Cookie temizle
    │
    ▼
Refresh Token geçersiz kıl
    │
    ▼
200 OK
```

---

# Token Yenileme

```
Access Token süresi doldu
    │
    ▼
POST /api/auth/refresh (otomatik)
    │
    ▼
Refresh Token doğrula
    │
    ▼
Yeni Access Token üret
    │
    ▼
Cookie güncelle
```

---

# Şifre Güvenliği

- bcrypt (salt rounds: 12)
- Düz metin şifre asla saklanmaz
- Şifre sıfırlama e-posta ile yapılır (v2)

---

# Middleware

Her korumalı rota için:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  
  if (!token) {
    return NextResponse.redirect('/auth/login');
  }
  
  // Token doğrula
  // Role kontrolü
}
```

---

# API Endpoint'leri

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/auth/login` | POST | Giriş yap |
| `/api/auth/logout` | POST | Çıkış yap |
| `/api/auth/refresh` | POST | Token yenile |
| `/api/auth/me` | GET | Mevcut kullanıcı |
| `/api/auth/password` | PUT | Şifre değiştir |

---

# Güvenlik Kuralları

- Brute force koruması (5 yanlış girişte 15 dk kilit)
- Rate limiting: 10 istek / dakika
- HTTPS zorunlu
- Cookie `SameSite=Strict`, `Secure=true`, `HttpOnly=true`

---

# Oturum Yönetimi

| Durum | Davranış |
|---|---|
| Token geçerli | Normal erişim |
| Token süresi dolmuş | Otomatik yenile |
| Refresh token süresi dolmuş | Login sayfasına yönlendir |
| Kullanıcı askıya alındı | Anında erişimi kes |

---

# Gelecek

- OAuth2 / SSO (Google, Microsoft)
- 2FA (İki faktörlü doğrulama)
- Magic Link ile giriş
