# Frontend Architecture

Version: 1.0  
Status: Approved

---

# Amaç

TerraceFeri'nin Next.js frontend mimarisini tanımlar.

---

# Framework

Next.js 14+ (App Router)

---

# Proje Yapısı

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx            → Dashboard
│   │   ├── apartments/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── faults/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── equipment/
│   │   ├── tasks/
│   │   ├── meters/
│   │   ├── inventory/
│   │   ├── services/
│   │   ├── reports/
│   │   ├── users/
│   │   └── settings/
│   ├── resident/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── personnel/
│   │   ├── technical/
│   │   ├── cleaning/
│   │   └── security/
│   ├── layout.tsx              → Root layout
│   ├── page.tsx                → Website
│   └── globals.css
├── components/
│   ├── shared/                 → Ortak bileşenler
│   ├── admin/                  → Admin'e özel
│   ├── resident/               → Sakin'e özel
│   └── personnel/              → Personele özel
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── rbac.ts
│   └── socket.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useSocket.ts
│   └── useNotifications.ts
├── services/
│   ├── faultService.ts
│   ├── taskService.ts
│   └── meterService.ts
├── types/
│   ├── fault.types.ts
│   └── user.types.ts
└── utils/
    ├── date.ts
    ├── format.ts
    └── validator.ts
```

---

# Server vs Client Components

## Server Components (varsayılan)

- Veri çekme
- SEO gerektiren sayfalar
- Statik içerik

```typescript
// app/admin/faults/page.tsx
export default async function FaultsPage() {
  const faults = await prisma.fault.findMany({ ... });
  return <FaultList faults={faults} />;
}
```

## Client Components

```typescript
'use client'; // Zorunlu yalnızca gereken yerde

// Kullanım alanları:
// - Event handlers (onClick, onChange)
// - State (useState, useEffect)
// - Browser API'leri
// - Socket.IO
```

---

# State Yönetimi

## Server State

TanStack Query

```typescript
const { data: faults, isLoading } = useQuery({
  queryKey: ['faults', filters],
  queryFn: () => fetchFaults(filters),
});
```

## UI State

React Context + useState

```typescript
const { user, isAuthenticated } = useAuth();
const { notifications } = useNotifications();
```

---

# Form Yönetimi

React Hook Form + Zod

```typescript
const schema = z.object({
  title: z.string().min(3, 'En az 3 karakter'),
  priority: z.enum(['CRITICAL', 'HIGH', 'NORMAL', 'LOW']),
  description: z.string().optional(),
});

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
});
```

---

# Routing

## Middleware ile Yetki

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/admin') && !isAdmin(token)) {
    return NextResponse.redirect('/auth/login');
  }
}

export const config = {
  matcher: ['/admin/:path*', '/resident/:path*', '/personnel/:path*'],
};
```

---

# Error Handling

```typescript
// app/error.tsx
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Bir hata oluştu</h2>
      <button onClick={reset}>Tekrar Dene</button>
    </div>
  );
}
```

---

# Performans

- Server Components ile veri çekme (en az client bundle)
- `next/image` ile görsel optimizasyonu
- `next/font` ile font optimizasyonu
- Dynamic import ile lazy loading
- Suspense boundaries

---

# UI/UX Standartları

Sistem genelinde kullanıcı deneyimini artırmak için aşağıdaki kurallar uygulanır:

- **Kaydırma Çubukları (Scrollbars):** Tüm sistem genelinde ince (thin) yapıda ve scrollbar thumb'ı tam yuvarlak (pill shape) scrollbar'lar kullanılacaktır (`globals.css`).
- **Sidebar (Sol Menü):** Genişliği esnek ve daraltılabilir (collapsible) olacaktır. Kapandığında sadece ikonlar görünmelidir.
- **Sıralanabilir Menüler:** Menü içi öğeler sürükle-bırak (drag and drop - `@dnd-kit`) ile özelleştirilebilir olacak, bu sıralamalar `localStorage` üzerinde kaydedilecektir.
- **Butonlar ve Kartlar (Radius ve Stil Standardı):** BÜTÜN MODÜLLERDE (Sidebar, Popup ve sistemin geri kalan tüm kısımlarındaki bütün butonlar) buton stili KESİNLİKLE "Outline / Ghost" yapısında olacaktır (Örnek: `Yeni Alan Ekle` butonu gibi). Hiçbir butonda tam dolu (solid) arka plan rengi KULLANILMAYACAKTIR. Butonlar hafif transparan arka plana (`bg-[renk]-900/10`), ince bir kenarlığa (`border border-[renk]-500/40`) ve renkli yazıya sahip olacaktır. Yazı rengi ve border rengi butonun amacına göre değişebilir ancak bu saydam/kenarlıklı yapı ve düşük kavis (`rounded-md`) şekli tamamen aynı kalmak zorundadır. Modül dış kartlarında ise `rounded-xl` kullanılacaktır.
