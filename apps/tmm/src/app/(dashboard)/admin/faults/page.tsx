'use client';

import { useEffect, useState, useMemo } from 'react';
import { ApiClient } from '@/lib/api-client';
import { 
  AlertTriangle, Plus, X, 
  Calendar, FileText, CheckSquare, Save,
  Activity, Clock, Share2, Map, Printer
} from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  type?: string;
}

interface Company {
  id: string;
  name: string;
  type?: string;
  category?: string;
}

interface FaultRecord {
  id: string;
  equipmentId: string;
  companyId: string | null;
  title: string;
  description: string | null;
  reporterName: string | null;
  faultDate: string;
  priority: string;
  status: string;
  recordType: string;
  pendingReason: string | null;
  resolutionNote: string | null;
  reportFields: string | null;
  isRecurringTemplate: boolean;
  templateId: string | null;
}

function getRandomReportCode(): string {
  return `TMM-GÜN-${Math.floor(Math.random() * 9000) + 1000}`;
}

export default function FaultsPage() {
  const [faults, setFaults] = useState<FaultRecord[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  
  // Accordion state - default today's date expanded
  const todayLabel = useMemo(() => new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }), []);
  const [expandedDates, setExpandedDates] = useState<string[]>([todayLabel]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'reports'>('info');

  // Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportItems, setReportItems] = useState<FaultRecord[]>([]);
  const [reportCode, setReportCode] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recordType, setRecordType] = useState('ARIZA');
  const [status, setStatus] = useState('Bekliyor');
  const [priority, setPriority] = useState('Normal');
  const [equipmentId, setEquipmentId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [pendingReason, setPendingReason] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [reportFields, setReportFields] = useState<string[]>(['title', 'description']);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [faultsRes, eqRes, compRes] = await Promise.all([
          ApiClient.get<{ success: boolean; data: FaultRecord[] }>('/api/faults'),
          ApiClient.get<{ success: boolean; data: Equipment[] }>('/api/equipments'),
          ApiClient.get<{ success: boolean; data: Company[] }>('/api/companies')
        ]);
        
        if (isMounted) {
          if (faultsRes?.success) setFaults(faultsRes.data);
          if (eqRes?.success) setEquipments(eqRes.data);
          if (compRes?.success) setCompanies(compRes.data);
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

  const toggleDate = (dateLabel: string) => {
    setExpandedDates(prev => 
      prev.includes(dateLabel) ? prev.filter(d => d !== dateLabel) : [...prev, dateLabel]
    );
  };

  const openModal = (f?: FaultRecord, typePreset?: string) => {
    setActiveTab('info');
    if (f) {
      setEditingId(f.id);
      setTitle(f.title);
      setDescription(f.description || '');
      setRecordType(f.recordType || 'ARIZA');
      setStatus(f.status || 'Bekliyor');
      setPriority(f.priority || 'Normal');
      setEquipmentId(f.equipmentId || '');
      setCompanyId(f.companyId || '');
      setReporterName(f.reporterName || '');
      setPendingReason(f.pendingReason || '');
      setResolutionNote(f.resolutionNote || '');
      try {
        setReportFields(JSON.parse(f.reportFields || '["title","description"]'));
      } catch {
        setReportFields(['title', 'description']);
      }
    } else {
      setEditingId(null);
      setTitle('');
      setDescription('');
      setRecordType(typePreset || 'ARIZA');
      setStatus('Bekliyor');
      setPriority('Normal');
      setEquipmentId('');
      setCompanyId('');
      setReporterName('');
      setPendingReason('');
      setResolutionNote('');
      setReportFields(['title', 'description']);
    }
    setIsModalOpen(true);
  };

  // Smart Auto-Matcher: Başlığa göre İlgili Ekipman ve Taşeron Firmayı otomatik seçer
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!newTitle.trim()) return;

    const lower = newTitle.toLowerCase();

    // 1. Ekipman / Alan Otomatik Eşleme
    const matchedEq = equipments.find(eq => {
      const eqName = eq.name.toLowerCase();
      const eqType = (eq.type || '').toLowerCase();

      // Doğrudan ekipman adı eşleşmesi
      if (lower.includes(eqName)) return true;

      // Anahtar kelime eşleşmeleri
      if ((eqName.includes('intercom') || eqName.includes('diyafon')) && 
          (lower.includes('intercom') || lower.includes('diyafon') || lower.includes('diafon') || lower.includes('zil') || lower.includes('kapı paneli') || lower.includes('ekran'))) return true;

      if ((eqName.includes('asansör') || eqName.includes('asansor')) && 
          (lower.includes('asansör') || lower.includes('asansor') || lower.includes('kabin') || lower.includes('kat kapısı') || lower.includes('halat'))) return true;

      if ((eqName.includes('hidrafor') || eqName.includes('hidrofor')) && 
          (lower.includes('hidrofor') || lower.includes('hidrafor') || lower.includes('su basıncı') || lower.includes('su kesildi') || lower.includes('kullanım suyu'))) return true;

      if (eqName.includes('kombi') && 
          (lower.includes('kombi') || lower.includes('petek') || lower.includes('kalorifer') || lower.includes('ısıtma'))) return true;

      if (eqName.includes('kazan') && 
          (lower.includes('kazan') || lower.includes('brülör') || lower.includes('brulor') || lower.includes('eşanjör') || lower.includes('esanjor'))) return true;

      if (eqName.includes('boyler') && 
          (lower.includes('boyler') || lower.includes('sıcak su') || lower.includes('sicak su') || lower.includes('termostat'))) return true;

      if ((eqName.includes('jeneratör') || eqName.includes('jenerator')) && 
          (lower.includes('jeneratör') || lower.includes('jenerator') || lower.includes('elektrik kesintisi') || lower.includes('yakıt') || lower.includes('teksan'))) return true;

      if (eqName.includes('klima') && 
          (lower.includes('klima') || lower.includes('vrf') || lower.includes('chiller') || lower.includes('soğutma') || lower.includes('sogutma') || lower.includes('iklimlendirme'))) return true;

      if ((eqName.includes('pis su') || eqName.includes('foseptik')) && 
          (lower.includes('pis su') || lower.includes('foseptik') || lower.includes('logar') || lower.includes('rögar') || lower.includes('taşma') || lower.includes('dalgıç'))) return true;

      if (eqName.includes('yangın') && 
          (lower.includes('yangın') || lower.includes('yangin') || lower.includes('dedektör') || lower.includes('siren') || lower.includes('sprink') || lower.includes('yangın butonu') || lower.includes('yangın paneli'))) return true;

      if (eqName.includes('havuz') && 
          (lower.includes('havuz') || lower.includes('klor') || lower.includes('dozaj') || lower.includes('filtrasyon') || lower.includes('denge tankı'))) return true;

      if (eqName.includes('tv') && 
          (lower.includes('tv') || lower.includes('televizyon') || lower.includes('uydu') || lower.includes('yayın') || lower.includes('santral'))) return true;

      if (eqName.includes('bariyer') && 
          (lower.includes('bariyer') || lower.includes('otopark kapısı') || lower.includes('kumanda') || lower.includes('oggs') || lower.includes('hgs') || lower.includes('fotosel'))) return true;

      if (eqName.includes('kamera') && 
          (lower.includes('kamera') || lower.includes('cctv') || lower.includes('nvr') || lower.includes('dvr') || lower.includes('kayıt cihazı'))) return true;

      if ((eqName.includes('sirkülasyon') || eqName.includes('sirkulasyon')) && 
          (lower.includes('sirkülasyon') || lower.includes('sirkulasyon') || lower.includes('sirkülasyon pompası'))) return true;

      return false;
    });

    if (matchedEq) {
      setEquipmentId(matchedEq.id);
    } else {
      setEquipmentId(''); // Tesis Geneli
    }

    // 2. Taşeron / Firma Otomatik Eşleme
    const matchedComp = companies.find(c => {
      const compName = c.name.toLowerCase();

      // Doğrudan firma adı eşleşmesi
      if (lower.includes(compName)) return true;

      // Sektör ve anahtar kelime eşleşmeleri
      if ((compName.includes('otis') || compName.includes('asansör') || compName.includes('uzman asansör')) && 
          (lower.includes('asansör') || lower.includes('asansor') || lower.includes('kabin') || lower.includes('kat kapısı') || lower.includes('halat'))) return true;

      if ((compName.includes('teksan') || compName.includes('jeneratör') || compName.includes('jenerator')) && 
          (lower.includes('jeneratör') || lower.includes('jenerator') || lower.includes('teksan'))) return true;

      if ((compName.includes('wiessmann') || compName.includes('kazan') || compName.includes('is-er')) && 
          (lower.includes('kazan') || lower.includes('kombi') || lower.includes('brülör') || lower.includes('boyler') || lower.includes('ısıtma'))) return true;

      if ((compName.includes('wilo') || compName.includes('bobinaj') || compName.includes('fettah') || compName.includes('pompa')) && 
          (lower.includes('hidrofor') || lower.includes('hidrafor') || lower.includes('pompa') || lower.includes('pis su') || lower.includes('foseptik') || lower.includes('sirkülasyon'))) return true;

      if ((compName.includes('klima') || compName.includes('özgüneş') || compName.includes('soğutma') || compName.includes('iklimlendirme')) && 
          (lower.includes('klima') || lower.includes('vrf') || lower.includes('chiller') || lower.includes('soğutma') || lower.includes('iklimlendirme'))) return true;

      if ((compName.includes('su-tek') || compName.includes('havuz')) && 
          (lower.includes('havuz') || lower.includes('klor') || lower.includes('dozaj') || lower.includes('filtrasyon'))) return true;

      if ((compName.includes('kripto') || compName.includes('güvenlik')) && 
          (lower.includes('intercom') || lower.includes('diyafon') || lower.includes('diafon') || lower.includes('kamera') || lower.includes('cctv') || lower.includes('bariyer') || lower.includes('yangın paneli') || lower.includes('yangın algılama'))) return true;

      if (compName.includes('otomasyon') && 
          (lower.includes('otomasyon') || lower.includes('pano') || lower.includes('şalter') || lower.includes('trafo') || lower.includes('kompanzasyon'))) return true;

      if (compName.includes('arıtma') && 
          (lower.includes('arıtma') || lower.includes('yumuşatma') || lower.includes('tuz'))) return true;

      return false;
    });

    if (matchedComp) {
      setCompanyId(matchedComp.id);
    } else {
      setCompanyId(''); // Kendi Bünyemizde
    }
  };

  const closeModal = () => setIsModalOpen(false);

  const handleReportFieldChange = (field: string) => {
    if (field === 'title' || field === 'description') return; // Zorunlu alanlar
    setReportFields(prev => 
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const payload = { 
        title, description, recordType, status, priority, 
        equipmentId, companyId, reporterName, 
        pendingReason, resolutionNote, 
        reportFields: JSON.stringify(reportFields)
      };

      if (editingId) {
        const res = await ApiClient.put<{ success: boolean; data: FaultRecord }>(`/api/faults`, {
          id: editingId, ...payload
        });
        if (res?.success) {
          setFaults(faults.map(f => f.id === editingId ? res.data : f));
          closeModal();
        }
      } else {
        const res = await ApiClient.post<{ success: boolean; data: FaultRecord }>('/api/faults', payload);
        if (res?.success) {
          setFaults([res.data, ...faults]);
          closeModal();
        }
      }
    } catch (error) {
      console.error('Failed to save fault', error);
    }
  };

  const handleDelete = async (id: string) => {
    const fault = faults.find(f => f.id === id);
    // Günlük kopya mı (templateId var) yoksa tek seferlik kayıt mı?
    const isDailyCopy = !!fault?.templateId;
    const msg = isDailyCopy
      ? 'Bugünkü günlük rutini silmek istiyor musunuz?\n(Yarın tekrar otomatik olarak eklenecektir.)'
      : 'Bu kaydı silmek istediğinize emin misiniz?';
    if (!confirm(msg)) return;
    try {
      const res = await fetch(`/api/faults?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFaults(prev => prev.filter(f => f.id !== id));
        closeModal();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Silme başarısız: ${data?.message || res.statusText}`);
      }
    } catch (error) {
      console.error('Failed to delete fault', error);
      alert('Silme sırasında bir hata oluştu.');
    }
  };

  const updateStatus = async (fault: FaultRecord, newStatus: string) => {
    if (fault.status === newStatus) return;
    try {
      const res = await ApiClient.put<{ success: boolean; data: FaultRecord }>(`/api/faults`, {
        ...fault,
        status: newStatus
      });
      if (res?.success) {
        setFaults(faults.map(f => f.id === fault.id ? res.data : f));
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const generateReport = async (dateLabel: string, items: FaultRecord[]) => {
    const activeItems = items.filter(item => item.recordType !== 'AYLIK_RUTIN');
    const arizaItems = activeItems.filter(i => i.recordType === 'ARIZA');
    const rutinItems = activeItems.filter(i => i.recordType !== 'ARIZA');

    setReportItems(activeItems);
    setReportCode(getRandomReportCode());
    setIsReportModalOpen(true);

    // Otomatik olarak c:\Users\PC\Desktop\TerraceFeri\günlükrapor klasörüne kaydet
    const reportText = `====================================================
📋 TERRACEFERI GÜNLÜK ARIZA VE RUTİN YÖNETİM RAPORU
🗓️ Tarih: ${dateLabel}
====================================================

📌 ARIZA & RUTİN ÖZETİ:
- Toplam İşlem Sayısı: ${activeItems.length}
- Arıza Bildirimleri: ${arizaItems.length} (Tamamlanan: ${arizaItems.filter(i => i.status === 'Tamamlandı').length}, Bekleyen: ${arizaItems.filter(i => i.status !== 'Tamamlandı').length})
- Günlük Devriye & Rutin: ${rutinItems.length} (Tamamlanan: ${rutinItems.filter(i => i.status === 'Tamamlandı').length})

🔴 1. ARIZA BİLDİRİMLERİ:
${arizaItems.length > 0
  ? arizaItems.map((item, idx) => `${idx + 1}. [${item.priority?.toUpperCase() || 'NORMAL'}] ${item.title} (${item.status})`).join('\n')
  : 'Bu tarihe ait kayıtlı arıza bulunmamaktadır.'}

📋 2. GÜNLÜK DEVRİYE VE RUTİN İŞLER:
${rutinItems.length > 0
  ? rutinItems.map((item, idx) => `${idx + 1}. [RUTİN] ${item.title} (${item.status})`).join('\n')
  : 'Bu tarihe ait kayıtlı rutin görev bulunmamaktadır.'}

====================================================`;

    try {
      await ApiClient.post('/api/reports/save', {
        title: 'GUNLUK ARIZA RAPORU',
        content: reportText,
        format: 'pdf'
      });
    } catch (e) {
      console.error('Report save failed:', e);
    }
  };

  const copyReport = () => {
    window.print();
  };

  // Grouping Logic
  const groupedData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateGroups: Record<string, {
      items: FaultRecord[],
      counts: { ariza: number, gunluk: number, aylik: number, genel: number },
      isToday: boolean,
      isYesterday: boolean,
      dayOfMonth: number
    }> = {};

    faults.forEach(fault => {


      const faultDate = new Date(fault.faultDate);
      faultDate.setHours(0, 0, 0, 0);

      // Her kayıt kesinlikle kendi oluşturulduğu güne ait olmalıdır
      const targetDate = faultDate;

      const dateLabel = targetDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
      
      const isToday = targetDate.getTime() === today.getTime();
      const isYesterday = targetDate.getTime() === (today.getTime() - 86400000);

      if (!dateGroups[dateLabel]) {
        dateGroups[dateLabel] = {
          items: [],
          counts: { ariza: 0, gunluk: 0, aylik: 0, genel: 0 },
          isToday,
          isYesterday,
          dayOfMonth: targetDate.getDate()
        };
      }

      dateGroups[dateLabel].items.push(fault);

      if (fault.recordType === 'ARIZA') dateGroups[dateLabel].counts.ariza++;
      else if (fault.recordType === 'GUNLUK_RUTIN') dateGroups[dateLabel].counts.gunluk++;
      else if (fault.recordType === 'AYLIK_RUTIN') dateGroups[dateLabel].counts.aylik++;
      else if (fault.recordType === 'GENEL_ISLEM') dateGroups[dateLabel].counts.genel++;
      // Eski kayıtlarda RUTIN_GOREV varsa günlük sayıyoruz.
      else if (fault.recordType === 'RUTIN_GOREV') dateGroups[dateLabel].counts.gunluk++;
    });

    // Object i tarihe göre tersten (en yeni üstte) sıralayalım
    return Object.entries(dateGroups).sort((a, b) => {
      // isToday her zaman en üstte olsun, sonra tarihe göre. (Basit String sıralaması işe yaramaz, isToday üzerinden)
      if (a[1].isToday) return -1;
      if (b[1].isToday) return 1;
      return 0; // Şimdilik basit tutuyoruz, asıl projede timestamp sort yapılmalı
    });
  }, [faults]);

  return (
    <div className="space-y-4 max-w-[1200px] mx-auto pb-20">
      
      {/* 1. TOP HEADER (Görseldeki En Üst Kart) */}
      <div className="sticky -top-6 z-30 bg-[#060B14]/95 backdrop-blur-md pt-6 pb-4 border-b border-slate-800/80 -mx-6 px-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-5 w-full md:w-auto">
          <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/30 shrink-0">
            <Calendar className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Tarih Başlıklı Akordiyon Takip Sistemi</h1>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed hidden md:block">
              Her günün tarihi özel bir başlık kartıdır; her günün raporunu WhatsApp, E-Posta veya A4 PDF olarak ayrı ayrı<br/>gönderebilirsiniz.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">

          
          <select className="w-full sm:w-auto bg-[#080b12] border border-slate-800 text-white text-sm rounded-full px-4 py-2.5 focus:outline-none appearance-none pr-8 relative">
            <option>Tüm Aylar</option>
            <option>Bu Ay</option>
          </select>

          <button 
            onClick={() => openModal()}
            className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 border border-indigo-600/30 bg-indigo-900/20 hover:bg-indigo-900/40 text-indigo-300 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" /> Kayıt Ekle
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Kayıtlar yükleniyor...</div>
      ) : (
        <div className="space-y-3">
          {groupedData.map(([dateLabel, group]) => {
            const isExpanded = expandedDates.includes(dateLabel);
            const total = group.items.length;

            return (
              <div key={dateLabel} className="bg-[#0f121b] border border-slate-800/80 rounded-xl overflow-hidden shadow-lg transition-all">
                
                {/* ACCORDION HEADER (Görseldeki Yatay Kart) */}
                <div 
                  className={`flex flex-col xl:flex-row xl:items-center justify-between p-4 cursor-pointer hover:bg-slate-800/20 transition-colors gap-4 ${isExpanded ? 'bg-slate-800/20 border-b border-slate-800/50' : ''}`}
                  onClick={() => toggleDate(dateLabel)}
                >
                  
                  {/* Left: Icon & Date */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-[#05070a] border border-slate-700/60 flex items-center justify-center shrink-0">
                      <Calendar className="w-6 h-6 text-slate-300" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-bold text-white">{dateLabel}</h3>
                        {group.isToday && (
                          <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-500 text-[10px] font-bold rounded uppercase tracking-wider">Bugün</span>
                        )}
                        {group.isYesterday && (
                          <span className="px-2.5 py-0.5 bg-slate-700 text-slate-300 text-[10px] font-bold rounded uppercase tracking-wider">Dün</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Toplam {total} İşlem Kayıtlı (Arızalar: {group.counts.ariza} | Günlük Devriye: {group.counts.gunluk} | Aylık Rutin: {group.counts.aylik})
                      </p>
                    </div>
                  </div>

                  {/* Right: Badges & Button */}
                  <div className="flex items-center flex-wrap xl:flex-nowrap gap-3 shrink-0">
                    <span className={`px-3 py-1.5 border rounded-full text-xs font-bold whitespace-nowrap ${
                      group.counts.ariza > 0 ? 'border-rose-500/60 text-rose-400 bg-rose-500/5' : 'border-slate-800 text-slate-500'
                    }`}>
                      {group.counts.ariza} Arıza
                    </span>
                    <span className={`px-3 py-1.5 border rounded-full text-xs font-bold whitespace-nowrap ${
                      group.counts.gunluk > 0 ? 'border-blue-500/60 text-blue-400 bg-blue-500/5' : 'border-slate-800 text-slate-500'
                    }`}>
                      {group.counts.gunluk} Günlük rutin
                    </span>
                    <span className={`px-3 py-1.5 border rounded-full text-xs font-bold whitespace-nowrap ${
                      group.counts.aylik > 0 ? 'border-purple-500/60 text-purple-400 bg-purple-500/5' : 'border-slate-800 text-slate-500'
                    }`}>
                      {group.counts.aylik} Aylık Rutin
                    </span>
                    <span className={`px-3 py-1.5 border rounded-full text-xs font-bold whitespace-nowrap ${
                      group.counts.genel > 0 ? 'border-teal-500/60 text-teal-400 bg-teal-500/5' : 'border-slate-800 text-slate-500'
                    }`}>
                      {group.counts.genel} Genel İşlem
                    </span>

                    <button 
                      onClick={(e) => { e.stopPropagation(); generateReport(dateLabel, group.items); }}
                      className="ml-2 px-5 py-2 bg-[#1a1130] hover:bg-[#251846] border border-[#3c2573] text-[#c9a7ff] text-xs font-bold rounded-lg transition-colors flex items-center shadow-lg"
                    >
                      <Share2 className="w-3.5 h-3.5 mr-2" /> Rapor Gönder
                    </button>
                  </div>
                </div>

                {/* ACCORDION BODY (List of items) */}
                {isExpanded && (
                  <div className="p-6 bg-[#05070a]/90 space-y-8 border-t border-slate-800/50">
                    
                    {/* 1. ARIZALAR */}
                    <div>
                      <div className="flex items-center justify-between mb-4 px-1">
                        <h4 className="text-rose-500 font-bold text-sm">Bu Tarihteki Arızalar ({group.counts.ariza})</h4>
                        <button onClick={(e) => { e.stopPropagation(); openModal(undefined, 'ARIZA'); }} className="text-rose-400 hover:text-rose-300 border border-rose-500/30 bg-[#070A11] hover:bg-rose-500/10 px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center transition-colors">
                          <Plus className="w-3.5 h-3.5 mr-1.5" /> Arıza Ekle
                        </button>
                      </div>
                      <div className="space-y-3">
                        {group.items.filter(f => f.recordType === 'ARIZA').map(fault => (
                          <div key={fault.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-800/80 bg-[#0B1120] hover:border-slate-600 transition-colors group/item gap-4">
                            
                            {/* Sol Taraf Bilgi */}
                            <div className="flex items-start md:items-center space-x-4">
                              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-3 mb-1">
                                  <h4 className={`text-sm font-bold capitalize ${fault.status === 'Tamamlandı' ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{fault.title}</h4>
                                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[9px] font-bold rounded uppercase tracking-wider border border-slate-700/50">{fault.priority.toUpperCase()}</span>
                                </div>
                                <div className="flex flex-wrap items-center text-xs text-slate-500 gap-x-4 gap-y-1 mt-1">
                                  <span className="line-clamp-1">{fault.description || 'Açıklama yok'}</span>
                                  <div className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" />Açılış: {new Date(fault.faultDate).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</div>
                                  <div className="flex items-center"><Map className="w-3.5 h-3.5 mr-1" />Bölge: Tesis Geneli</div>
                                </div>
                              </div>
                            </div>

                            {/* Sağ Taraf Aksiyonlar */}
                            <div className="flex items-center gap-2 shrink-0 md:ml-auto">
                              <div className="flex items-center bg-[#070A11] rounded-lg p-1 border border-slate-800/60 mr-2">
                                <button onClick={(e) => { e.stopPropagation(); updateStatus(fault, 'Bekliyor'); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${fault.status === 'Bekliyor' ? 'bg-amber-900/30 text-amber-500 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>Bekliyor</button>
                                <button onClick={(e) => { e.stopPropagation(); updateStatus(fault, 'İşlemde'); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${fault.status === 'İşlemde' ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>İşlemde</button>
                                <button onClick={(e) => { e.stopPropagation(); updateStatus(fault, 'Tamamlandı'); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${fault.status === 'Tamamlandı' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>✓ Tamam</button>
                              </div>
                              <button onClick={() => openModal(fault)} className="p-2.5 bg-[#070A11] border border-blue-900/50 text-blue-500 hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10"><FileText className="w-4 h-4" /></button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(fault.id); }} className="p-2.5 bg-[#070A11] border border-red-900/50 text-red-500 hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10"><X className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                        {group.counts.ariza === 0 && (
                          <div className="text-xs text-slate-600 italic px-2">Bu tarihe ait kayıtlı arıza bulunmamaktadır.</div>
                        )}
                      </div>
                    </div>

                    {/* 2. GÜNLÜK RUTİNLER */}
                    <div>
                      <div className="flex items-center justify-between mb-4 px-1">
                        <h4 className="text-blue-400 font-bold text-sm">Bu Tarihteki Günlük Devriye & Rutin İşler ({group.counts.gunluk})</h4>
                        <button onClick={(e) => { e.stopPropagation(); openModal(undefined, 'GUNLUK_RUTIN'); }} className="text-blue-400 hover:text-blue-300 border border-blue-500/30 bg-[#070A11] hover:bg-blue-500/10 px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center transition-colors">
                          <Plus className="w-3.5 h-3.5 mr-1.5" /> Günlük Rutin Ekle
                        </button>
                      </div>
                      <div className="space-y-3">
                        {group.items.filter(f => f.recordType === 'GUNLUK_RUTIN' || f.recordType === 'RUTIN_GOREV').map(fault => (
                          <div key={fault.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-800/80 bg-[#0B1120] hover:border-slate-600 transition-colors group/item gap-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 rounded border border-slate-700 bg-[#05070a] flex items-center justify-center shrink-0">
                                {fault.status === 'Tamamlandı' && <CheckSquare className="w-5 h-5 text-emerald-500" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`text-sm font-bold capitalize ${fault.status === 'Tamamlandı' ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{fault.title}</h4>
                                  {fault.templateId && (
                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-bold rounded border border-blue-500/20 whitespace-nowrap">🔁 Tekrarlayan</span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500">Bölge: TerraceFeri</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 md:ml-auto">
                              <div className="flex items-center bg-[#070A11] rounded-lg p-1 border border-slate-800/60 mr-2">
                                <button onClick={(e) => { e.stopPropagation(); updateStatus(fault, 'Bekliyor'); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${fault.status === 'Bekliyor' ? 'bg-amber-900/30 text-amber-500 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>Bekliyor</button>
                                <button onClick={(e) => { e.stopPropagation(); updateStatus(fault, 'İşlemde'); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${fault.status === 'İşlemde' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>İşlemde</button>
                                <button onClick={(e) => { e.stopPropagation(); updateStatus(fault, 'Tamamlandı'); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${fault.status === 'Tamamlandı' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>✓ Tamam</button>
                              </div>
                              <button onClick={() => openModal(fault)} className="p-2.5 bg-[#070A11] border border-blue-900/50 text-blue-500 hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10"><FileText className="w-4 h-4" /></button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(fault.id); }} className="p-2.5 bg-[#070A11] border border-red-900/50 text-red-500 hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10"><X className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                        {group.counts.gunluk === 0 && (
                          <div className="text-xs text-slate-600 italic px-2">Bu tarihe ait günlük rutin devriye bulunmamaktadır.</div>
                        )}
                      </div>
                    </div>

                    {/* 3. AYLIK RUTİNLER */}
                    <div>
                      <div className="flex items-center justify-between mb-4 px-1">
                        <h4 className="text-purple-400 font-bold text-sm">Bu Tarihe Denk Gelen Aylık Periyodik Rutinler ({group.counts.aylik})</h4>
                        <button onClick={(e) => { e.stopPropagation(); openModal(undefined, 'AYLIK_RUTIN'); }} className="text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:bg-purple-500/10 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center transition-colors">
                          <Plus className="w-3.5 h-3.5 mr-1.5" /> Aylık Rutin Ekle
                        </button>
                      </div>
                      <div className="space-y-3">
                        {group.items.filter(f => f.recordType === 'AYLIK_RUTIN').map(fault => (
                          <div key={fault.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-800/80 bg-[#0B1120] hover:border-slate-600 transition-colors group/item gap-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 rounded border border-slate-700 bg-[#05070a] flex items-center justify-center shrink-0">
                                {fault.status === 'Tamamlandı' && <CheckSquare className="w-5 h-5 text-emerald-500" />}
                              </div>
                              <div>
                                <h4 className={`text-sm font-bold capitalize ${fault.status === 'Tamamlandı' ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{fault.title}</h4>
                                <div className="text-xs text-slate-500 mt-1">Bölge: Tesis Geneli</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 md:ml-auto">
                              <div className="flex items-center bg-[#070A11] rounded-lg p-1 border border-slate-800/60 mr-2">
                                <button onClick={(e) => { e.stopPropagation(); updateStatus(fault, 'Bekliyor'); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${fault.status === 'Bekliyor' ? 'bg-amber-900/30 text-amber-500 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>Bekliyor</button>
                                <button onClick={(e) => { e.stopPropagation(); updateStatus(fault, 'İşlemde'); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${fault.status === 'İşlemde' ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>İşlemde</button>
                                <button onClick={(e) => { e.stopPropagation(); updateStatus(fault, 'Tamamlandı'); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${fault.status === 'Tamamlandı' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>✓ Tamam</button>
                              </div>
                              <button onClick={() => openModal(fault)} className="p-2.5 bg-[#070A11] border border-blue-900/50 text-blue-500 hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10"><FileText className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(fault.id)} className="p-2.5 bg-[#070A11] border border-red-900/50 text-red-500 hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10"><X className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                        {group.counts.aylik === 0 && (
                          <div className="text-xs text-slate-600 italic px-2">Bu tarihe denk gelen tanımlı aylık periyodik rutin bulunmamaktadır.</div>
                        )}
                      </div>
                    </div>

                    {/* 4. GENEL İŞLEMLER */}
                    <div>
                      <div className="flex items-center justify-between mb-4 px-1">
                        <h4 className="text-teal-400 font-bold text-sm">Bu Tarihteki Genel İşlemler & Görevler ({group.counts.genel})</h4>
                        <button onClick={(e) => { e.stopPropagation(); openModal(undefined, 'GENEL_ISLEM'); }} className="text-teal-400 hover:text-teal-300 border border-teal-500/30 hover:bg-teal-500/10 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center transition-colors">
                          <Plus className="w-3.5 h-3.5 mr-1.5" /> İşlem Ekle
                        </button>
                      </div>
                      <div className="space-y-3">
                        {group.items.filter(f => f.recordType === 'GENEL_ISLEM').map(fault => (
                          <div key={fault.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-800/80 bg-[#0B1120] hover:border-slate-600 transition-colors group/item gap-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 rounded border border-slate-700 bg-[#05070a] flex items-center justify-center shrink-0">
                                {fault.status === 'Tamamlandı' && <CheckSquare className="w-5 h-5 text-emerald-500" />}
                              </div>
                              <div>
                                <h4 className={`text-sm font-bold capitalize ${fault.status === 'Tamamlandı' ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{fault.title}</h4>
                                <div className="text-xs text-slate-500 mt-1">Bölge: Tesis Geneli</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 md:ml-auto">
                              <div className="flex items-center bg-[#070A11] rounded-lg p-1 border border-slate-800/60 mr-2">
                                <button onClick={(e) => { e.stopPropagation(); updateStatus(fault, 'Bekliyor'); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${fault.status === 'Bekliyor' ? 'bg-amber-900/30 text-amber-500 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>Bekliyor</button>
                                <button onClick={(e) => { e.stopPropagation(); updateStatus(fault, 'İşlemde'); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${fault.status === 'İşlemde' ? 'bg-teal-900/30 text-teal-400 border border-teal-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>İşlemde</button>
                                <button onClick={(e) => { e.stopPropagation(); updateStatus(fault, 'Tamamlandı'); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${fault.status === 'Tamamlandı' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>✓ Tamam</button>
                              </div>
                              <button onClick={() => openModal(fault)} className="p-2.5 bg-[#070A11] border border-blue-900/50 text-blue-500 hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10"><FileText className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(fault.id)} className="p-2.5 bg-[#070A11] border border-red-900/50 text-red-500 hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center w-10 h-10"><X className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                        {group.counts.genel === 0 && (
                          <div className="text-xs text-slate-600 italic px-2">Bu tarihte kaydedilmiş genel işlem/görev bulunmamaktadır.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {faults.length === 0 && (
             <div className="text-center py-12 bg-[#0f121b] border border-slate-800 rounded-xl text-slate-500">
               Arıza veya rutin görev kaydı bulunmamaktadır.
             </div>
          )}
        </div>
      )}

      {/* DETAY KARTI MODAL (Aynı Yapı Korundu) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}>
          <div className="bg-[#0f121b] border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-[#080b12]">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-white flex items-center tracking-wide">
                  <Activity className="w-5 h-5 mr-3 text-indigo-500" /> {editingId ? 'Kayıt Detayları & Düzenle' : 'Yeni Kayıt Ekle'}
                </h3>
                {editingId && (
                  <button onClick={() => handleDelete(editingId!)} className="flex items-center px-3 py-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 rounded-md transition-colors text-sm font-semibold">
                    <X className="w-4 h-4 mr-1.5" /> Sil
                  </button>
                )}
              </div>
              <button onClick={closeModal} className="text-slate-500 hover:text-white p-1.5 rounded-md hover:bg-slate-800 ml-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-slate-800/80 bg-[#080b12] px-4">
              <button onClick={() => setActiveTab('info')} className={`px-4 py-3 text-sm font-semibold flex items-center border-b-2 transition-colors ${activeTab === 'info' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500'}`}><FileText className="w-4 h-4 mr-2" /> Kayıt Detayları</button>
              <button onClick={() => setActiveTab('reports')} className={`px-4 py-3 text-sm font-semibold flex items-center border-b-2 transition-colors ${activeTab === 'reports' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500'}`}><CheckSquare className="w-4 h-4 mr-2" /> Yönetim Raporu</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form id="fault-form" onSubmit={handleSubmit} className="space-y-6">
                <div className={activeTab === 'info' ? 'block space-y-6' : 'hidden'}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Başlık / Konu *</span>
                        <span className="text-[10px] text-indigo-400 font-normal">✨ Akıllı Ekipman & Firma Algılama</span>
                      </label>
                      <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => handleTitleChange(e.target.value)} 
                        placeholder="Örn: 2 Nolu Asansör arızalandı veya Daire 4 intercom çalışmıyor..."
                        className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-indigo-500/50 text-sm" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Kayıt Türü</label>
                      <select value={recordType} onChange={(e) => setRecordType(e.target.value)} className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-indigo-500/50 text-sm appearance-none">
                        <option value="ARIZA">🚨 Arıza Bildirimi</option>
                        <option value="GUNLUK_RUTIN">🔄 Günlük Rutin / Devriye</option>
                        <option value="AYLIK_RUTIN">📅 Aylık Rutin / Bakım</option>
                        <option value="GENEL_ISLEM">📝 Genel Görev / İşlem</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-slate-800 p-4 rounded-xl bg-slate-800/10">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Durum</label>
                      <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-indigo-500/50 text-sm appearance-none">
                        <option value="Bekliyor">Bekliyor</option>
                        <option value="İşlemde">İşlemde</option>
                        <option value="Tamamlandı">Tamamlandı</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">İlgili Ekipman / Alan</label>
                      <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-indigo-500/50 text-sm appearance-none">
                        <option value="">Tesis Geneli</option>
                        {equipments.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Taşeron / Firma (Varsa)</label>
                      <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-indigo-500/50 text-sm appearance-none">
                        <option value="">-- Kendi Bünyemizde --</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Açıklama / Görev Detayı</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 bg-[#080b12] border border-slate-800 text-white rounded-md focus:outline-none focus:border-indigo-500/50 text-sm resize-none"></textarea>
                  </div>

                  {status !== 'Tamamlandı' && (
                    <div className="border border-amber-900/30 rounded-xl p-4 bg-amber-900/5">
                      <label className="block text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">Bekleme Nedeni</label>
                      <textarea value={pendingReason} onChange={(e) => setPendingReason(e.target.value)} rows={2} className="w-full px-4 py-2 bg-[#080b12] border border-amber-900/50 text-amber-100 rounded-md focus:outline-none focus:border-amber-500/50 text-sm resize-none"></textarea>
                    </div>
                  )}

                  {status === 'Tamamlandı' && (
                    <div className="border border-emerald-900/30 rounded-xl p-4 bg-emerald-900/5">
                      <label className="block text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">Çözüm / Kapanış Notu</label>
                      <textarea value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)} rows={2} className="w-full px-4 py-2 bg-[#080b12] border border-emerald-900/50 text-emerald-100 rounded-md focus:outline-none focus:border-emerald-500/50 text-sm resize-none"></textarea>
                    </div>
                  )}
                </div>

                <div className={activeTab === 'reports' ? 'block space-y-6' : 'hidden'}>
                  <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-slate-300 leading-relaxed">Raporlanacak bilgileri seçin.</p>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-[#080b12] opacity-50 cursor-not-allowed">
                      <input type="checkbox" checked={true} disabled className="mt-1" />
                      <div><span className="block text-sm font-semibold text-white">Başlık ve Arıza Detayı (Zorunlu)</span></div>
                    </label>
                    <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-[#080b12] cursor-pointer">
                      <input type="checkbox" checked={reportFields.includes('pending')} onChange={() => handleReportFieldChange('pending')} className="mt-1" />
                      <div><span className="block text-sm font-semibold text-white">Bekleme Nedeni (Eğer bitmediyse)</span></div>
                    </label>
                    <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-[#080b12] cursor-pointer">
                      <input type="checkbox" checked={reportFields.includes('resolution')} onChange={() => handleReportFieldChange('resolution')} className="mt-1" />
                      <div><span className="block text-sm font-semibold text-white">Çözüm Açıklaması (Eğer bittiyse)</span></div>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-800/80 bg-[#080b12] flex items-center justify-end space-x-3">
              <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-transparent border border-slate-600/50 text-slate-400 hover:bg-slate-800/30 hover:text-slate-300 text-sm font-semibold rounded-lg transition-colors">İptal</button>
              <button form="fault-form" type="submit" className="flex items-center px-6 py-2.5 bg-transparent border border-indigo-500/50 text-indigo-400 hover:bg-indigo-900/20 text-sm font-bold rounded-lg transition-colors">
                <Save className="w-4 h-4 mr-2" /> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAPOR GÖNDER MODALI (PRINTABLE) */}
      {isReportModalOpen && (() => {
        const arizaItems = reportItems.filter(item => item.recordType === 'ARIZA');
        const rutinItems = reportItems.filter(item => item.recordType !== 'ARIZA');

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsReportModalOpen(false)}>
            <style>{`
              @page { margin: 10mm 8mm; size: A4 portrait; }
              @media print {
                body * { visibility: hidden; }
                #print-report, #print-report * { visibility: visible; }
                #print-report {
                  position: fixed;
                  left: 0; top: 0;
                  width: 100%;
                  background: white !important;
                  color: black !important;
                  padding: 0 !important;
                }
                .print-hide { display: none !important; }
                .report-table {
                  width: 100% !important;
                  table-layout: fixed !important;
                  border-collapse: collapse !important;
                  font-size: 8pt !important;
                }
                .report-table th {
                  border-bottom: 1px solid #cbd5e1 !important;
                  padding: 5px 6px !important;
                  white-space: nowrap !important;
                  overflow: hidden !important;
                  background-color: #f1f5f9 !important;
                  color: #334155 !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .report-table td {
                  border-bottom: 1px solid #f1f5f9 !important;
                  padding: 5px 6px !important;
                  white-space: normal !important;
                  word-break: break-word !important;
                }
                .section-header-ariza {
                  background-color: #fff1f2 !important;
                  color: #9f1239 !important;
                  border: 1px solid #fecdd3 !important;
                  border-left: 4px solid #e11d48 !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .section-header-rutin {
                  background-color: #f0f9ff !important;
                  color: #0369a1 !important;
                  border: 1px solid #bae6fd !important;
                  border-left: 4px solid #0284c7 !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .print-box { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .stripe-row { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            `}</style>
            
            <div className="bg-white border border-slate-300 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative text-slate-800" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header (Hidden on print) */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print-hide shrink-0">
                <h3 className="text-xl font-bold text-slate-800 flex items-center"><Printer className="w-5 h-5 mr-3 text-indigo-600" /> Rapor Önizleme & Yazdırma</h3>
                <div className="flex items-center space-x-3">
                  <button onClick={copyReport} className="flex items-center px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-md transition-colors shadow-md">
                    <Printer className="w-4 h-4 mr-2" /> PDF Kaydet / Yazdır
                  </button>
                  <button onClick={() => setIsReportModalOpen(false)} className="p-2 text-slate-500 hover:text-slate-800 bg-slate-200 rounded-md"><X className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Print Content Area */}
              <div id="print-report" className="flex-1 overflow-y-auto bg-white" style={{padding:'16px 20px'}}>
                <div style={{maxWidth:'760px', margin:'0 auto'}}>
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h1 className="text-xl font-black text-slate-900 tracking-tight">TERRACEFERİ KONUTLARI</h1>
                      <h2 className="text-[10px] font-bold text-slate-500 tracking-widest mt-0.5">TerraceFeri Site Yöneticiliği</h2>
                      <h3 className="text-[10px] text-slate-400">Teknik Operasyon & Bakım Yönetim Sistemi (TMM Core)</h3>
                    </div>
                    <div className="text-right">
                      <div className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold mb-1 border border-slate-200">RAPOR KODU: {reportCode}</div>
                      <div className="text-[10px] text-slate-600">Düzenlenme Tarihi: <b className="text-slate-800">{new Date().toLocaleDateString('tr-TR', {day:'numeric', month:'long', year:'numeric'})}</b></div>
                      <div className="text-[10px] text-slate-500">Modül: <span className="font-semibold text-slate-600">Günlük Operasyon Raporu</span></div>
                    </div>
                  </div>

                  <hr className="border-t-2 border-slate-800 mb-3" />

                  {/* Title Box */}
                  <div className="print-box bg-slate-50 border border-slate-200 rounded-lg p-2 text-center mb-4">
                    <h2 className="text-base font-black text-slate-900 mb-0.5 uppercase">TERRACEFERİ KONUTLARI {reportItems?.[0] ? new Date(reportItems[0].faultDate).toISOString().split('T')[0] : ''} OPERASYON RAPORU</h2>
                    <p className="text-[10px] text-slate-500 font-medium">{reportItems?.[0] ? new Date(reportItems[0].faultDate).toISOString().split('T')[0] : ''} tarihli arıza bildirimleri, devriyeler ve rutin denetim dökümü</p>
                  </div>

                  {/* 1. BÖLÜM: ARIZALAR */}
                  <div style={{marginBottom: '20px'}}>
                    <div className="section-header-ariza" style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff1f2', color:'#9f1239', border:'1px solid #fecdd3', borderLeft:'4px solid #e11d48', padding:'7px 12px', borderRadius:'6px 6px 0 0', fontWeight:'800', fontSize:'11px', letterSpacing:'0.5px', textTransform:'uppercase'}}>
                      <span style={{display:'flex', alignItems:'center', gap:'6px'}}>⚠️ 1. ARIZA VE TALEP BİLDİRİMLERİ</span>
                      <span style={{fontSize:'10px', background:'#ffe4e6', color:'#be123c', border:'1px solid #fca5a5', padding:'2px 8px', borderRadius:'4px', fontWeight:'700'}}>{arizaItems.length} KAYIT</span>
                    </div>
                    <div style={{border:'1px solid #e2e8f0', borderTop:'none', borderRadius:'0 0 6px 6px', overflow:'hidden'}}>
                      <table className="report-table" style={{width:'100%', tableLayout:'fixed', borderCollapse:'collapse', fontSize:'12px'}}>
                        <colgroup>
                          <col style={{width:'26px'}} />
                          <col style={{width:'auto'}} />
                          <col style={{width:'100px'}} />
                          <col style={{width:'90px'}} />
                          <col style={{width:'75px'}} />
                          <col style={{width:'70px'}} />
                          <col style={{width:'90px'}} />
                        </colgroup>
                        <thead>
                          <tr style={{background:'#f8fafc', color:'#475569', borderBottom:'1px solid #cbd5e1'}}>
                            <th style={{padding:'7px 6px', fontWeight:'700', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.5px', textAlign:'center', whiteSpace:'nowrap', overflow:'hidden', color:'#475569'}}>#</th>
                            <th style={{padding:'7px 10px', fontWeight:'700', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap', overflow:'hidden', color:'#475569'}}>Arıza / Talep Başlığı</th>
                            <th style={{padding:'7px 8px', fontWeight:'700', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap', overflow:'hidden', color:'#475569'}}>Kategori</th>
                            <th style={{padding:'7px 8px', fontWeight:'700', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap', overflow:'hidden', color:'#475569'}}>Bölge / Ekipman</th>
                            <th style={{padding:'7px 8px', fontWeight:'700', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap', overflow:'hidden', color:'#475569'}}>Öncelik</th>
                            <th style={{padding:'7px 8px', fontWeight:'700', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap', overflow:'hidden', color:'#475569'}}>Saat</th>
                            <th style={{padding:'7px 8px', fontWeight:'700', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap', overflow:'hidden', color:'#475569'}}>Durum</th>
                          </tr>
                        </thead>
                        <tbody>
                          {arizaItems.map((item, index) => (
                            <tr key={item.id} className={index % 2 !== 0 ? 'stripe-row' : ''} style={{background: index % 2 !== 0 ? '#f8fafc' : 'white', borderBottom:'1px solid #f1f5f9'}}>
                              <td style={{padding:'7px 6px', textAlign:'center', color:'#94a3b8', fontWeight:'600', whiteSpace:'nowrap', overflow:'hidden'}}>{index + 1}</td>
                              <td className="cell-title" style={{padding:'7px 10px', color:'#0f172a', fontWeight:'700', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{item.title}</td>
                              <td style={{padding:'7px 8px', color:'#475569', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>Arıza Bildirimi</td>
                              <td style={{padding:'7px 8px', color:'#475569', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>Tesis Geneli</td>
                              <td style={{padding:'7px 8px', color:'#b91c1c', fontWeight:'700', textTransform:'uppercase', whiteSpace:'nowrap', overflow:'hidden'}}>
                                {item.priority?.toUpperCase() || 'NORMAL'}
                              </td>
                              <td style={{padding:'7px 8px', color:'#475569', whiteSpace:'nowrap', overflow:'hidden'}}>
                                {new Date(item.faultDate).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}
                              </td>
                              <td style={{padding:'7px 8px', whiteSpace:'nowrap', overflow:'hidden'}}>
                                <span style={{fontWeight:'700', color: item.status === 'Bekliyor' ? '#d97706' : item.status === 'İşlemde' ? '#2563eb' : '#059669'}}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {arizaItems.length === 0 && (
                            <tr>
                              <td colSpan={7} style={{padding:'14px', textAlign:'center', color:'#94a3b8', fontStyle:'italic', fontSize:'11px'}}>Bu tarihe ait kayıtlı arıza bildirimi bulunmamaktadır.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 2. BÖLÜM: RUTİN İŞLER */}
                  <div style={{marginBottom: '20px'}}>
                    <div className="section-header-rutin" style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'#f0f9ff', color:'#0369a1', border:'1px solid #bae6fd', borderLeft:'4px solid #0284c7', padding:'7px 12px', borderRadius:'6px 6px 0 0', fontWeight:'800', fontSize:'11px', letterSpacing:'0.5px', textTransform:'uppercase'}}>
                      <span style={{display:'flex', alignItems:'center', gap:'6px'}}>📋 2. GÜNLÜK DEVRİYE VE RUTİN İŞLER</span>
                      <span style={{fontSize:'10px', background:'#e0f2fe', color:'#0284c7', border:'1px solid #7dd3fc', padding:'2px 8px', borderRadius:'4px', fontWeight:'700'}}>{rutinItems.length} KAYIT</span>
                    </div>
                    <div style={{border:'1px solid #e2e8f0', borderTop:'none', borderRadius:'0 0 6px 6px', overflow:'hidden'}}>
                      <table className="report-table" style={{width:'100%', tableLayout:'fixed', borderCollapse:'collapse', fontSize:'12px'}}>
                        <colgroup>
                          <col style={{width:'26px'}} />
                          <col style={{width:'auto'}} />
                          <col style={{width:'100px'}} />
                          <col style={{width:'90px'}} />
                          <col style={{width:'75px'}} />
                          <col style={{width:'70px'}} />
                          <col style={{width:'90px'}} />
                        </colgroup>
                        <thead>
                          <tr style={{background:'#f8fafc', color:'#475569', borderBottom:'1px solid #cbd5e1'}}>
                            <th style={{padding:'7px 6px', fontWeight:'700', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.5px', textAlign:'center', whiteSpace:'nowrap', overflow:'hidden', color:'#475569'}}>#</th>
                            <th style={{padding:'7px 10px', fontWeight:'700', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap', overflow:'hidden', color:'#475569'}}>Rutin Görev / Kontrol</th>
                            <th style={{padding:'7px 8px', fontWeight:'700', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap', overflow:'hidden', color:'#475569'}}>Kategori</th>
                            <th style={{padding:'7px 8px', fontWeight:'700', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap', overflow:'hidden', color:'#475569'}}>Bölge / Ekipman</th>
                            <th style={{padding:'7px 8px', fontWeight:'700', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap', overflow:'hidden', color:'#475569'}}>Tür</th>
                            <th style={{padding:'7px 8px', fontWeight:'700', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap', overflow:'hidden', color:'#475569'}}>Periyot</th>
                            <th style={{padding:'7px 8px', fontWeight:'700', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap', overflow:'hidden', color:'#475569'}}>Durum</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rutinItems.map((item, index) => (
                            <tr key={item.id} className={index % 2 !== 0 ? 'stripe-row' : ''} style={{background: index % 2 !== 0 ? '#f8fafc' : 'white', borderBottom:'1px solid #f1f5f9'}}>
                              <td style={{padding:'7px 6px', textAlign:'center', color:'#94a3b8', fontWeight:'600', whiteSpace:'nowrap', overflow:'hidden'}}>{index + 1}</td>
                              <td className="cell-title" style={{padding:'7px 10px', color:'#0f172a', fontWeight:'700', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{item.title}</td>
                              <td style={{padding:'7px 8px', color:'#475569', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                                {item.recordType === 'AYLIK_RUTIN' ? 'Aylık Rutin' : 'Günlük Devriye'}
                              </td>
                              <td style={{padding:'7px 8px', color:'#475569', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>Tesis Geneli</td>
                              <td style={{padding:'7px 8px', color:'#0284c7', fontWeight:'700', textTransform:'uppercase', whiteSpace:'nowrap', overflow:'hidden'}}>
                                RUTİN
                              </td>
                              <td style={{padding:'7px 8px', color:'#475569', whiteSpace:'nowrap', overflow:'hidden'}}>
                                {item.recordType === 'AYLIK_RUTIN' ? 'Aylık Tur' : 'Günlük Tur'}
                              </td>
                              <td style={{padding:'7px 8px', whiteSpace:'nowrap', overflow:'hidden'}}>
                                <span style={{fontWeight:'700', color: item.status === 'Bekliyor' ? '#d97706' : item.status === 'İşlemde' ? '#2563eb' : '#059669'}}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {rutinItems.length === 0 && (
                            <tr>
                              <td colSpan={7} style={{padding:'14px', textAlign:'center', color:'#94a3b8', fontStyle:'italic', fontSize:'11px'}}>Bu tarihe ait kayıtlı günlük rutin veya devriye bulunmamaktadır.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="flex justify-between items-start mt-6 pt-2 pb-2">
                    <div>
                      <div className="font-bold text-slate-800 text-[11px]">Teknik Sorumlu</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Serdar DOĞRUER</div>
                      <div className="mt-4 border-b border-slate-300 w-40"></div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-800 text-[11px]">Site Müdürü</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Saliha ERCAN</div>
                      <div className="mt-4 border-b border-slate-300 w-40 ml-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
