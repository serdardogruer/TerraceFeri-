'use client';

import { useEffect, useState, useMemo } from 'react';
import { ApiClient } from '@/lib/api-client';
import { Plus, X, MapPin, Edit, Trash2, ChevronRight, Layers, Settings, Wrench, Search, Building } from 'lucide-react';
import Link from 'next/link';

interface Area {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  isDailyReport: boolean;
  isMonthlyReport: boolean;
  isManagerView: boolean;
  isHidden: boolean;
}

interface Equipment {
  id: string;
  areaId: string;
  name: string;
  code: string | null;
  type: string;
  isDailyReport: boolean;
  isMonthlyReport: boolean;
  isManagerView: boolean;
  isHidden: boolean;
}

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Tümü');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEqModalOpen, setIsEqModalOpen] = useState(false);

  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null);
  
  // Area Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('Genel Alan');
  const [parentId, setParentId] = useState('');
  
  // Equipment Form states
  const [eqEditingId, setEqEditingId] = useState<string | null>(null);
  const [eqAreaId, setEqAreaId] = useState('');
  const [eqName, setEqName] = useState('');
  const [eqCode, setEqCode] = useState('');
  const [eqType, setEqType] = useState('Genel Ekipman');

  // Shared Form states
  const [isDailyReport, setIsDailyReport] = useState(false);
  const [isMonthlyReport, setIsMonthlyReport] = useState(false);
  const [isManagerView, setIsManagerView] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [areasRes, eqRes] = await Promise.all([
          ApiClient.get<{ success: boolean; data: Area[] }>('/api/areas'),
          ApiClient.get<{ success: boolean; data: Equipment[] }>('/api/equipments')
        ]);
        
        if (isMounted) {
          if (areasRes?.success) setAreas(areasRes.data);
          if (eqRes?.success) setEquipments(eqRes.data);
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

  const openAreaModal = (area?: Area, defaultParentId?: string) => {
    if (area) {
      setEditingId(area.id);
      setName(area.name);
      setType(area.type);
      setParentId(area.parentId || '');
      setIsDailyReport(area.isDailyReport);
      setIsMonthlyReport(area.isMonthlyReport);
      setIsManagerView(area.isManagerView);
      setIsHidden(area.isHidden);
    } else {
      setEditingId(null);
      setName('');
      setType('Genel Alan');
      setParentId(defaultParentId || expandedAreaId || '');
      setIsDailyReport(false);
      setIsMonthlyReport(false);
      setIsManagerView(true);
      setIsHidden(false);
    }
    setIsModalOpen(true);
  };

  const closeAreaModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const openEqModal = (areaId: string, eq?: Equipment) => {
    setEqAreaId(areaId);
    if (eq) {
      setEqEditingId(eq.id);
      setEqName(eq.name);
      setEqCode(eq.code || '');
      setEqType(eq.type);
      setIsDailyReport(eq.isDailyReport);
      setIsMonthlyReport(eq.isMonthlyReport);
      setIsManagerView(eq.isManagerView);
      setIsHidden(eq.isHidden);
    } else {
      setEqEditingId(null);
      setEqName('');
      setEqCode('');
      setEqType('Genel Ekipman');
      setIsDailyReport(false);
      setIsMonthlyReport(false);
      setIsManagerView(true);
      setIsHidden(false);
    }
    setIsEqModalOpen(true);
  };

  const closeEqModal = () => {
    setIsEqModalOpen(false);
    setEqEditingId(null);
  };

  const handleAreaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingId) {
        const res = await ApiClient.put<{ success: boolean; data: Area }>(`/api/areas`, {
          id: editingId, name, type, parentId: parentId || null,
          isDailyReport, isMonthlyReport, isManagerView, isHidden
        });
        if (res?.success) {
          setAreas(areas.map(a => a.id === editingId ? res.data : a));
          closeAreaModal();
        }
      } else {
        const res = await ApiClient.post<{ success: boolean; data: Area }>('/api/areas', {
          name, type, parentId: parentId || null,
          isDailyReport, isMonthlyReport, isManagerView, isHidden
        });
        if (res?.success) {
          setAreas([...areas, res.data]);
          closeAreaModal();
        }
      }
    } catch (error) {
      console.error('Failed to save area', error);
    }
  };

  const handleEqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqName.trim()) return;

    try {
      if (eqEditingId) {
        const res = await ApiClient.put<{ success: boolean; data: Equipment }>(`/api/equipments`, {
          id: eqEditingId, areaId: eqAreaId, name: eqName, code: eqCode, type: eqType,
          isDailyReport, isMonthlyReport, isManagerView, isHidden
        });
        if (res?.success) {
          setEquipments(equipments.map(eq => eq.id === eqEditingId ? res.data : eq));
          closeEqModal();
        }
      } else {
        const res = await ApiClient.post<{ success: boolean; data: Equipment }>('/api/equipments', {
          areaId: eqAreaId, name: eqName, code: eqCode, type: eqType,
          isDailyReport, isMonthlyReport, isManagerView, isHidden
        });
        if (res?.success) {
          setEquipments([...equipments, res.data]);
          closeEqModal();
        }
      }
    } catch (error) {
      console.error('Failed to save equipment', error);
    }
  };

  const handleAreaDelete = async (id: string) => {
    if (!confirm('Bu alanı silmek istediğinize emin misiniz? Alt alanlar da etkilenebilir.')) return;
    try {
      const res = await fetch(`/api/areas?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAreas(areas.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete area', error);
    }
  };

  const handleEqDelete = async (id: string) => {
    if (!confirm('Bu ekipmanı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/equipments?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEquipments(equipments.filter(eq => eq.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete equipment', error);
    }
  };

  const areaCategories = ['Genel Alan', 'Bina / Blok', 'Sosyal Tesis', 'Otopark', 'Kat'];

  const filteredAreas = useMemo(() => {
    let result = areas.filter(a => !a.parentId); // Ana alanlar

    if (activeTab && activeTab !== 'Tümü') {
      result = result.filter(a => a.type === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = areas.filter(a => {
        const nameMatch = (a.name || '').toLowerCase().includes(q);
        const typeMatch = (a.type || '').toLowerCase().includes(q);
        return nameMatch || typeMatch;
      });
    }

    return result;
  }, [areas, activeTab, searchQuery]);

  const renderAreaCard = (area: Area, isSubArea = false) => {
    const children = areas.filter(a => a.parentId === area.id);
    const areaEquipments = equipments.filter(eq => eq.areaId === area.id);
    const isExpanded = expandedAreaId === area.id;
    const deviceCount = areaEquipments.length;
    const faultCount = 0; // Faults placeholder or calculated

    return (
      <div key={area.id} className="space-y-2">
        <div 
          onClick={() => setExpandedAreaId(isExpanded ? null : area.id)}
          className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-slate-900 border ${
            isExpanded ? 'border-purple-500/60 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/30'
          } rounded-xl transition-colors cursor-pointer ${isSubArea ? 'ml-6 border-l-4 border-l-purple-500/50' : ''}`}
        >
          {/* Data Boxes Row */}
          <div className="flex items-center justify-between gap-3 flex-1 overflow-x-auto py-1">
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col items-center justify-center w-[180px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">ALAN ADI</span>
                <span className="text-[13px] font-bold text-white truncate max-w-[170px] px-1">{area.name}</span>
              </div>

              <div className="flex flex-col items-center justify-center w-[120px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">TİP</span>
                <span className="text-[12px] font-bold text-purple-400 truncate max-w-[110px] px-1">{area.type}</span>
              </div>

              <div className="flex flex-col items-center justify-center w-[110px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">KONUM</span>
                <span className="text-[12px] font-bold text-slate-300 truncate max-w-[100px] px-1">
                  {isSubArea ? 'Alt Alan' : 'Ana Alan'}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center w-[95px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">CİHAZLAR</span>
                <span className="text-[13px] font-bold text-cyan-400">{deviceCount} Adet</span>
              </div>

              <div className="flex flex-col items-center justify-center w-[110px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">ALT SİSTEMLER</span>
                <span className="text-[13px] font-bold text-yellow-400">{children.length} Sistem</span>
              </div>

              <div className="flex flex-col items-center justify-center w-[85px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">ARIZALAR</span>
                <span className="text-[13px] font-bold text-red-500/70">{faultCount} Kayıt</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openAreaModal(area);
                }}
                className="p-2.5 bg-[#070A11] border border-blue-900/50 text-blue-500 hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10"
                title="Düzenle"
              >
                <Edit className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAreaDelete(area.id);
                }}
                className="p-2.5 bg-[#070A11] border border-red-900/50 text-red-500 hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10"
                title="Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedAreaId(isExpanded ? null : area.id);
                }}
                className={`p-2.5 bg-[#070A11] border border-[#151B2B] text-slate-400 hover:text-white hover:border-slate-700 rounded-lg transition-transform flex items-center justify-center w-10 h-10 ${
                  isExpanded ? 'rotate-90 text-purple-400 border-purple-500/40' : ''
                }`}
                title="Alt Alanları ve Ekipmanları Gör"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Accordion Body */}
        {isExpanded && (
          <div className="mt-2 ml-4 pl-4 border-l-2 border-slate-800/80 space-y-4 pb-2 animate-in fade-in duration-200">
            {/* Sub Areas Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                  {area.name} - Alt Alanları ({children.length})
                </h4>
                <button
                  onClick={() => openAreaModal(undefined, area.id)}
                  className="px-3 py-1 bg-purple-900/10 border border-purple-500/40 hover:bg-purple-900/30 text-purple-300 text-[11px] font-bold rounded-lg transition-colors flex items-center"
                >
                  <Plus className="w-3 h-3 mr-1" /> Alt Alan Ekle
                </button>
              </div>

              {children.length > 0 ? (
                <div className="space-y-2">
                  {children.map(child => renderAreaCard(child, true))}
                </div>
              ) : (
                <div className="bg-[#070A11] border border-[#151B2B] rounded-xl p-3 text-center text-xs text-slate-500">
                  Bu alana ait alt alan bulunmamaktadır.
                </div>
              )}
            </div>

            {/* Equipment under Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center uppercase tracking-wider">
                  <Wrench className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                  {area.name} - Ekipmanları & Cihazları ({areaEquipments.length})
                </h4>
                <button
                  onClick={() => openEqModal(area.id)}
                  className="px-3 py-1 bg-cyan-900/10 border border-cyan-500/40 hover:bg-cyan-900/30 text-cyan-300 text-[11px] font-bold rounded-lg transition-colors flex items-center"
                >
                  <Plus className="w-3 h-3 mr-1" /> Ekipman Ekle
                </button>
              </div>

              {areaEquipments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {areaEquipments.map(eq => (
                    <div 
                      key={eq.id}
                      className="bg-[#070A11] border border-[#151B2B] rounded-xl p-3 flex flex-col justify-between hover:border-cyan-500/40 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <Wrench className="w-4 h-4 text-cyan-500 shrink-0" />
                          <h5 className="text-xs font-bold text-white truncate max-w-[150px]">{eq.name}</h5>
                        </div>
                        <div className="flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEqModal(area.id, eq)}
                            className="p-1.5 bg-blue-900/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-900/40"
                            title="Düzenle"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleEqDelete(eq.id)}
                            className="p-1.5 bg-red-900/20 text-red-400 border border-red-500/30 rounded hover:bg-red-900/40"
                            title="Sil"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mt-1">
                        <span className="text-cyan-400/90 font-mono font-bold">{eq.code || '-'}</span>
                        <span className="px-2 py-0.5 bg-cyan-900/20 text-cyan-400 border border-cyan-500/20 rounded font-semibold text-[10px]">
                          {eq.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#070A11] border border-[#151B2B] rounded-xl p-3 text-center text-xs text-slate-500">
                  Bu alana ait kayıtlı cihaz/ekipman bulunmamaktadır.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

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
              <Layers className="w-6 h-6 text-purple-400" />
              Alanlar Yönetimi
            </h1>
            <p className="text-slate-400 text-sm mt-1">Teknik odalar, katlar, bloklar ve otomatik senkronize alt sistemler</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap">
              Yönetim Raporu Al (A4 PDF)
            </button>
            <button
              onClick={() => openAreaModal()}
              className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-purple-900/10 border border-purple-500/40 hover:bg-purple-900/30 text-purple-300 text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Yeni Alan Ekle
            </button>
          </div>
        </div>

        {/* Search and Category Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('Tümü')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'Tümü' 
                  ? 'text-purple-400 border-purple-500 font-bold' 
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              Tüm Alanlar
            </button>
            {areaCategories.map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === t 
                    ? 'text-purple-400 border-purple-500 font-bold' 
                    : 'text-slate-400 border-transparent hover:text-slate-300'
                }`}
              >
                {t}
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
              placeholder="Alan Adı, Tipi veya Konum ara..."
              className="w-full pl-10 pr-9 py-2 bg-[#070A11] border border-[#151B2B] focus:border-purple-500 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 outline-none transition-colors"
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

      {/* Areas List */}
      <div className="space-y-3">
        {filteredAreas.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-sm">
            {searchQuery ? 'Arama kriterlerinize uygun alan bulunamadı.' : 'Henüz kayıtlı alan bulunmamaktadır.'}
          </div>
        ) : (
          filteredAreas.map((area) => renderAreaCard(area))
        )}
      </div>

      {/* AREA Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeAreaModal}>
          <div className="bg-[#0f121b] border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-[#080b12]">
              <h3 className="text-lg font-bold text-white flex items-center tracking-wide">
                <Layers className="w-5 h-5 mr-2 text-purple-500" /> {editingId ? 'Alanı Düzenle' : 'Yeni Alan Ekle'}
              </h3>
              <button onClick={closeAreaModal} className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAreaSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Alan Adı *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-600 text-sm"
                    placeholder="Örn: Havalandırma, Havuz, A Blok..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Türü</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-purple-500/50 appearance-none text-sm"
                    >
                      <option value="Genel Alan">Genel Alan</option>
                      <option value="Bina / Blok">Bina / Blok</option>
                      <option value="Kat">Kat</option>
                      <option value="Oda">Oda</option>
                      <option value="Çatı / Depo">Çatı / Depo</option>
                      <option value="Sosyal Tesis">Sosyal Tesis</option>
                      <option value="Otopark">Otopark</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bağlı Olduğu Alan</label>
                    <select
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-purple-500/50 appearance-none text-sm"
                    >
                      <option value="">- Bağımsız (Ana Alan) -</option>
                      {areas.map(area => (
                        <option key={area.id} value={area.id}>
                          {area.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Raporlama Seçenekleri */}
              <div className="pt-5 border-t border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Yönetim Raporu Seçenekleri</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-3 p-3 bg-[#080b12] border border-slate-800 rounded-md cursor-pointer hover:border-slate-700 transition-colors">
                    <input type="checkbox" checked={isDailyReport} onChange={e => setIsDailyReport(e.target.checked)} className="w-4 h-4 text-purple-600 rounded-md border-slate-700 bg-[#0f121b] focus:ring-purple-600 focus:ring-offset-[#080b12]" />
                    <span className="text-xs text-slate-300 font-medium">Gün Sonu Raporu</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-[#080b12] border border-slate-800 rounded-md cursor-pointer hover:border-slate-700 transition-colors">
                    <input type="checkbox" checked={isMonthlyReport} onChange={e => setIsMonthlyReport(e.target.checked)} className="w-4 h-4 text-purple-600 rounded-md border-slate-700 bg-[#0f121b] focus:ring-purple-600 focus:ring-offset-[#080b12]" />
                    <span className="text-xs text-slate-300 font-medium">Ay Sonu Raporu</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-[#080b12] border border-slate-800 rounded-md cursor-pointer hover:border-slate-700 transition-colors">
                    <input type="checkbox" checked={isManagerView} onChange={e => setIsManagerView(e.target.checked)} className="w-4 h-4 text-purple-600 rounded-md border-slate-700 bg-[#0f121b] focus:ring-purple-600 focus:ring-offset-[#080b12]" />
                    <span className="text-xs text-slate-300 font-medium">Yöneticiye Göster</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-[#080b12] border border-slate-800 rounded-md cursor-pointer hover:border-slate-700 transition-colors">
                    <input type="checkbox" checked={isHidden} onChange={e => setIsHidden(e.target.checked)} className="w-4 h-4 text-rose-500 rounded-md border-slate-700 bg-[#0f121b] focus:ring-rose-500 focus:ring-offset-[#080b12]" />
                    <span className="text-xs text-slate-400 font-medium text-rose-400/80">Gizli (Arşiv)</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end space-x-3">
                <button type="button" onClick={closeAreaModal} className="px-5 py-2.5 bg-transparent text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                  İptal
                </button>
                <button type="submit" className="px-6 py-2.5 bg-purple-900/10 border border-purple-500/40 hover:bg-purple-900/30 text-purple-300 text-xs font-bold rounded-md transition-colors whitespace-nowrap shadow-lg shadow-purple-500/10">
                  {editingId ? 'Değişiklikleri Kaydet' : 'Alanı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EQUIPMENT Modal Popup */}
      {isEqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeEqModal}>
          <div className="bg-[#0f121b] border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-[#080b12]">
              <h3 className="text-lg font-bold text-white flex items-center tracking-wide">
                <Settings className="w-5 h-5 mr-2 text-cyan-500" /> {eqEditingId ? 'Ekipmanı Düzenle' : 'Yeni Ekipman Ekle'}
              </h3>
              <button onClick={closeEqModal} className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleEqSubmit} className="p-6 space-y-6">
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
              </div>

              {/* Raporlama Seçenekleri (Equipment) */}
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
                <button type="button" onClick={closeEqModal} className="px-5 py-2.5 bg-transparent text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                  İptal
                </button>
                <button type="submit" className="px-6 py-2.5 bg-cyan-900/10 border border-cyan-500/40 hover:bg-cyan-900/30 text-cyan-300 text-xs font-bold rounded-md transition-colors whitespace-nowrap shadow-lg shadow-cyan-500/10">
                  {eqEditingId ? 'Değişiklikleri Kaydet' : 'Ekipmanı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
