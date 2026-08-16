# Notification Module — Bildirim Modülü

Version: 1.0  
Status: Approved

---

# Amaç

Tüm sistem bildirimlerinin merkezi yönetimi.

---

# Bildirim Türleri

| Tip | Açıklama |
|---|---|
| `FAULT` | Arıza bildirimleri |
| `TASK` | Görev uyarıları |
| `METER` | Sayaç anormallikleri |
| `SYSTEM` | Sistem mesajları |
| `INFO` | Genel bilgilendirme |

---

# Kanallar

| Kanal | Durum |
|---|---|
| In-App (web) | ✅ v1 |
| Socket.IO (anlık) | ✅ v1 |
| E-posta | 🔄 v2 |
| Push Notification | 🔄 v2 |
| SMS | 🔄 v3 |

---

# Veri Modeli

```typescript
interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
```

---

# Bildirim Gönderme

```typescript
// TMM Core - Notification Engine
await notificationEngine.send({
  userId: 'user-uuid',
  title: 'Yeni Arıza',
  body: 'B Blok 3. katta arıza bildirildi.',
  type: 'FAULT',
  metadata: { faultId: 'fault-uuid' }
});
```

---

# Header Zili

- Okunmamış bildirim sayısı rozeti
- Açılır bildirim listesi
- "Tümünü okundu işaretle" butonu
- Bildirime tıklayınca ilgili sayfaya git

---

# API Endpoint'leri

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/notifications` | GET | Bildirim listesi |
| `/api/notifications/:id/read` | PUT | Okundu işaretle |
| `/api/notifications/read-all` | PUT | Tümünü okundu |
| `/api/notifications/:id` | DELETE | Sil |

---

# Socket.IO Olayları

| Olay | Açıklama |
|---|---|
| `notification:new` | Yeni bildirim |
| `notification:read` | Bildirim okundu |
| `task:alarm` | Görev alarmı (10sn döngü) |

---

# Otomatik Bildirim Kuralları

| Olay | Alıcı |
|---|---|
| Acil arıza oluşturuldu | Admin + Tüm teknikler |
| Arıza çözüldü | Bildiren kişi |
| Görev vadesi yarın | Atanan personel |
| Görev vadesi geçti | Atanan + Admin |
| Stok kritik | Admin |
| Sayaç anormalliği | Admin + Teknik |
