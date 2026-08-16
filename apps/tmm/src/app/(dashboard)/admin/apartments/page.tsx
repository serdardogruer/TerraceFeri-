'use client';

import { useEffect, useState, useMemo } from 'react';
import { ApiClient } from '@/lib/api-client';
import { 
  Building, Plus, X, Edit, Trash2, Save, Car, Home, ChevronRight, Search, Wrench, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';
import Link from 'next/link';

interface Apartment {
  id: string;
  block: string;
  unit: string;
  shortCode: string;
  residentName: string;
  status: string; // Mülk Sahibi, Kiracı, Boş
  floor: string;
  type: string;
  phone?: string | null;
  plate1?: string | null;
  plate2?: string | null;
  plate3?: string | null;
}

export default function ApartmentsPage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [faults, setFaults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tabs
  const blocks = useMemo(() => {
    const uniqueBlocks = Array.from(new Set(apartments.map(a => a.block)));
    return uniqueBlocks.sort();
  }, [apartments]);
  
  const [activeTab, setActiveTab] = useState<string>('Tümü');

  // Auto-select first tab if activeTab is unset
  useEffect(() => {
    if (blocks.length > 0 && !activeTab) {
      setTimeout(() => setActiveTab('Tümü'), 0);
    }
  }, [blocks, activeTab]);

  // Apartment Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [block, setBlock] = useState('A Blok');
  const [unit, setUnit] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [residentName, setResidentName] = useState('');
  const [status, setStatus] = useState('Mülk Sahibi');
  const [floor, setFloor] = useState('0');
  const [type, setType] = useState('2+1');
  const [phone, setPhone] = useState('');
  const [plate1, setPlate1] = useState('');
  const [plate2, setPlate2] = useState('');
  const [plate3, setPlate3] = useState('');

  // Fault Modal State
  const [selectedApartmentForFaults, setSelectedApartmentForFaults] = useState<Apartment | null>(null);
  const [newFaultTitle, setNewFaultTitle] = useState('');
  const [newFaultDesc, setNewFaultDesc] = useState('');
  const [newFaultPriority, setNewFaultPriority] = useState('Normal');
  const [isSubmittingFault, setIsSubmittingFault] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [aptRes, faultsRes] = await Promise.all([
          ApiClient.get<{ success: boolean; data: Apartment[] }>('/api/apartments'),
          ApiClient.get<{ success: boolean; data: any[] }>('/api/faults')
        ]);
        if (isMounted) {
          if (aptRes?.success) setApartments(aptRes.data);
          if (faultsRes?.success) setFaults(faultsRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch apartments data', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const getApartmentFaults = (apt: Apartment | null) => {
    if (!faults || faults.length === 0 || !apt) return [];
    return faults.filter(f => {
      const t = (f.title || '').toLowerCase();
      const d = (f.description || '').toLowerCase();
      const u = apt.unit.toLowerCase();
      const c = (apt.shortCode || '').toLowerCase();
      return t.includes(u) || d.includes(u) || (c && (t.includes(c) || d.includes(c)));
    });
  };

  const getFaultCount = (apt: Apartment) => {
    const aptFaults = getApartmentFaults(apt);
    return aptFaults.filter(f => f.status !== 'Tamamlandı').length;
  };

  const filteredApartments = useMemo(() => {
    let result = apartments;

    if (activeTab && activeTab !== 'Tümü') {
      result = result.filter(a => a.block === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(a => {
        const daireNo = `${a.block} daire ${a.unit} ${a.shortCode}`.toLowerCase();
        const sakin = (a.residentName || '').toLowerCase();
        const tel = (a.phone || '').toLowerCase();
        const durum = (a.status || '').toLowerCase();
        const katTip = `kat ${a.floor} ${a.type}`.toLowerCase();
        const plakalar = `${a.plate1 || ''} ${a.plate2 || ''} ${a.plate3 || ''}`.toLowerCase();

        return daireNo.includes(q) ||
               sakin.includes(q) ||
               tel.includes(q) ||
               durum.includes(q) ||
               katTip.includes(q) ||
               plakalar.includes(q);
      });
    }

    return result.sort((a, b) => a.unit.localeCompare(b.unit, undefined, { numeric: true, sensitivity: 'base' }));
  }, [apartments, activeTab, searchQuery]);

  const openModal = (a?: Apartment) => {
    if (a) {
      setEditingId(a.id);
      setBlock(a.block);
      setUnit(a.unit);
      setShortCode(a.shortCode);
      setResidentName(a.residentName);
      setStatus(a.status);
      setFloor(a.floor);
      setType(a.type);
      setPhone(a.phone || '');
      setPlate1(a.plate1 || '');
      setPlate2(a.plate2 || '');
      setPlate3(a.plate3 || '');
    } else {
      setEditingId(null);
      setBlock(activeTab !== 'Tümü' ? activeTab : 'A Blok');
      setUnit('');
      setShortCode('');
      setResidentName('');
      setStatus('Mülk Sahibi');
      setFloor('0');
      setType('2+1');
      setPhone('');
      setPlate1('');
      setPlate2('');
      setPlate3('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const openFaultModal = (apt: Apartment) => {
    setSelectedApartmentForFaults(apt);
    setNewFaultTitle('');
    setNewFaultDesc('');
    setNewFaultPriority('Normal');
  };

  const closeFaultModal = () => {
    setSelectedApartmentForFaults(null);
  };

  const handleCreateFault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApartmentForFaults || !newFaultTitle.trim()) return;

    try {
      setIsSubmittingFault(true);
      const fullTitle = `${selectedApartmentForFaults.block} Daire ${selectedApartmentForFaults.unit} - ${newFaultTitle.trim()}`;
      const res = await ApiClient.post<{ success: boolean; data: any }>('/api/faults', {
        title: fullTitle,
        description: newFaultDesc,
        priority: newFaultPriority,
        reporterName: selectedApartmentForFaults.residentName || 'Daire Sakini',
        status: 'Bekliyor',
        recordType: 'ARIZA'
      });

      if (res?.success) {
        setFaults(prev => [res.data, ...prev]);
        setNewFaultTitle('');
        setNewFaultDesc('');
        setNewFaultPriority('Normal');
      }
    } catch (err) {
      console.error('Arıza oluşturulurken hata:', err);
    } finally {
      setIsSubmittingFault(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        block,
        unit,
        shortCode,
        residentName,
        status,
        floor,
        type,
        phone,
        plate1,
        plate2,
        plate3,
      };

      if (editingId) {
        const res = await ApiClient.put<{ success: boolean; data: Apartment }>('/api/apartments', {
          id: editingId,
          ...payload
        });
        if (res?.success) {
          setApartments(apartments.map(a => a.id === editingId ? res.data : a));
          closeModal();
        }
      } else {
        const res = await ApiClient.post<{ success: boolean; data: Apartment }>('/api/apartments', payload);
        if (res?.success) {
          setApartments([...apartments, res.data]);
          closeModal();
        }
      }
    } catch (error) {
      console.error('Failed to save apartment', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu daireyi silmek istediğinize emin misiniz?')) return;

    try {
      const res = await ApiClient.delete<{ success: boolean }>(`/api/apartments?id=${id}`);
      if (res?.success) {
        setApartments(apartments.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete apartment', error);
    }
  };

  function formatTitleCase(str: string | undefined | null) {
    if (!str) return '-';
    return str
      .toLocaleLowerCase('tr-TR')
      .split(' ')
      .map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
      .join(' ');
  }

  const calculatePlates = (a: Apartment) => {
    let count = 0;
    if (a.plate1) count++;
    if (a.plate2) count++;
    if (a.plate3) count++;
    return count;
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
              <Building className="w-6 h-6 text-blue-500" />
              Daire Yönetimi
            </h1>
            <p className="text-slate-400 text-sm mt-1">Bloklar, daireler ve daire sakinleri</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap">
              Yönetim Raporu Al (A4 PDF)
            </button>
            <button
              onClick={() => openModal()}
              className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-purple-900/10 border border-purple-500/40 hover:bg-purple-900/30 text-purple-300 text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Yeni Daire Ekle
            </button>
          </div>
        </div>

        {/* Search and Block Tabs Container */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          {/* Block Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('Tümü')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'Tümü' 
                  ? 'text-blue-400 border-blue-500 font-bold' 
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              Tüm Bloklar
            </button>
            {blocks.map(b => (
              <button
                key={b}
                onClick={() => setActiveTab(b)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === b 
                    ? 'text-blue-400 border-blue-500 font-bold' 
                    : 'text-slate-400 border-transparent hover:text-slate-300'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Global Multi-Column Search Input Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Daire No, Sakin, Telefon, Plaka, Kat, Durum ara..."
              className="w-full pl-10 pr-9 py-2 bg-[#070A11] border border-[#151B2B] focus:border-blue-500 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 outline-none transition-colors"
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

      {/* Apartment List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredApartments.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-sm">
            {searchQuery ? 'Arama kriterlerinize uygun daire bulunamadı.' : 'Bu blokta henüz daire kaydı bulunmamaktadır.'}
          </div>
        ) : (
          filteredApartments.map((apt) => (
            <div 
              key={apt.id}
              onClick={() => openModal(apt)}
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-800/30 transition-colors cursor-pointer"
            >
              {/* Right Content / Badges */}
              <div className="flex items-center justify-between gap-3 flex-1 overflow-x-auto py-1">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-center justify-center w-[140px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">DAİRE NO</span>
                    <span className="text-[13px] font-bold text-white truncate max-w-[130px] px-1">{apt.block} - Daire {apt.unit}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center w-[110px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">DURUM</span>
                    <span className={`text-[12px] font-bold truncate max-w-[100px] px-1 ${
                      apt.status === 'Mülk Sahibi' ? 'text-amber-500' :
                      apt.status === 'Kiracı' ? 'text-blue-500' :
                      'text-slate-400'
                    }`}>
                      {apt.status || 'Boş'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center w-[180px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">SAKİN ADI</span>
                    <span className="text-[12px] font-bold text-slate-200 truncate max-w-[170px] px-1">{formatTitleCase(apt.residentName)}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center w-[125px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">TELEFON</span>
                    <span className="text-[11px] font-bold font-mono text-amber-500 truncate max-w-[115px] px-1">{apt.phone || '-'}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center w-[110px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">KAT / TİP</span>
                    <span className="text-[12px] font-bold text-slate-300 truncate max-w-[100px] px-1">Kat {apt.floor} | {apt.type}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center w-[85px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">SAKİN</span>
                    <span className="text-[13px] font-bold text-cyan-400">{apt.status !== 'Boş' ? '1 Kişi' : '0 Kişi'}</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center w-[85px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">PLAKA</span>
                    <span className="text-[13px] font-bold text-yellow-400">{calculatePlates(apt)} Adet</span>
                  </div>

                  {/* Arızalar Stat Box / Clickable Modal Trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openFaultModal(apt);
                    }}
                    className="flex flex-col items-center justify-center w-[85px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] hover:border-red-500/50 rounded-lg shadow-sm transition-colors group/fault"
                    title="Arıza Kayıtları Kartı Aç"
                  >
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5 group-hover/fault:text-red-400">ARIZALAR</span>
                    <span className={`text-[13px] font-bold ${getFaultCount(apt) > 0 ? 'text-red-400 font-extrabold animate-pulse' : 'text-red-500/70'}`}>
                      {getFaultCount(apt)} Kayıt
                    </span>
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(apt);
                    }}
                    className="p-2.5 bg-[#070A11] border border-blue-900/50 text-blue-500 hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(apt.id);
                    }}
                    className="p-2.5 bg-[#070A11] border border-red-900/50 text-red-500 hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 bg-[#070A11] border border-purple-900/50 text-purple-400 hover:bg-purple-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit/Create Apartment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-500" />
                {editingId ? 'Daireyi Düzenle' : 'Yeni Daire Ekle'}
              </h2>
              <button 
                onClick={closeModal}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="apartmentForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Blok</label>
                    <input
                      type="text"
                      required
                      value={block}
                      onChange={e => setBlock(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Örn: A Blok"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Daire No</label>
                    <input
                      type="text"
                      required
                      value={unit}
                      onChange={e => setUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Örn: A1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Kısa Kod</label>
                    <input
                      type="text"
                      required
                      value={shortCode}
                      onChange={e => setShortCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Örn: 241"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Sakin Adı Soyadı</label>
                    <input
                      type="text"
                      value={residentName}
                      onChange={e => setResidentName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Örn: Funda Öztürk"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Telefon</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Örn: 0532 000 00 00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Durum</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="Mülk Sahibi">Mülk Sahibi</option>
                      <option value="Kiracı">Kiracı</option>
                      <option value="Boş">Boş</option>
                    </select>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Kat</label>
                    <input
                      type="text"
                      value={floor}
                      onChange={e => setFloor(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Örn: -1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Tip</label>
                    <input
                      type="text"
                      value={type}
                      onChange={e => setType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Örn: 2+1"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                  <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Araç Plakaları
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input
                        type="text"
                        value={plate1}
                        onChange={e => setPlate1(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Plaka 1"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={plate2}
                        onChange={e => setPlate2(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Plaka 2"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={plate3}
                        onChange={e => setPlate3(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Plaka 3"
                      />
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800 bg-slate-900/50 mt-auto">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                form="apartmentForm"
                className="flex items-center justify-center px-5 py-2 bg-purple-900/10 border border-purple-500/40 hover:bg-purple-900/30 text-purple-300 text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
              >
                <Save className="w-4 h-4 mr-1.5" />
                {editingId ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Faults Modal / Card */}
      {selectedApartmentForFaults && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-red-500" />
                  {selectedApartmentForFaults.block} - Daire {selectedApartmentForFaults.unit} Arıza Kayıtları
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sakin: <span className="text-slate-200 font-semibold">{formatTitleCase(selectedApartmentForFaults.residentName)}</span> | Tel: <span className="text-amber-500 font-mono">{selectedApartmentForFaults.phone || '-'}</span>
                </p>
              </div>
              <button 
                onClick={closeFaultModal}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              {/* Form: Yeni Arıza Kaydı Ekle */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-500" />
                  Yeni Arıza Kaydı Bildir
                </h3>
                <form onSubmit={handleCreateFault} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        required
                        value={newFaultTitle}
                        onChange={e => setNewFaultTitle(e.target.value)}
                        placeholder="Arıza Başlığı (Örn: Sifon arızası, İnterkom çalışmıyor)"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <select
                        value={newFaultPriority}
                        onChange={e => setNewFaultPriority(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Normal">Öncelik: Normal</option>
                        <option value="Yüksek">Öncelik: Yüksek</option>
                        <option value="Acil">Öncelik: Acil</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <textarea
                      rows={2}
                      value={newFaultDesc}
                      onChange={e => setNewFaultDesc(e.target.value)}
                      placeholder="Arıza detayları ve açıklama..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingFault}
                      className="flex items-center justify-center px-4 py-2 bg-purple-900/10 border border-purple-500/40 hover:bg-purple-900/30 text-purple-300 text-xs font-bold rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Arıza Kaydını Ekle
                    </button>
                  </div>
                </form>
              </div>

              {/* Apartment Fault List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Mevcut Arıza Kayıtları ({getApartmentFaults(selectedApartmentForFaults).length})
                </h3>

                {getApartmentFaults(selectedApartmentForFaults).length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/40 border border-slate-800/60 rounded-xl text-slate-500 text-xs">
                    Bu daireye ait henüz aktif veya geçmiş arıza kaydı bulunmamaktadır.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {getApartmentFaults(selectedApartmentForFaults).map((fault: any) => (
                      <div 
                        key={fault.id}
                        className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{fault.title}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              fault.priority === 'Yüksek' || fault.priority === 'Acil' 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              {fault.priority}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              fault.status === 'Tamamlandı' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : fault.status === 'Devam Ediyor' 
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              {fault.status}
                            </span>
                          </div>
                          {fault.description && (
                            <p className="text-xs text-slate-400">{fault.description}</p>
                          )}
                          <div className="text-[10px] text-slate-500 flex items-center gap-3 pt-1">
                            <span>Tarih: {new Date(fault.faultDate || fault.createdAt).toLocaleDateString('tr-TR')}</span>
                            {fault.reporterName && <span>Bildiren: {fault.reporterName}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/60">
              <Link
                href="/admin/faults"
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                Tüm Arızaları Sayfasında Gör →
              </Link>
              <button
                type="button"
                onClick={closeFaultModal}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
