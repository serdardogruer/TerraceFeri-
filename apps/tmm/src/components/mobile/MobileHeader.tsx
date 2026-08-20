'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Bell, User, Shield, Building, Sparkles, LogOut } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backUrl?: string;
  badge?: string;
  staffName?: string;
  staffCode?: string;
  type?: 'sakin' | 'personel';
}

export function MobileHeader({
  title,
  subtitle,
  showBack = false,
  backUrl,
  badge,
  staffName,
  staffCode,
  type = 'sakin'
}: MobileHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tf_active_staff');
    }
    router.push('/personel');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#060B14]/95 backdrop-blur-xl border-b border-[#151B2B] px-3.5 py-2.5">
      <div className="flex items-center justify-between max-w-lg mx-auto gap-2">
        {/* Sol Alan: Logo / İkon ve Başlık */}
        <div className="flex items-center gap-2.5 min-w-0">
          {showBack ? (
            <button
              onClick={handleBack}
              className="w-8 h-8 bg-[#070A11] border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-colors shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
              type === 'sakin' 
                ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-400' 
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
            }`}>
              {type === 'sakin' ? <Building className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-xs font-bold text-white tracking-wide truncate">{title}</h1>
            {subtitle && (
              <p className="text-[10px] text-slate-400 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Sağ Alan: Personel Bilgisi & Çıkış veya Sakin Butonları */}
        <div className="flex items-center gap-1.5 shrink-0">
          {type === 'personel' ? (
            <div className="flex items-center gap-1.5">
              {/* Header İçi Personel Rozeti */}
              {(staffName || badge) && (
                <div className="px-2 py-1 bg-[#070A11] border border-emerald-500/40 rounded-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-300 truncate max-w-[100px]">
                    {staffName || badge}
                  </span>
                  {staffCode && (
                    <span className="text-[9px] font-mono px-1 py-0.2 bg-emerald-950/80 text-emerald-400 rounded border border-emerald-500/30">
                      {staffCode}
                    </span>
                  )}
                </div>
              )}

              {/* Çıkış Butonu */}
              <button
                type="button"
                onClick={handleLogout}
                title="Oturumu Kapat"
                className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Çıkış</span>
              </button>
            </div>
          ) : (
            <>
              {badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-indigo-900/20 text-indigo-300 border-indigo-500/30">
                  {badge}
                </span>
              )}
              <Link
                href="/sakin/duyurular"
                className="w-8 h-8 bg-[#070A11] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg flex items-center justify-center transition-colors relative"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('tf_active_resident');
                  }
                  router.push('/sakin/login');
                }}
                title="Sakin Çıkış"
                className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Çıkış</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
