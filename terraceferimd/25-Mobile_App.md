# Mobile App — Mobil Uygulama

Version: 1.0  
Status: Approved

---

# Amaç

TerraceFeri'nin Android mobil uygulaması.

---

# Platform

Android APK

Tek kod tabanı — aynı React/Next.js uygulaması Capacitor ile paketlenir.

---

# Capacitor Yapısı

```
client/
├── capacitor.config.ts
├── android/
│   ├── app/
│   └── build.gradle
└── dist/        ← Build çıktısı (npm run build)
```

---

# Build Akışı

```bash
# 1. Web build
npm run build

# 2. Capacitor senkronize
npx cap sync android

# 3. Android Studio'da aç
npx cap open android

# 4. APK oluştur
# Build > Generate Signed Bundle/APK
```

---

# Çıktı

```
terrace-tmm.apk
```

---

# Capacitor Ayarları

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.terraceferi.tmm',
  appName: 'TerraceFeri TMM',
  webDir: 'dist',
  server: {
    url: 'https://192.168.1.x:3002',  // Lokal sunucu IP
    cleartext: true,
  },
};
```

---

# Kullanılan Capacitor Eklentileri

| Eklenti | Kullanım |
|---|---|
| `@capacitor/camera` | Sayaç fotoğrafı |
| `@capacitor/network` | Ağ durumu |
| `@capacitor/haptics` | Dokunsal geri bildirim |
| `@capacitor/push-notifications` | Push (v2) |

---

# QR ile Bağlantı

1. Bilgisayarda sunucu başlatılır.
2. QR Modal'dan bağlantı QR kodu görüntülenir.
3. Mobil cihaz QR'ı okuyarak sisteme bağlanır.

```
connectUrl = https://{localIp}:5173
```

---

# Responsive Tasarım

| Ekran | Davranış |
|---|---|
| ≥1024px | Desktop layout |
| 768-1023px | Tablet layout |
| <768px | Mobile Bottom Nav |

---

# Mobil Alt Navigasyon

Yatay scroll edilebilir alt bar (≤768px):

Ana Sayfa → Daireler → Alanlar → Ekipman → Arızalar → Servisler → Sayaçlar → Malzemeler → Raporlar → Menü

---

# Sesli Komut (Mobil)

Mobil tarayıcılarda Web Speech API'yi açmak için ses yöntemi:

```javascript
// unlockMobileSpeech()
audioContext.resume(); // Kullanıcı etkileşimi sonrası
```

---

# Gelecek

- iOS desteği (Capacitor)
- Offline mod (Service Worker)
- Biometric login
- Push Notification
