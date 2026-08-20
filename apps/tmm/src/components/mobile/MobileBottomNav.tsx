'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  Home, 
  AlertCircle, 
  Bell, 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  Shield, 
  Package, 
  Send,
  FileWarning, 
  QrCode, 
  Users 
} from 'lucide-react';

interface MobileBottomNavProps {
  type?: 'sakin' | 'personel' | 'temizlik' | 'guvenlik';
}

function MobileBottomNavInner({ type }: MobileBottomNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  // Sakin Navigasyonu
  const sakinNav = [
    { href: '/sakin', label: 'Ana Sayfa', icon: Home, key: 'home' },
    { href: '/sakin/talepler', label: 'Taleplerim', icon: AlertCircle, key: 'talepler' },
    { href: '/sakin/duyurular', label: 'Duyurular', icon: Bell, key: 'duyurular' },
    { href: '/sakin/randevular', label: 'Randevular', icon: Calendar, key: 'randevular' },
    { href: '/sakin/mesajlar', label: 'Mesajlar', icon: MessageSquare, key: 'mesajlar' },
  ];

  // Temizlik Personeli Navigasyonu (Tamamen Sade ve Amaca Yönelik)
  const temizlikNav = [
    { href: '/personel/temizlik', label: 'Rutin Görevler', icon: Sparkles, key: 'gorevler' },
    { href: '/personel/temizlik?tab=malzeme', label: 'Malzeme Talebi', icon: Package, key: 'malzeme' },
    { href: '/personel/temizlik?tab=bildirimler', label: 'Yönetime Bildir', icon: Send, key: 'bildirimler' },
  ];

  // Güvenlik Personeli Navigasyonu
  const guvenlikNav = [
    { href: '/personel/guvenlik', label: 'Devriye & QR', icon: QrCode, key: 'devriye' },
    { href: '/personel/guvenlik?tab=olay', label: 'Olay Kaydı', icon: FileWarning, key: 'olay' },
    { href: '/personel/guvenlik?tab=ziyaretci', label: 'Ziyaretçiler', icon: Users, key: 'ziyaretci' },
  ];

  // Giriş sayfalarında bottom nav gösterme
  if (pathname === '/personel' || pathname === '/personel/login' || pathname === '/sakin/login') {
    return null;
  }

  let navItems = sakinNav;
  let activeTheme = 'indigo';

  if (pathname.startsWith('/personel/temizlik')) {
    navItems = temizlikNav;
    activeTheme = 'emerald';
  } else if (pathname.startsWith('/personel/guvenlik')) {
    navItems = guvenlikNav;
    activeTheme = 'blue';
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#060B14]/95 backdrop-blur-xl border-t border-[#151B2B] px-3 py-2">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          let isActive = false;

          if (pathname.startsWith('/personel/temizlik')) {
            if (item.key === 'gorevler') isActive = !currentTab || currentTab === 'gorevler';
            else if (item.key === 'malzeme') isActive = currentTab === 'malzeme';
            else if (item.key === 'bildirimler') isActive = currentTab === 'bildirimler';
          } else if (pathname.startsWith('/personel/guvenlik')) {
            if (item.key === 'devriye') isActive = !currentTab || currentTab === 'devriye';
            else if (item.key === 'olay') isActive = currentTab === 'olay';
            else if (item.key === 'ziyaretci') isActive = currentTab === 'ziyaretci';
          } else {
            isActive = pathname === item.href;
          }

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all ${
                isActive
                  ? activeTheme === 'emerald'
                    ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 font-bold shadow-sm'
                    : activeTheme === 'blue'
                    ? 'text-blue-400 bg-blue-950/50 border border-blue-500/40 font-bold shadow-sm'
                    : 'text-indigo-400 bg-indigo-950/50 border border-indigo-500/40 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] tracking-tight whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileBottomNav(props: MobileBottomNavProps) {
  return (
    <React.Suspense fallback={null}>
      <MobileBottomNavInner {...props} />
    </React.Suspense>
  );
}

