'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Users, Clock, Search, Plus, Settings, X, ChevronRight, Phone, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface Timesheet {
  id: string;
  type: string; // ENTRY, EXIT
  scanTime: Date | string;
}

interface PersonnelItem {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  tcNo: string | null;
  shiftStartTime: string;
  shiftEndTime: string;
  status: string; // ACTIVE, INACTIVE
  timesheets: Timesheet[];
}

interface PersonnelListClientProps {
  initialPersonnel: PersonnelItem[];
}

export default function PersonnelListClient({ initialPersonnel }: PersonnelListClientProps) {
  const { canCreate, canEdit, canDelete, isSuperAdmin } = useUserPermissions('personnel');
  const [personnelList] = useState<PersonnelItem[]>(initialPersonnel);


  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Tümü');

  const filteredPersonnel = useMemo(() => {
    let result = personnelList;

    if (activeTab === 'Aktif') {
      result = result.filter(p => p.status === 'ACTIVE');
    } else if (activeTab === 'Pasif') {
      result = result.filter(p => p.status !== 'ACTIVE');
    } else if (activeTab === 'Giriş Yapanlar') {
      result = result.filter(p => p.timesheets[0]?.type === 'ENTRY');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
        const phone = (p.phone || '').toLowerCase();
        const tc = (p.tcNo || '').toLowerCase();
        return fullName.includes(q) || phone.includes(q) || tc.includes(q);
      });
    }

    return result;
  }, [personnelList, activeTab, searchQuery]);

  function formatTitleCase(str: string | undefined | null) {
    if (!str) return '-';
    return str
      .toLocaleLowerCase('tr-TR')
      .split(' ')
      .map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
      .join(' ');
  }

  return (
    <div className="space-y-4">
      {/* Sticky Fixed Header Container */}
      <div className="sticky -top-6 z-30 bg-[#060B14]/95 backdrop-blur-md pt-6 pb-4 border-b border-slate-800/80 -mx-6 px-6 space-y-4 shadow-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-orange-500" />
              Personel Yönetimi
            </h1>
            <p className="text-slate-400 text-sm mt-1">Personel listesi, vardiyalar, QR kod ve günlük giriş/çıkış takibi</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/admin/personnel/settings"
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              <Settings className="w-4 h-4 mr-1.5 text-slate-400" />
              Vardiya Ayarları
            </Link>
            {canCreate && (
              <Link
                href="/admin/personnel/new"
                className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-orange-900/10 border border-orange-500/40 hover:bg-orange-900/30 text-orange-400 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Yeni Personel Ekle
              </Link>
            )}
          </div>

        </div>

        {/* Search and Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('Tümü')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'Tümü' 
                  ? 'text-orange-400 border-orange-500 font-bold' 
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              Tüm Personeller ({personnelList.length})
            </button>
            <button
              onClick={() => setActiveTab('Aktif')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'Aktif' 
                  ? 'text-orange-400 border-orange-500 font-bold' 
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              Aktif ({personnelList.filter(p => p.status === 'ACTIVE').length})
            </button>
            <button
              onClick={() => setActiveTab('Giriş Yapanlar')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'Giriş Yapanlar' 
                  ? 'text-orange-400 border-orange-500 font-bold' 
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              Bugün Giriş Yapanlar ({personnelList.filter(p => p.timesheets[0]?.type === 'ENTRY').length})
            </button>
            <button
              onClick={() => setActiveTab('Pasif')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'Pasif' 
                  ? 'text-orange-400 border-orange-500 font-bold' 
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              Pasif ({personnelList.filter(p => p.status !== 'ACTIVE').length})
            </button>
          </div>

          {/* Global Multi-Column Search Input Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İsim, Telefon veya TC ara..."
              className="w-full pl-10 pr-9 py-2 bg-[#070A11] border border-[#151B2B] focus:border-orange-500 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Personnel List Items */}
      <div className="grid grid-cols-1 gap-3">
        {filteredPersonnel.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-sm">
            {searchQuery ? 'Arama kriterlerinize uygun personel bulunamadı.' : 'Henüz kayıtlı personel bulunmamaktadır.'}
          </div>
        ) : (
          filteredPersonnel.map((person) => {
            const lastScan = person.timesheets[0];
            return (
              <div 
                key={person.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-800/30 transition-colors"
              >
                {/* Badges / Box Container */}
                <div className="flex items-center justify-between gap-3 flex-1 overflow-x-auto py-1">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-center justify-center w-[170px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">PERSONEL</span>
                      <span className="text-[13px] font-bold text-white truncate max-w-[160px] px-1">
                        {person.firstName} {person.lastName}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center w-[130px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">TELEFON</span>
                      <span className="text-[11px] font-bold font-mono text-amber-500 truncate max-w-[120px] px-1">
                        {person.phone || '-'}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center w-[120px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">TC KİMLİK</span>
                      <span className="text-[11px] font-bold font-mono text-cyan-400 truncate max-w-[110px] px-1">
                        {person.tcNo || 'GİRİLMEDİ'}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center w-[120px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">VARDİYA</span>
                      <span className="text-[11px] font-bold text-slate-300 truncate max-w-[110px] px-1">
                        {person.shiftStartTime} - {person.shiftEndTime}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center w-[160px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">SON İŞLEM (BUGÜN)</span>
                      {lastScan ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${lastScan.type === 'ENTRY' ? 'bg-green-400' : 'bg-orange-500'}`} />
                          <span className={`text-[11px] font-bold ${lastScan.type === 'ENTRY' ? 'text-green-400' : 'text-orange-400'}`}>
                            {lastScan.type === 'ENTRY' ? 'Giriş: ' : 'Çıkış: '}
                            {format(new Date(lastScan.scanTime), "HH:mm", { locale: tr })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium">İşlem Yok</span>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center w-[95px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">DURUM</span>
                      <span className={`text-[12px] font-bold ${person.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}`}>
                        {person.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-2">
                    <Link
                      href={`/admin/personnel/settings`}
                      className="p-2.5 bg-[#070A11] border border-[#151B2B] text-slate-400 hover:text-white hover:border-slate-700 rounded-lg transition-colors flex items-center justify-center w-10 h-10"
                      title="Detay & Ayarlar"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
