# Shadcn/ui Standardı

Version: 1.0  
Status: Approved

---

# Amaç

TerraceFeri'de Shadcn/ui kullanım kuralları ve bileşen standartları.

---

# Kurulum

```bash
npx shadcn@latest init
npx shadcn@latest add button card input select dialog table badge
```

---

# Zorunlu Bileşenler

Tüm ekranlarda yalnızca bu bileşenler kullanılır:

| Bileşen | Kullanım |
|---|---|
| `Button` | Tüm butonlar |
| `Card` | İçerik kartları |
| `Input` | Metin girişi |
| `Textarea` | Uzun metin |
| `Select` | Dropdown seçimi |
| `Dialog` | Modal diyalog |
| `AlertDialog` | Onay diyaloğu |
| `Sheet` | Yan panel drawer |
| `Table` | Veri tabloları |
| `Badge` | Durum, öncelik rozetleri |
| `Avatar` | Kullanıcı avatarı |
| `Calendar` | Tarih seçici |
| `Toast` | Bildirim toast'ları |
| `Tooltip` | İpucu balonu |
| `Tabs` | Sekme navigasyonu |
| `Accordion` | Açılır panel |
| `Skeleton` | Yükleme iskeleti |
| `Separator` | Ayırıcı çizgi |
| `Switch` | Toggle |
| `Checkbox` | Onay kutusu |
| `RadioGroup` | Tek seçim grubu |
| `Popover` | Açılır içerik |
| `ScrollArea` | Özel kaydırma alanı |
| `Command` | Komut paleti / arama |
| `DropdownMenu` | Dropdown menü |

---

# Bileşen Kullanım Örnekleri

## Button

```tsx
// Birincil buton
<Button>Kaydet</Button>

// Tehlikeli eylem
<Button variant="destructive">Sil</Button>

// Yalnızca ikon
<Button variant="ghost" size="icon">
  <PlusIcon className="h-4 w-4" />
</Button>
```

## Dialog (Modal)

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Yeni Arıza</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Arıza Ekle</DialogTitle>
      <DialogDescription>
        Arıza bilgilerini doldurun.
      </DialogDescription>
    </DialogHeader>
    {/* Form içeriği */}
    <DialogFooter>
      <Button type="submit">Kaydet</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## DataTable (TanStack Table + Shadcn)

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Başlık</TableHead>
      <TableHead>Durum</TableHead>
      <TableHead>Tarih</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {faults.map((fault) => (
      <TableRow key={fault.id}>
        <TableCell>{fault.title}</TableCell>
        <TableCell>
          <Badge variant="destructive">{fault.status}</Badge>
        </TableCell>
        <TableCell>{format(fault.createdAt, 'dd.MM.yyyy')}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Toast

```tsx
import { toast } from 'sonner';

// Başarı
toast.success('Arıza kaydedildi.');

// Hata
toast.error('Kayıt başarısız oldu.');

// Bilgi
toast.info('Güncelleme mevcut.');
```

---

# Tema Yapısı

```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --destructive: 0 84.2% 60.2%;
    /* ... */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... */
  }
}
```

---

# Dark / Light Mod

```tsx
// components/ThemeToggle.tsx
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
```

---

# Yasak Uygulamalar

- Shadcn dışı UI kütüphane kullanımı
- Satır içi `style={{ }}` ile karmaşık stiller
- Tailwind'in dışında özel CSS (component düzeyinde)
- Bootstrap, MUI, Ant Design
