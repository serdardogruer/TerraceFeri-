# Task Module — Görev Modülü

Version: 1.0  
Status: Approved

---

# Amaç

Personele görev atama, takip etme ve tamamlama sistemi.

---

# Kullanıcı Rolleri

| Rol | Yetki |
|---|---|
| ADMIN | Tüm görevler, atama |
| TECHNICAL | Kendi görevleri, oluşturma |
| CLEANING | Kendi görevleri |
| SECURITY | Kendi görevleri |
| RESIDENT | ❌ |

---

# Veri Modeli

```typescript
interface Task {
  id: string;
  title: string;
  areaId?: string;
  equipmentId?: string;
  dueDate?: Date;
  recurrence: Recurrence;
  status: TaskStatus;
  assignedTo?: string;     // User ID
  description?: string;
  voiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

# Sayfalar

## Görev Listesi (`/tasks`)

### Filtreler
- Durum (Bekliyor, İşlemde, Tamamlandı)
- Atanan kişi
- Tarih aralığı
- Alan / Ekipman

### Görünüm
- Dikey liste
- Vadesi geçmiş → kırmızı vurgu
- Bugün vadeli → turuncu vurgu

## Görev Formu

| Alan | Tip | Zorunlu |
|---|---|---|
| Başlık | Text | ✅ |
| Alan | Select | ❌ |
| Ekipman | Select | ❌ |
| Yapılacak Tarih | DatePicker | ❌ |
| Sıklık | Select | ✅ |
| Atanan Kişi | Select (kullanıcı) | ❌ |
| Açıklama | Textarea | ❌ |
| Ses Kaydı | Audio | ❌ |

---

# Kanban Görünümü (v2)

```
Bekliyor | İşlemde | Tamamlandı
   │          │          │
 [Görev]  [Görev]   [Görev]
```

---

# API Endpoint'leri

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/tasks` | GET | Görev listesi |
| `/api/tasks` | POST | Yeni görev |
| `/api/tasks/:id` | PUT | Güncelle |
| `/api/tasks/:id` | DELETE | Sil |

---

# Socket.IO Olayları

| Olay | Açıklama |
|---|---|
| `task:created` | Yeni görev |
| `task:updated` | Güncellendi |
| `task:alarm` | Vadesi gelen görevler (sunucu 10sn) |

---

# Bildirimler

| Tetikleyici | Alıcı |
|---|---|
| Görev atandı | Atanan kişi |
| Görev vadesi yaklaştı | Atanan kişi |
| Görev tamamlandı | Admin |
