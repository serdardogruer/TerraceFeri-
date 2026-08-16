# Realtime System — Gerçek Zamanlı Sistem

Version: 1.0  
Status: Approved

---

# Amaç

Tüm bağlı istemcilerin anlık senkronizasyonu.

---

# Teknoloji

Socket.IO

HTTP + HTTPS dual-server desteği.

---

# Mimari

```
Client (Browser / Android)
    │
    │ WSS / WS
    │
Socket.IO Server
    │
    ├── Event Handler
    │
    ├── Room Manager
    │
    └── Broadcast Engine
```

---

# Bağlantı Yönetimi

```typescript
io.on('connection', (socket) => {
  console.log(`Bağlandı: ${socket.id}`);

  // Kullanıcıya özel odaya katıl
  socket.join(`user:${userId}`);

  // Rol odasına katıl
  socket.join(`role:${userRole}`);

  socket.on('disconnect', () => {
    console.log(`Ayrıldı: ${socket.id}`);
  });
});
```

---

# Broadcast Fonksiyonları

```typescript
// Tüm bağlı istemcilere
function notifyAll(event: string, data: unknown): void {
  io.emit(event, data);
}

// Belirli bir role
function notifyRole(role: string, event: string, data: unknown): void {
  io.to(`role:${role}`).emit(event, data);
}

// Belirli bir kullanıcıya
function notifyUser(userId: string, event: string, data: unknown): void {
  io.to(`user:${userId}`).emit(event, data);
}
```

---

# Standart Olay Yapısı

```typescript
interface SocketEvent {
  type: string;           // 'fault_created'
  payload: unknown;       // Olay verisi
  timestamp: string;      // ISO string
}
```

---

# Tüm Sistem Olayları

| Olay | Açıklama | Alıcı |
|---|---|---|
| `fault:created` | Yeni arıza | Tümü |
| `fault:updated` | Arıza güncellendi | Tümü |
| `fault:resolved` | Arıza çözüldü | Tümü |
| `task:created` | Yeni görev | Tümü |
| `task:updated` | Görev güncellendi | Tümü |
| `task:alarm` | Vadesi gelen görev | Tümü |
| `meter:logged` | Sayaç okundu | Tümü |
| `inventory:updated` | Stok güncellendi | Tümü |
| `notification:new` | Yeni bildirim | Kullanıcı |
| `users:changed` | Kullanıcı değişikliği | Admin |

---

# Otomatik Alarm (Sunucu)

Her 10 saniyede:

```typescript
setInterval(async () => {
  const dueTasks = await prisma.task.findMany({
    where: {
      status: 'PENDING',
      dueDate: { lte: new Date() }
    }
  });

  if (dueTasks.length > 0) {
    notifyAll('task:alarm', { tasks: dueTasks });
  }
}, 10000);
```

---

# İstemci Tarafı

```typescript
// SocketContext.tsx
const socket = io(`http://${host}:3001`);

socket.on('fault:created', (data) => {
  // Store güncelle / bildirim göster
});

socket.on('disconnect', () => {
  // Bağlantı koptu uyarısı
});
```

---

# Bağlantı Durumu Göstergesi

Header'da Wi-Fi rozeti:

- 🟢 `Wi-Fi Canlı Ağ Bağlı` — Bağlı
- 🔴 `Bağlanılıyor...` — Bağlantı yok

---

# Port Yapısı

| Port | Protokol | Açıklama |
|---|---|---|
| 3001 | HTTP | Ana API + WS |
| 3002 | HTTPS | SSL + WSS |
| 5173 | HTTP | Vite Dev Server |
