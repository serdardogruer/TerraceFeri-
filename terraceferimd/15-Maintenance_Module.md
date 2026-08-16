# Maintenance Module — Bakım Modülü

Version: 1.0  
Status: Approved

---

# Amaç

Tesis ekipmanlarının periyodik bakımlarının planlanması, izlenmesi ve kaydedilmesi.

---

# Kullanıcı Rolleri

| Rol | Yetki |
|---|---|
| ADMIN | Tam erişim |
| TECHNICAL | Görüntüle, oluştur, tamamla |
| Diğer | ❌ |

---

# Veri Modeli

Bakım kayıtları `tasks` tablosunda tutulur.

```typescript
interface MaintenanceTask {
  id: string;
  title: string;
  equipmentId?: string;
  areaId?: string;
  dueDate: Date;
  recurrence: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo?: string;
  description?: string;
  createdAt: Date;
}
```

---

# Tekrar Eden Bakımlar

| Sıklık | Açıklama |
|---|---|
| Tek Seferlik | Yalnızca bir kez |
| Günlük | Her gün |
| Haftalık | Her hafta |
| Aylık | Her ay |

Tamamlanan tekrar eden bakım bir sonraki dönemi otomatik oluşturur (v2).

---

# Sayfalar

## Bakım Listesi

- Tarih bazlı sıralama
- Filtreler: Durum, Sıklık, Alan, Ekipman
- Gecikmiş bakımlar kırmızı vurgulama

## Bakım Formu

| Alan | Tip | Zorunlu |
|---|---|---|
| Başlık | Text | ✅ |
| Ekipman | Select | ❌ |
| Alan | Select | ❌ |
| Yapılacak Tarih | DatePicker | ✅ |
| Sıklık | Select | ✅ |
| Sorumlu | Select (personel) | ❌ |
| Açıklama | Textarea | ❌ |

---

# Dashboard Widget

- Bugün yapılacak bakımlar
- Bu hafta yapılacak bakımlar
- Gecikmiş bakımlar sayısı

---

# Bildirimler

| Tetikleyici | Alıcı | Zaman |
|---|---|---|
| Yaklaşan bakım | Sorumlu personel | 1 gün önce |
| Gecikmiş bakım | Admin + Sorumlu | Gerçek zamanlı |

---

# API Endpoint'leri

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/tasks` | GET | Bakım listesi |
| `/api/tasks` | POST | Yeni bakım oluştur |
| `/api/tasks/:id` | GET | Bakım detayı |
| `/api/tasks/:id` | PUT | Güncelle / Tamamla |
| `/api/tasks/:id` | DELETE | Sil (soft) |

---

# Socket.IO Olayları

| Olay | Açıklama |
|---|---|
| `task:created` | Yeni bakım oluşturuldu |
| `task:updated` | Bakım güncellendi |
| `task:completed` | Bakım tamamlandı |
| `task:alarm` | Vadesi gelen bakımlar (10sn döngü) |
