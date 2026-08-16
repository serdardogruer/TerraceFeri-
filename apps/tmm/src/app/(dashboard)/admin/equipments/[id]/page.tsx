'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, ClipboardList, PenTool, Plus, X } from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

interface Equipment {
  id: string;
  name: string;
  code: string | null;
  type: string;
  technicalDetails: string | null;
  workingPrinciple: string | null;
  duty: string | null;
  usageInfo: string | null;
  practicalInfo: string | null;
  possibleFaults: string | null;
}

interface Company {
  id: string;
  name: string;
}

interface Fault {
  id: string;
  title: string;
  description: string | null;
  reporterName: string | null;
  faultDate: string;
  priority: string;
  status: string;
  serviceReport: string | null;
  companyId: string | null;
}

export default function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const equipmentId = resolvedParams.id;

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [faults, setFaults] = useState<Fault[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for Technical details
  const [workingPrinciple, setWorkingPrinciple] = useState('');
  const [duty, setDuty] = useState('');
  const [practicalInfo, setPracticalInfo] = useState('');
  const [possibleFaults, setPossibleFaults] = useState('');

  // Form states for New Fault Modal
  const [isFaultModalOpen, setIsFaultModalOpen] = useState(false);
  const [faultTitle, setFaultTitle] = useState('');
  const [faultDesc, setFaultDesc] = useState('');
  const [faultReporter, setFaultReporter] = useState('');
  const [faultPriority, setFaultPriority] = useState('Normal');
  const [faultStatus, setFaultStatus] = useState('Pending');
  const [faultCompanyId, setFaultCompanyId] = useState('');
  const [faultReport, setFaultReport] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [eqRes, compRes, faultRes] = await Promise.all([
          ApiClient.get<{ success: boolean; data: Equipment }>(`/api/equipments?id=${equipmentId}`),
          ApiClient.get<{ success: boolean; data: Company[] }>('/api/companies'),
          ApiClient.get<{ success: boolean; data: Fault[] }>(`/api/faults?equipmentId=${equipmentId}`)
        ]);

        if (isMounted) {
          if (eqRes?.success && eqRes.data) {
            setEquipment(eqRes.data);
            setWorkingPrinciple(eqRes.data.workingPrinciple || '');
            setDuty(eqRes.data.duty || '');
            setPracticalInfo(eqRes.data.practicalInfo || '');
            setPossibleFaults(eqRes.data.possibleFaults || '');
          }
          if (compRes?.success) setCompanies(compRes.data);
          if (faultRes?.success) setFaults(faultRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch equipment data', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [equipmentId]);

  const handleSaveTechInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipment) return;

    try {
      const res = await ApiClient.put<{ success: boolean; data: Equipment }>(`/api/equipments`, {
        ...equipment,
        workingPrinciple,
        duty,
        practicalInfo,
        possibleFaults
      });
      if (res?.success) {
        setEquipment(res.data);
        alert('Teknik bilgiler başarıyla kaydedildi.');
      }
    } catch (error) {
      console.error('Failed to save tech info', error);
    }
  };

  const closeFaultModal = () => {
    setIsFaultModalOpen(false);
    setFaultTitle('');
    setFaultDesc('');
    setFaultReporter('');
    setFaultPriority('Normal');
    setFaultStatus('Pending');
    setFaultCompanyId('');
    setFaultReport('');
  };

  const handleSaveFault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faultTitle.trim()) return;

    try {
      const res = await ApiClient.post<{ success: boolean; data: Fault }>('/api/faults', {
        equipmentId,
        title: faultTitle,
        description: faultDesc,
        reporterName: faultReporter,
        priority: faultPriority,
        status: faultStatus,
        companyId: faultCompanyId || null,
        serviceReport: faultReport
      });

      if (res?.success) {
        setFaults([res.data, ...faults]);
        closeFaultModal();
      }
    } catch (error) {
      console.error('Failed to save fault', error);
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-500">Yükleniyor...</div>;
  if (!equipment) return <div className="text-center py-10 text-slate-500">Ekipman bulunamadı.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0f121b] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-4 mb-2">
          <Link href="/admin/areas" className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-md text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Settings className="w-6 h-6 mr-3 text-cyan-500" />
                {equipment.name}
              </h1>
              <span className="px-3 py-0.5 bg-cyan-900/20 text-cyan-400 border border-cyan-500/20 rounded-md text-xs font-semibold">
                {equipment.type}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1 ml-9">
              {equipment.code ? `Kod: ${equipment.code} | ` : ''}Teknik Bilgiler, Pratik Notlar ve Arıza Geçmişi
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-6">
        
        {/* Top Section: Fault History */}
        <div className="w-full space-y-6">
          <div className="bg-[#0f121b] border border-slate-800/80 rounded-2xl p-6 shadow-xl w-full">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800/80 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center">
                <PenTool className="w-5 h-5 mr-2 text-rose-400" />
                Arıza Geçmişi
              </h2>
              <button onClick={() => setIsFaultModalOpen(true)} className="px-3 py-1.5 bg-rose-900/10 border border-rose-500/40 hover:bg-rose-900/30 text-rose-300 text-[10px] font-bold rounded-md transition-colors flex items-center">
                <Plus className="w-3 h-3 mr-1" /> Kayıt Ekle
              </button>
            </div>

            <div className="space-y-4">
              {faults.length === 0 ? (
                <div className="bg-[#080b12] border border-slate-800 rounded-xl p-6 text-center">
                  <PenTool className="w-8 h-8 text-slate-700 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-slate-500">Henüz bu cihaza ait arıza kaydı bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {faults.map(fault => {
                    const fDate = new Date(fault.faultDate);
                    const day = fDate.toLocaleDateString('tr-TR', { day: '2-digit' });
                    const month = fDate.toLocaleDateString('tr-TR', { month: 'short' });
                    
                    return (
                      <div key={fault.id} className="bg-[#080b12] border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-colors flex flex-col">
                        <div className="flex items-start gap-4">
                          {/* Prominent Date Badge */}
                          <div className="flex flex-col items-center justify-center bg-slate-800/50 rounded-lg p-2 min-w-[50px] border border-slate-700/50 shrink-0">
                            <span className="text-lg font-bold text-white leading-none mb-1">{day}</span>
                            <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">{month}</span>
                          </div>

                          <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-sm font-bold text-slate-200">{fault.title}</h4>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ml-2 ${
                                fault.status === 'Tamamlandı' ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/20' :
                                fault.status === 'İşlemde' ? 'bg-amber-900/20 text-amber-400 border border-amber-500/20' :
                                'bg-slate-800/50 text-slate-400 border border-slate-700'
                              }`}>
                                {fault.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mb-3">{fault.description}</p>
                            <div className="flex items-center justify-end text-[10px] text-slate-500 mt-auto pt-3 border-t border-slate-800/50">
                              <span>Bildiren: {fault.reporterName || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Technical Details Form */}
        <div className="w-full space-y-6">
          <div className="bg-[#0f121b] border border-slate-800/80 rounded-2xl p-6 shadow-xl w-full">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center border-b border-slate-800/80 pb-3">
              <ClipboardList className="w-5 h-5 mr-2 text-purple-400" />
              Teknik ve Pratik Bilgiler
            </h2>
            
            <form onSubmit={handleSaveTechInfo} className="space-y-5">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Çalışma Prensibi</label>
                  <textarea 
                    value={workingPrinciple}
                    onChange={(e) => setWorkingPrinciple(e.target.value)}
                    className="w-full h-32 bg-[#080b12] border border-slate-800 text-white rounded-md p-3 text-sm focus:border-cyan-500/50 focus:outline-none placeholder:text-slate-600 transition-colors"
                    placeholder="Ekipmanın nasıl çalıştığını açıklayın..."
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Görevi</label>
                  <textarea 
                    value={duty}
                    onChange={(e) => setDuty(e.target.value)}
                    className="w-full h-32 bg-[#080b12] border border-slate-800 text-white rounded-md p-3 text-sm focus:border-cyan-500/50 focus:outline-none placeholder:text-slate-600 transition-colors"
                    placeholder="Sistemdeki ana görevini yazın..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pratik Bilgiler & Kullanım Kılavuzu</label>
                  <textarea 
                    value={practicalInfo}
                    onChange={(e) => setPracticalInfo(e.target.value)}
                    className="w-full h-32 bg-[#080b12] border border-slate-800 text-white rounded-md p-3 text-sm focus:border-cyan-500/50 focus:outline-none placeholder:text-slate-600 transition-colors"
                    placeholder="Sahadaki teknisyenler için önemli notlar ve uyarılar..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Olası Arızalar ve Çözümleri</label>
                  <textarea 
                    value={possibleFaults}
                    onChange={(e) => setPossibleFaults(e.target.value)}
                    className="w-full h-32 bg-[#080b12] border border-slate-800 text-white rounded-md p-3 text-sm focus:border-cyan-500/50 focus:outline-none placeholder:text-slate-600 transition-colors"
                    placeholder="Sık karşılaşılan arıza tipleri ve hızlı çözüm yöntemleri..."
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="px-6 py-2.5 bg-cyan-900/10 border border-cyan-500/40 hover:bg-cyan-900/30 text-cyan-300 text-xs font-bold rounded-md transition-colors shadow-lg shadow-cyan-500/10">
                  Bilgileri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* Fault Modal */}
      {isFaultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsFaultModalOpen(false)}>
          <div className="bg-[#0f121b] border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-[#080b12]">
              <h3 className="text-lg font-bold text-white flex items-center tracking-wide">
                <PenTool className="w-5 h-5 mr-2 text-rose-500" /> Yeni Arıza Kaydı
              </h3>
              <button onClick={closeFaultModal} className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveFault} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Arıza Başlığı *</label>
                  <input
                    type="text"
                    value={faultTitle}
                    onChange={(e) => setFaultTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-600 text-sm"
                    placeholder="Örn: Motor ısınma hatası..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Açıklama</label>
                  <textarea 
                    value={faultDesc}
                    onChange={(e) => setFaultDesc(e.target.value)}
                    className="w-full h-20 bg-[#080b12] border border-slate-800 text-white rounded-md p-3 text-sm focus:border-rose-500/50 focus:outline-none placeholder:text-slate-600 transition-colors"
                    placeholder="Arıza detayı..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Durum</label>
                    <select
                      value={faultStatus}
                      onChange={(e) => setFaultStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-rose-500/50 appearance-none text-sm"
                    >
                      <option value="Bekliyor">Bekliyor</option>
                      <option value="İşlemde">İşlemde</option>
                      <option value="Tamamlandı">Tamamlandı</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Servis Firması</label>
                    <select
                      value={faultCompanyId}
                      onChange={(e) => setFaultCompanyId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-rose-500/50 appearance-none text-sm"
                    >
                      <option value="">- Kendi Ekibimiz -</option>
                      {companies.map(comp => (
                        <option key={comp.id} value={comp.id}>{comp.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end space-x-3">
                <button type="button" onClick={closeFaultModal} className="px-5 py-2.5 bg-transparent text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                  İptal
                </button>
                <button type="submit" className="px-6 py-2.5 bg-rose-900/10 border border-rose-500/40 hover:bg-rose-900/30 text-rose-300 text-xs font-bold rounded-md transition-colors whitespace-nowrap shadow-lg shadow-rose-500/10">
                  Kaydı Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
