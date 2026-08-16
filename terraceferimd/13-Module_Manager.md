# Module Manager

Version: 1.0  
Status: Approved

---

# Amaç

Sistemdeki modüllerin kurulumunu, etkinleştirilmesini ve yönetimini sağlar.

---

# Modül Kaydı

Her modül sisteme kayıt olmalıdır:

```typescript
interface ModuleDefinition {
  id: string;                    // 'fault-module'
  name: string;                  // 'Arıza Modülü'
  version: string;               // '1.0.0'
  description: string;
  requiredRoles: Role[];
  dependencies: string[];        // Bağımlı modül ID'leri
  routes: ModuleRoute[];
  widgets: DashboardWidget[];
  settings: ModuleSetting[];
}
```

---

# Modül Durumları

| Durum | Açıklama |
|---|---|
| `INSTALLED` | Kurulu ama aktif değil |
| `ACTIVE` | Aktif ve kullanılabilir |
| `DISABLED` | Devre dışı |
| `UPDATING` | Güncelleniyor |
| `ERROR` | Hata durumu |

---

# Modül Yaşam Döngüsü

```
install()
    │
    ▼
register()
    │
    ▼
initialize()
    │
    ▼
activate()
    │
    ▼
[ACTIVE]
    │
    ├── update() → [ACTIVE]
    ├── disable() → [DISABLED]
    └── uninstall() → [kaldırıldı]
```

---

# Admin Ekranı

URL: `/admin/modules`

## Modül Listesi

- Yüklü modüller
- Durum rozeti
- Versiyon
- Etkinleştir / Devre dışı bırak toggle

## Bağımlılık Kontrolü

Bir modül kaldırılmadan önce bağımlılıkları kontrol edilir.

---

# Zorunlu Modüller

Bu modüller devre dışı bırakılamaz:

- Authentication
- RBAC
- Dashboard Engine
- Notification Engine

---

# API Endpoint'leri

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/modules` | GET | Tüm modüller |
| `/api/modules/:id/activate` | PUT | Etkinleştir |
| `/api/modules/:id/disable` | PUT | Devre dışı bırak |
| `/api/modules/:id/settings` | GET/PUT | Modül ayarları |
