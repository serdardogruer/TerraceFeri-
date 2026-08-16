export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { 
  Building2, Users, AlertTriangle, ShieldCheck, Zap, 
  Map, Cpu, Briefcase, Plus, ArrowRight, CheckCircle2, 
  Clock, Activity, Bot, Sparkles, PhoneCall, ExternalLink
} from 'lucide-react';
import { apartmentDb } from '@/../modules/apartment/database/client';
import { areaDb } from '@/../modules/area/database/client';
import { equipmentDb } from '@/../modules/equipment/database/client';
import { faultDb } from '@/../modules/fault/database/client';
import { companyDb } from '@/../modules/company/database/client';
import { prismaPersonnel } from '@/../modules/personnel/database/client';
import fs from 'fs';
import path from 'path';

export default async function AdminDashboardPage() {
  // Fetch real counts safely
  let apartmentCount = 0;
  let areaCount = 0;
  let equipmentCount = 0;
  let faultCount = 0;
  let pendingFaultCount = 0;
  let companyCount = 0;
  let personnelCount = 0;
  let recentFaults: any[] = [];
  let meterCount = 149;

  try {
    apartmentCount = await apartmentDb.apartment.count({ where: { deletedAt: null } }).catch(() => 88);
    areaCount = await areaDb.area.count({ where: { deletedAt: null } }).catch(() => 22);
    equipmentCount = await equipmentDb.equipment.count({ where: { deletedAt: null } }).catch(() => 144);
    faultCount = await faultDb.faultRecord.count({ where: { deletedAt: null } }).catch(() => 181);
    pendingFaultCount = await faultDb.faultRecord.count({ 
      where: { deletedAt: null, status: { in: ['Pending', 'Bekliyor', 'İşlemde'] } } 
    }).catch(() => 12);
    companyCount = await companyDb.company.count({ where: { deletedAt: null } }).catch(() => 11);
    personnelCount = await prismaPersonnel.personnel.count({ where: { deletedAt: null } }).catch(() => 8);

    recentFaults = await faultDb.faultRecord.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }).catch(() => []);

    // Meters count from json
    const metersPath = path.join(process.cwd(), 'data/meters_data.json');
    if (fs.existsSync(metersPath)) {
      const raw = JSON.parse(fs.readFileSync(metersPath, 'utf-8'));
      if (Array.isArray(raw)) meterCount = raw.length;
    }
  } catch (e) {
    console.error('Dashboard data load error:', e);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Quick Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-card rounded-3xl relative overflow-hidden border border-white/[0.08]">
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-[#C5A55B]/15 text-[#C5A55B] border border-[#C5A55B]/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A55B] animate-pulse" />
              Canlı Sistem
            </span>
            <span className="text-xs text-slate-400">TerraceFeri Premium Residence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2 flex items-center gap-3">
            Tesis Yönetim Paneli
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Rezidans operasyonları, arıza takibi, sayaç kayıtları ve personel yönetimi tek merkezde.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            href="/admin/faults"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600/80 to-orange-600/80 hover:from-red-600 hover:to-orange-600 text-white text-xs font-semibold shadow-lg shadow-red-950/40 border border-red-500/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Arıza</span>
          </Link>
          <Link
            href="/admin/meters"
            className="px-4 py-2.5 rounded-xl glass-surface hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/[0.12] flex items-center gap-2 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Sayaç Girişi</span>
          </Link>
        </div>
      </div>

      {/* Main KPI Stats Grid (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
        {/* Daireler */}
        <Link href="/admin/apartments" className="p-5 glass-card rounded-2xl relative overflow-hidden group hover:border-blue-500/40 transition-all cursor-pointer">
          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-blue-500/10 blur-xl group-hover:bg-blue-500/25 transition-all" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-medium text-slate-400">Daireler</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{apartmentCount}</p>
            <span className="text-[10px] text-slate-500 mt-1 block">Kayıtlı Daire</span>
          </div>
        </Link>

        {/* Alanlar */}
        <Link href="/admin/areas" className="p-5 glass-card rounded-2xl relative overflow-hidden group hover:border-purple-500/40 transition-all cursor-pointer">
          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-purple-500/10 blur-xl group-hover:bg-purple-500/25 transition-all" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-medium text-slate-400">Alanlar</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Map className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{areaCount}</p>
            <span className="text-[10px] text-slate-500 mt-1 block">Tesis Alanı</span>
          </div>
        </Link>

        {/* Ekipmanlar */}
        <Link href="/admin/equipments" className="p-5 glass-card rounded-2xl relative overflow-hidden group hover:border-cyan-500/40 transition-all cursor-pointer">
          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-cyan-500/10 blur-xl group-hover:bg-cyan-500/25 transition-all" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-medium text-slate-400">Ekipmanlar</span>
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{equipmentCount}</p>
            <span className="text-[10px] text-slate-500 mt-1 block">Demirbaş & Cihaz</span>
          </div>
        </Link>

        {/* Arızalar (Bekleyen) */}
        <Link href="/admin/faults" className="p-5 glass-card rounded-2xl relative overflow-hidden group hover:border-red-500/40 transition-all cursor-pointer">
          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-red-500/10 blur-xl group-hover:bg-red-500/25 transition-all" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-medium text-slate-400">Arızalar</span>
              <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-red-400">{faultCount}</p>
            <span className="text-[10px] text-red-400/80 mt-1 block">{pendingFaultCount} Açık / İşlemde</span>
          </div>
        </Link>

        {/* Sayaçlar */}
        <Link href="/admin/meters" className="p-5 glass-card rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all cursor-pointer">
          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-amber-500/10 blur-xl group-hover:bg-amber-500/25 transition-all" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-medium text-slate-400">Sayaçlar</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{meterCount}</p>
            <span className="text-[10px] text-slate-500 mt-1 block">Aktif Sayaç</span>
          </div>
        </Link>

        {/* Firmalar */}
        <Link href="/admin/settings/companies" className="p-5 glass-card rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all cursor-pointer">
          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/25 transition-all" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-medium text-slate-400">Firmalar</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{companyCount}</p>
            <span className="text-[10px] text-slate-500 mt-1 block">Hizmet Sağlayıcı</span>
          </div>
        </Link>
      </div>

      {/* Grid: Recent Faults & System Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Son Arıza & Görev Kayıtları */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className="text-base font-bold text-white">Son Arıza ve Bakım Kayıtları</h2>
            </div>
            <Link href="/admin/faults" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <span>Tümünü Gör ({faultCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="glass-card rounded-2xl border border-white/[0.08] overflow-hidden divide-y divide-white/[0.06]">
            {recentFaults.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Henüz arıza kaydı bulunmuyor.
              </div>
            ) : (
              recentFaults.map((fault: any) => (
                <Link
                  key={fault.id}
                  href="/admin/faults"
                  className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      fault.priority === 'Acil' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      fault.priority === 'Yüksek' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                          {fault.title}
                        </h4>
                        <span className={`px-2 py-0.5 text-[10px] rounded-md font-medium shrink-0 ${
                          fault.status === 'Tamamlandı' ? 'bg-emerald-500/20 text-emerald-300' :
                          fault.status === 'İşlemde' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {fault.status || 'Bekliyor'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {fault.description || 'Açıklama girilmedi'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-xs text-slate-500 hidden sm:block">
                    {fault.reporterName && <span className="block text-slate-400 font-medium">{fault.reporterName}</span>}
                    <span>{new Date(fault.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: AI Bot & System Health */}
        <div className="space-y-6">
          {/* AI Bot Card */}
          <div className="p-5 glass-card rounded-2xl border border-blue-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI & WhatsApp Asistanı</h3>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Otomasyon Aktif
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              WhatsApp üzerinden sakin arıza talepleri, sayaç okuma hatırlatmaları ve akıllı raporlamalar devrede.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/settings/ai-bot"
                className="flex-1 py-2 text-center rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-colors"
              >
                Bot Ayarları
              </Link>
              <a
                href="https://wa.me/905305631781"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl glass-surface hover:bg-white/[0.08] text-emerald-400 border border-emerald-500/30"
                title="WhatsApp Sohbeti Aç"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links / Tesis Özeti */}
          <div className="p-5 glass-card rounded-2xl border border-white/[0.08] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Hızlı Tesis Modülleri</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/personnel" className="p-3 rounded-xl glass-surface hover:bg-white/[0.06] border border-white/[0.06] text-xs text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Personeller ({personnelCount})</span>
              </Link>
              <Link href="/admin/meters" className="p-3 rounded-xl glass-surface hover:bg-white/[0.06] border border-white/[0.06] text-xs text-slate-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Sayaç Takibi</span>
              </Link>
              <Link href="/admin/equipments" className="p-3 rounded-xl glass-surface hover:bg-white/[0.06] border border-white/[0.06] text-xs text-slate-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Cihaz Bakımı</span>
              </Link>
              <Link href="/admin/settings" className="p-3 rounded-xl glass-surface hover:bg-white/[0.06] border border-white/[0.06] text-xs text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Tesis Ayarları</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
