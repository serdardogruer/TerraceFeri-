'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, 
  Calendar, 
  Bell, 
  MessageSquare, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Building2, 
  FileText,
  Sparkles,
  ChevronRight,
  Plus,
  User
} from 'lucide-react';
import { MobileHeader } from '@/components/mobile/MobileHeader';

export default function SakinHomePage() {
  const router = useRouter();

  // Aktif Sakin Bilgisi (Giriş Yapılan Daire)
  const [resident, setResident] = useState({
    code: 'SAK-42',
    name: 'Ahmet Yılmaz',
    phone: '0532 111 22 33',
    block: 'A Blok',
    apartmentNo: '42',
    floor: 'Kat 4',
    type: 'Mülk Sahibi'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tf_active_resident');
      if (saved) {
        try {
          setResident(JSON.parse(saved));
        } catch (e) {}
      } else {
        router.push('/sakin/login');
      }
    }
  }, [router]);

  const [activeRequests] = useState([
    {
      id: 'REQ-104',
      date: '20.08.2026',
      type: 'ELEKTRİK',
      subject: 'Kat holü aydınlatma arızası',
      status: 'Teknik Ekipte',
      statusCode: 'in_progress',
      statusColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    },
    {
      id: 'REQ-098',
      date: '18.08.2026',
      type: 'TEMİZLİK',
      subject: 'B Blok -1 Asansör önü paspas değişimi',
      status: 'Tamamlandı',
      statusCode: 'completed',
      statusColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    }
  ]);

  const announcements = [
    {
      id: '1',
      date: '19.08.2026',
      title: 'Periyodik Havuz Bakımı ve İlaçlama',
      category: 'Tesis Duyurusu',
      badgeColor: 'text-blue-400 border-blue-500/30'
    },
    {
      id: '2',
      date: '17.08.2026',
      title: 'Açık Otopark Çizgi Yenileme Çalışması',
      category: 'Genel',
      badgeColor: 'text-indigo-400 border-indigo-500/30'
    }
  ];

  return (
    <div className="space-y-4 pb-12">
      <MobileHeader 
        title="TERRACE FERİ" 
        subtitle={`${resident.block} - Daire ${resident.apartmentNo} (${resident.name})`}
        badge="Sakin Portalı"
        type="sakin"
      />

      {/* Daire & Durum Özeti Kartı */}
      <div className="p-4 rounded-xl bg-gradient-to-b from-[#0A101D] to-[#070A11] border border-[#151B2B] relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Bağımsız Bölüm • {resident.type}
              </span>
              <h2 className="text-sm font-bold text-white">
                {resident.block}, {resident.floor}, No: {resident.apartmentNo}
              </h2>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-lg flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {resident.name.split(' ')[0]}
          </span>
        </div>

        {/* 2 Data Box Kutucuğu (Kural 4) */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#151B2B]/80 text-xs">
          <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">AÇIK TALEPLER</span>
            <span className="text-xs font-bold text-amber-400">1 Devam Eden</span>
          </div>

          <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">YAKLAŞAN REZERVASYON</span>
            <span className="text-xs font-bold text-indigo-300">Yarın 18:00 (Havuz)</span>
          </div>
        </div>
      </div>

      {/* Hızlı İşlemler */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Hızlı İşlemler</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/sakin/talepler?yeni=true"
            className="p-3.5 rounded-xl bg-[#070A11] border border-[#151B2B] hover:border-indigo-500/40 transition-all flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-indigo-950/40 text-indigo-400 border border-indigo-500/30">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <Plus className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Arıza / Talep Bildir</span>
              <span className="text-[10px] text-slate-400">Teknik veya temizlik talebi</span>
            </div>
          </Link>

          <Link
            href="/sakin/randevular"
            className="p-3.5 rounded-xl bg-[#070A11] border border-[#151B2B] hover:border-indigo-500/40 transition-all flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-950/40 text-blue-400 border border-blue-500/30">
                <Calendar className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Tesis Randevusu</span>
              <span className="text-[10px] text-slate-400">Havuz & sosyal tesis</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Son Taleplerim */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Son Taleplerim</h3>
          <Link href="/sakin/talepler" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
            Tümü <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {activeRequests.map((req) => (
            <div
              key={req.id}
              className="p-3 rounded-xl bg-[#070A11] border border-[#151B2B] hover:border-slate-700 transition-all space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> {req.date}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${req.statusColor}`}>
                  {req.status}
                </span>
              </div>

              {/* Data Box Veri Kutucukları (Kural 4) */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-1 text-center">
                  <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">KOD</span>
                  <span className="text-xs font-bold text-white truncate w-full">{req.id}</span>
                </div>
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-1 text-center">
                  <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">TÜR</span>
                  <span className="text-xs font-bold text-indigo-300 truncate w-full">{req.type}</span>
                </div>
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-1 text-center">
                  <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">DURUM</span>
                  <span className="text-xs font-bold text-amber-400 truncate w-full">{req.status}</span>
                </div>
              </div>

              <div className="pt-1 border-t border-[#151B2B] flex items-center justify-between">
                <p className="text-xs font-medium text-slate-200 truncate">{req.subject}</p>
                <Link href={`/sakin/talepler?id=${req.id}`} className="text-slate-500 hover:text-slate-300">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Duyurular */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Güncel Duyurular</h3>
          <Link href="/sakin/duyurular" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
            Tümü <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-2">
          {announcements.map((item) => (
            <Link
              key={item.id}
              href="/sakin/duyurular"
              className="p-3 rounded-xl bg-[#070A11] border border-[#151B2B] hover:border-slate-700 transition-all flex items-center justify-between group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-950/40 text-blue-400 border border-blue-500/30">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${item.badgeColor}`}>
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
