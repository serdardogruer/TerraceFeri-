'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { Plus, X, Settings, Wrench, Edit, Trash2, MapPin, Search, ChevronRight, AlertTriangle } from 'lucide-react';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface Equipment {
  id: string;
  areaId: string | null;
  name: string;
  code: string | null;
  type: string;
  isDailyReport: boolean;
  isMonthlyReport: boolean;
  isManagerView: boolean;
  isHidden: boolean;
}

interface Area {
  id: string;
  name: string;
}

export default function EquipmentsPage() {
  const { canCreate, canEdit, canDelete, isSuperAdmin } = useUserPermissions('equipments');
  const [equipments, setEquipments] = useState<Equipment[]>([]);


  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Tümü');

  const [faultCounts, setFaultCounts] = useState<Record<string, number>>({});
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [eqAreaId, setEqAreaId] = useState('');
  const [eqName, setEqName] = useState('');
  const [eqCode, setEqCode] = useState('');
  const [eqType, setEqType] = useState('Genel Ekipman');
  const [isDailyReport, setIsDailyReport] = useState(false);
  const [isMonthlyReport, setIsMonthlyReport] = useState(false);
  const [isManagerView, setIsManagerView] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [eqRes, areasRes, faultsRes] = await Promise.all([
          ApiClient.get<{ success: boolean; data: Equipment[] }>('/api/equipments'),
          ApiClient.get<{ success: boolean; data: Area[] }>('/api/areas'),
          ApiClient.get<{ success: boolean; data: { id: string; equipmentId: string }[] }>('/api/faults')
        ]);

        if (isMounted) {
          if (eqRes?.success) setEquipments(eqRes.data);
          if (areasRes?.success) setAreas(areasRes.data);
          
          if (faultsRes?.success) {
            const counts: Record<string, number> = {};
            faultsRes.data.forEach(fault => {
              if (fault.equipmentId) {
                counts[fault.equipmentId] = (counts[fault.equipmentId] || 0) + 1;
              }
            });
            setFaultCounts(counts);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);

  const categories = ['Mekanik', 'Elektrik', 'Elektronik', 'Tesisat', 'Aydınlatma', 'Genel Ekipman'];

  const openModal = (eq?: Equipment) => {
    if (eq) {
      setEditingId(eq.id);
      setEqAreaId(eq.areaId || '');
      setEqName(eq.name);
      setEqCode(eq.code || '');
      setEqType(eq.type);
      setIsDailyReport(eq.isDailyReport);
      setIsMonthlyReport(eq.isMonthlyReport);
      setIsManagerView(eq.isManagerView);
      setIsHidden(eq.isHidden);
    } else {
      setEditingId(null);
      setEqAreaId('');
      setEqName('');
      setEqCode('');
      setEqType(activeTab !== 'Tümü' ? activeTab : 'Genel Ekipman');
      setIsDailyReport(false);
      setIsMonthlyReport(false);
      setIsManagerView(true);
      setIsHidden(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqName.trim()) return;

    try {
      const payload = {
        areaId: eqAreaId || null,
        name: eqName,
        code: eqCode,
        type: eqType,
        isDailyReport,
        isMonthlyReport,
        isManagerView,
        isHidden
      };

      if (editingId) {
        const res = await ApiClient.put<{ success: boolean; data: Equipment }>(`/api/equipments`, {
          id: editingId, ...payload
        });
        if (res?.success) {
          setEquipments(equipments.map(eq => eq.id === editingId ? res.data : eq));
          closeModal();
        }
      } else {
        const res = await ApiClient.post<{ success: boolean; data: Equipment }>('/api/equipments', payload);
        if (res?.success) {
          setEquipments([res.data, ...equipments]);
          closeModal();
        }
      }
    } catch (error) {
      console.error('Failed to save equipment', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      alert('Bu işlemi yapmaya yetkiniz bulunmamaktadır (Silme Yetkisi Kapalı).');
      return;
    }
    if (!confirm('Bu ekipmanı silmek istediğinize emin misiniz? Arıza kayıtları da etkilenecektir.')) return;
    try {
      const res = await fetch(`/api/equipments?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEquipments(equipments.filter(eq => eq.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete equipment', error);
    }
  };


  const getAreaName = (areaId: string | null) => {
    if (!areaId) return 'Alansız (Bağımsız)';
    const area = areas.find(a => a.id === areaId);
    return area ? area.name : 'Bilinmeyen Alan';
  };

  const filteredEquipments = useMemo(() => {
    let result = equipments;

    if (activeTab && activeTab !== 'Tümü') {
      const tabLower = activeTab.toLowerCase();
      result = result.filter(eq => {
        const typeLower = (eq.type || '').toLowerCase();
        if (activeTab === 'Genel Ekipman') {
          return typeLower === 'genel ekipman' || (!['mekanik', 'elektrik', 'elektronik', 'tesisat', 'aydınlatma'].some(c => typeLower.includes(c)));
        }
        return typeLower.includes(tabLower);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(eq => {
        const nameMatch = (eq.name || '').toLowerCase().includes(q);
        const codeMatch = (eq.code || '').toLowerCase().includes(q);
        const typeMatch = (eq.type || '').toLowerCase().includes(q);
        const areaMatch = getAreaName(eq.areaId).toLowerCase().includes(q);
        return nameMatch || codeMatch || typeMatch || areaMatch;
      });
    }

    return result;
  }, [equipments, activeTab, searchQuery, areas]);

  function formatTitleCase(str: string | undefined | null) {
    if (!str) return '-';
    return str
      .toLocaleLowerCase('tr-TR')
      .split(' ')
      .map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
      .join(' ');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sticky Fixed Header Container */}
      <div className="sticky -top-6 z-30 bg-[#060B14]/95 backdrop-blur-md pt-6 pb-4 border-b border-slate-800/80 -mx-6 px-6 space-y-4 shadow-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Wrench className="w-6 h-6 text-cyan-400" />
              Ekipmanlar & Cihazlar
            </h1>
            <p className="text-slate-400 text-sm mt-1">Sistemdeki tüm demirbaşlar, cihazlar ve arıza noktaları</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap">
              Yönetim Raporu Al (A4 PDF)
            </button>
            {canCreate && (
              <button
                onClick={() => openModal()}
                className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-cyan-900/10 border border-cyan-500/40 hover:bg-cyan-900/30 text-cyan-300 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Yeni Ekipman Ekle
              </button>
            )}
          </div>

        </div>

        {/* Search and Type Tabs Container */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          {/* Type Tabs */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('Tümü')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'Tümü' 
                  ? 'text-cyan-400 border-cyan-500 font-bold' 
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              Tüm Ekipmanlar ({equipments.length})
            </button>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveTab(c)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === c 
                    ? 'text-cyan-400 border-cyan-500 font-bold' 
                    : 'text-slate-400 border-transparent hover:text-slate-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Global Multi-Column Search Input Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ekipman Adı, Kodu, Türü, Alan ara..."
              className="w-full pl-10 pr-9 py-2 bg-[#070A11] border border-[#151B2B] focus:border-cyan-500 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 outline-none transition-colors"
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

      {/* Equipment List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredEquipments.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-sm">
            {searchQuery ? 'Arama kriterlerinize uygun ekipman bulunamadı.' : 'Bu kategoride henüz kayıtlı ekipman bulunmamaktadır.'}
          </div>
        ) : (
          filteredEquipments.map((eq) => (
            <div 
              key={eq.id}
              onClick={() => openModal(eq)}
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-800/30 transition-colors cursor-pointer"
            >
              {/* Badges and data boxes */}
              <div className="flex items-center justify-between gap-3 flex-1 overflow-x-auto py-1">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-center justify-center w-[180px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">EKİPMAN ADI</span>
                    <span className="text-[13px] font-bold text-white truncate max-w-[170px] px-1">{eq.name}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center w-[100px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">KOD</span>
                    <span className="text-[12px] font-bold font-mono text-cyan-400 truncate max-w-[90px] px-1">
                      {eq.code || 'KOD YOK'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center w-[120px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">TÜR</span>
                    <span className="text-[12px] font-bold text-purple-400 truncate max-w-[110px] px-1">{eq.type}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center w-[160px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">BAĞLI ALAN</span>
                    <span className="text-[12px] font-bold text-amber-500 truncate max-w-[150px] px-1">{getAreaName(eq.areaId)}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center w-[95px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">GÜN SONU</span>
                    <span className={`text-[12px] font-bold ${eq.isDailyReport ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {eq.isDailyReport ? 'Dahil' : 'Hariç'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center w-[95px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">AY SONU</span>
                    <span className={`text-[12px] font-bold ${eq.isMonthlyReport ? 'text-blue-400' : 'text-slate-500'}`}>
                      {eq.isMonthlyReport ? 'Dahil' : 'Hariç'}
                    </span>
                  </div>

                  {/* Arızalar Stat Box */}
                  <div className="flex flex-col items-center justify-center w-[85px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">ARIZALAR</span>
                    <span className={`text-[13px] font-bold ${(faultCounts[eq.id] || 0) > 0 ? 'text-red-400 font-extrabold animate-pulse' : 'text-red-500/70'}`}>
                      {faultCounts[eq.id] || 0} Kayıt
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-2">
                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(eq);
                      }}
                      className="p-2.5 bg-[#070A11] border border-blue-900/50 text-blue-500 hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10 cursor-pointer"
                      title="Düzenle"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(eq.id);
                      }}
                      className="p-2.5 bg-[#070A11] border border-red-900/50 text-red-500 hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10 cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <Link
                    href={`/admin/equipments/${eq.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2.5 bg-[#070A11] border border-[#151B2B] text-slate-400 hover:text-white hover:border-slate-700 rounded-lg transition-colors flex items-center justify-center w-10 h-10 cursor-pointer"
                    title="Ekipman Detayına Git"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* EQUIPMENT Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}>
          <div className="bg-[#0f121b] border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-[#080b12]">
              <h3 className="text-lg font-bold text-white flex items-center tracking-wide">
                <Settings className="w-5 h-5 mr-2 text-cyan-500" /> {editingId ? 'Ekipmanı Düzenle' : 'Yeni Ekipman Ekle'}
              </h3>
              <button onClick={closeModal} className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ekipman / Cihaz Adı *</label>
                  <input
                    type="text"
                    value={eqName}
                    onChange={(e) => setEqName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600 text-sm"
                    placeholder="Örn: Ana Sirkülasyon Pompası..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ekipman Kodu</label>
                    <input
                      type="text"
                      value={eqCode}
                      onChange={(e) => setEqCode(e.target.value)}
                      className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600 text-sm"
                      placeholder="Örn: PMP-01"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Türü</label>
                    <select
                      value={eqType}
                      onChange={(e) => setEqType(e.target.value)}
                      className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-cyan-500/50 appearance-none text-sm"
                    >
                      <option value="Mekanik">Mekanik</option>
                      <option value="Elektrik">Elektrik</option>
                      <option value="Elektronik">Elektronik</option>
                      <option value="Tesisat">Tesisat</option>
                      <option value="Aydınlatma">Aydınlatma</option>
                      <option value="Genel Ekipman">Genel Ekipman</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bağlı Olduğu Alan</label>
                  <select
                    value={eqAreaId}
                    onChange={(e) => setEqAreaId(e.target.value)}
                    className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-cyan-500/50 appearance-none text-sm"
                  >
                    <option value="">- Alansız (Bağımsız Cihaz) -</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Raporlama Seçenekleri */}
              <div className="pt-5 border-t border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Yönetim Raporu Seçenekleri</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-3 p-3 bg-[#080b12] border border-slate-800 rounded-md cursor-pointer hover:border-slate-700 transition-colors">
                    <input type="checkbox" checked={isDailyReport} onChange={e => setIsDailyReport(e.target.checked)} className="w-4 h-4 text-cyan-600 rounded-md border-slate-700 bg-[#0f121b] focus:ring-cyan-600 focus:ring-offset-[#080b12]" />
                    <span className="text-xs text-slate-300 font-medium">Gün Sonu Raporu</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-[#080b12] border border-slate-800 rounded-md cursor-pointer hover:border-slate-700 transition-colors">
                    <input type="checkbox" checked={isMonthlyReport} onChange={e => setIsMonthlyReport(e.target.checked)} className="w-4 h-4 text-cyan-600 rounded-md border-slate-700 bg-[#0f121b] focus:ring-cyan-600 focus:ring-offset-[#080b12]" />
                    <span className="text-xs text-slate-300 font-medium">Ay Sonu Raporu</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-[#080b12] border border-slate-800 rounded-md cursor-pointer hover:border-slate-700 transition-colors">
                    <input type="checkbox" checked={isManagerView} onChange={e => setIsManagerView(e.target.checked)} className="w-4 h-4 text-cyan-600 rounded-md border-slate-700 bg-[#0f121b] focus:ring-cyan-600 focus:ring-offset-[#080b12]" />
                    <span className="text-xs text-slate-300 font-medium">Yöneticiye Göster</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-[#080b12] border border-slate-800 rounded-md cursor-pointer hover:border-slate-700 transition-colors">
                    <input type="checkbox" checked={isHidden} onChange={e => setIsHidden(e.target.checked)} className="w-4 h-4 text-rose-500 rounded-md border-slate-700 bg-[#0f121b] focus:ring-rose-500 focus:ring-offset-[#080b12]" />
                    <span className="text-xs text-slate-400 font-medium text-rose-400/80">Gizli (Arşiv)</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-transparent text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer">
                  İptal
                </button>
                {((editingId && canEdit) || (!editingId && canCreate)) && (
                  <button type="submit" className="px-6 py-2.5 bg-cyan-900/10 border border-cyan-500/40 hover:bg-cyan-900/30 text-cyan-300 text-xs font-bold rounded-md transition-colors whitespace-nowrap shadow-lg shadow-cyan-500/10 cursor-pointer">
                    {editingId ? 'Değişiklikleri Kaydet' : 'Ekipmanı Kaydet'}
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
