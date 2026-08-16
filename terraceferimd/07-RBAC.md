# RBAC — Role Based Access Control

**Version:** 1.0  
**Status:** Approved

---

# Amaç

Bu doküman TerraceFeri Teknik Yönetim Sistemi'nin Rol Tabanlı Yetkilendirme (RBAC) modelini tanımlar.

Sistemde her kullanıcı yalnızca kendi rolüne izin verilen işlemleri gerçekleştirebilir.

---

# Rol Hiyerarşisi

```text
SUPER_ADMIN
      │
      ▼
ADMIN
      │
      ▼
MANAGER
      │
 ┌────┼────────────┐
 ▼    ▼            ▼
TECHNICAL CLEANING SECURITY
      │
      ▼
RESIDENT
```

---

# Roller

| Rol | Açıklama | Panel |
|------|----------|--------|
| `SUPER_ADMIN` | Yazılım sahibi | Super Admin Paneli |
| `ADMIN` | Sistem yöneticisi | Admin Paneli |
| `MANAGER` | Site / Tesis yöneticisi | Yönetim Paneli |
| `TECHNICAL` | Teknik personel | Personel Paneli |
| `CLEANING` | Temizlik personeli | Personel Paneli |
| `SECURITY` | Güvenlik personeli | Personel Paneli |
| `RESIDENT` | Daire sakini | Daire Sakini Paneli |

---

# Genel Yetkiler

| İşlem | SUPER_ADMIN | ADMIN | MANAGER | TECHNICAL | CLEANING | SECURITY | RESIDENT |
|-------|:----------:|:----:|:-------:|:---------:|:---------:|:---------:|:---------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sistem Ayarları | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Site Ayarları | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Kullanıcı Yönetimi | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Rol Yönetimi | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

# Arıza Modülü

| İşlem | SUPER_ADMIN | ADMIN | MANAGER | TECHNICAL | CLEANING | SECURITY | RESIDENT |
|-------|:----------:|:----:|:-------:|:---------:|:---------:|:---------:|:---------:|
| Listeleme | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | Kendi |
| Oluşturma | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Güncelleme | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Silme | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Öncelik Değiştirme | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Personel Atama | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

# Bakım Modülü

| İşlem | SUPER_ADMIN | ADMIN | MANAGER | TECHNICAL | CLEANING | SECURITY | RESIDENT |
|-------|:----------:|:----:|:-------:|:---------:|:---------:|:---------:|:---------:|
| Listeleme | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Oluşturma | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Güncelleme | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Silme | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

# Görev Modülü

| İşlem | SUPER_ADMIN | ADMIN | MANAGER | TECHNICAL | CLEANING | SECURITY | RESIDENT |
|-------|:----------:|:----:|:-------:|:---------:|:---------:|:---------:|:---------:|
| Listeleme | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Kendi |
| Oluşturma | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Atama | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Tamamlama | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Kendi |

---

# Ekipman Modülü

| İşlem | SUPER_ADMIN | ADMIN | MANAGER | TECHNICAL | CLEANING | SECURITY | RESIDENT |
|-------|:----------:|:----:|:-------:|:---------:|:---------:|:---------:|:---------:|
| Listeleme | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Oluşturma | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Güncelleme | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Silme | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

# Sayaç Modülü

| İşlem | SUPER_ADMIN | ADMIN | MANAGER | TECHNICAL | CLEANING | SECURITY | RESIDENT |
|-------|:----------:|:----:|:-------:|:---------:|:---------:|:---------:|:---------:|
| Listeleme | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Okuma Ekle | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Güncelleme | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Silme | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

# Malzeme / Stok Modülü

| İşlem | SUPER_ADMIN | ADMIN | MANAGER | TECHNICAL | CLEANING | SECURITY | RESIDENT |
|-------|:----------:|:----:|:-------:|:---------:|:---------:|:---------:|:---------:|
| Listeleme | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Oluşturma | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Güncelleme | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Silme | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

# Kullanıcı Yönetimi

| İşlem | SUPER_ADMIN | ADMIN | MANAGER | TECHNICAL | CLEANING | SECURITY | RESIDENT |
|-------|:----------:|:----:|:-------:|:---------:|:---------:|:---------:|:---------:|
| Listeleme | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Oluşturma | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Güncelleme | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Silme | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

# Rapor Modülü

| İşlem | SUPER_ADMIN | ADMIN | MANAGER | TECHNICAL | CLEANING | SECURITY | RESIDENT |
|-------|:----------:|:----:|:-------:|:---------:|:---------:|:---------:|:---------:|
| Görüntüleme | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| İndirme | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Paylaşma | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

# Permission Anahtarları

```text
dashboard:view

system:manage
settings:manage

role:manage

user:read
user:create
user:update
user:delete

fault:read
fault:create
fault:update
fault:delete
fault:assign

maintenance:read
maintenance:create
maintenance:update
maintenance:delete

task:read
task:create
task:update
task:assign
task:complete

equipment:read
equipment:create
equipment:update
equipment:delete

meter:read
meter:create
meter:update
meter:delete

inventory:read
inventory:create
inventory:update
inventory:delete

report:read
report:download
report:share
```

---

# Middleware Uygulaması

```typescript
// lib/rbac.ts

export const permissions: Record<string, Role[]> = {

  'dashboard:view': ['SUPER_ADMIN','ADMIN','MANAGER','TECHNICAL','CLEANING','SECURITY','RESIDENT'],

  'system:manage': ['SUPER_ADMIN'],
  'settings:manage': ['SUPER_ADMIN','ADMIN'],

  'role:manage': ['SUPER_ADMIN','ADMIN'],

  'user:read': ['SUPER_ADMIN','ADMIN','MANAGER'],
  'user:create': ['SUPER_ADMIN','ADMIN','MANAGER'],
  'user:update': ['SUPER_ADMIN','ADMIN','MANAGER'],
  'user:delete': ['SUPER_ADMIN','ADMIN'],

  'fault:read': ['SUPER_ADMIN','ADMIN','MANAGER','TECHNICAL','SECURITY','RESIDENT'],
  'fault:create': ['SUPER_ADMIN','ADMIN','MANAGER','TECHNICAL','SECURITY','RESIDENT'],
  'fault:update': ['SUPER_ADMIN','ADMIN','MANAGER','TECHNICAL'],
  'fault:delete': ['SUPER_ADMIN','ADMIN'],
  'fault:assign': ['SUPER_ADMIN','ADMIN','MANAGER'],

  'maintenance:read': ['SUPER_ADMIN','ADMIN','MANAGER','TECHNICAL'],
  'maintenance:create': ['SUPER_ADMIN','ADMIN','MANAGER','TECHNICAL'],
  'maintenance:update': ['SUPER_ADMIN','ADMIN','MANAGER','TECHNICAL'],
  'maintenance:delete': ['SUPER_ADMIN','ADMIN'],

  'equipment:read': ['SUPER_ADMIN','ADMIN','MANAGER','TECHNICAL'],
  'equipment:create': ['SUPER_ADMIN','ADMIN','TECHNICAL'],
  'equipment:update': ['SUPER_ADMIN','ADMIN','TECHNICAL'],
  'equipment:delete': ['SUPER_ADMIN','ADMIN'],

  'meter:read': ['SUPER_ADMIN','ADMIN','MANAGER','TECHNICAL'],
  'meter:create': ['SUPER_ADMIN','ADMIN','MANAGER','TECHNICAL'],
  'meter:update': ['SUPER_ADMIN','ADMIN','MANAGER','TECHNICAL'],
  'meter:delete': ['SUPER_ADMIN','ADMIN'],

  'inventory:read': ['SUPER_ADMIN','ADMIN','MANAGER','TECHNICAL','CLEANING'],
  'inventory:create': ['SUPER_ADMIN','ADMIN','MANAGER','TECHNICAL'],
  'inventory:update': ['SUPER_ADMIN','ADMIN','MANAGER','TECHNICAL'],
  'inventory:delete': ['SUPER_ADMIN','ADMIN'],

  'report:read': ['SUPER_ADMIN','ADMIN','MANAGER','TECHNICAL'],
  'report:download': ['SUPER_ADMIN','ADMIN','MANAGER','TECHNICAL'],
  'report:share': ['SUPER_ADMIN','ADMIN','MANAGER'],
};

export function hasPermission(role: Role, permission: string): boolean {
  return permissions[permission]?.includes(role) ?? false;
}
```

---

# API Koruması

```typescript
export async function DELETE(req: Request) {
  const user = await getAuthUser(req);

  if (!hasPermission(user.role, "fault:delete")) {
    return new Response("Forbidden", {
      status: 403,
    });
  }

  // Silme işlemi...
}
```

---

# Frontend Koruması

```typescript
const { user } = useAuth();

{hasPermission(user.role, "fault:delete") && (
    <Button variant="destructive">
        Sil
    </Button>
)}
```

---

# Veri Filtreleme (Resident Kuralı)

Resident kullanıcı yalnızca kendi dairesine ait verileri görebilir.

```typescript
const faults = await prisma.fault.findMany({
  where: {
    apartmentId: user.apartmentId,
    deletedAt: null
  }
});
```

---

# Yetkilendirme Katmanları

1. Authentication
2. Role Control
3. Permission Control
4. Resource Ownership Control
5. Audit Log

---

# Gelecek Sürümler

- Dinamik rol oluşturma
- Çoklu rol desteği
- Permission grupları
- Geçici yetki atama
- Departman bazlı yetkilendirme
- Blok bazlı yetkilendirme
- Kat bazlı yetkilendirme
- Daire bazlı yetkilendirme
- Yetki geçmişi (Audit Trail)