'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Send, Plus, X, FileText, CheckCircle2, Clock, 
  AlertTriangle, Package, MessageSquare, Printer, Search, 
  ChevronRight, Trash2, Edit3, DollarSign, Filter,
  Share2, ShieldAlert, Sparkles, User, MapPin, Tag
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

interface MaterialItem {
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
}

interface ManagementRequest {
  id: string;
  type: 'MALZEME_TALEBI' | 'BILGILENDIRME';
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  urgency: 'Dusuk' | 'Normal' | 'Acil' | 'Kritik';
  status: 'Beklemede' | 'Incelemede' | 'Onaylandi' | 'Reddedildi' | 'Tamamlandi';
  estimatedCost: number | null;
  supplier: string | null;
  itemsJson: string | null;
  managementResponse: string | null;
  approvedBudget: number | null;
  requesterName: string | null;
  attachmentUrls: string | null;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  'Mekanik & Tesisat',
  'Elektrik & Otomasyon',
  'Havuz & Kimyasallar',
  'Asansörler',
  'Kazan & Isıtma',
  'Hidrofor & Pompalar',
  'Sosyal Tesis & Peyzaj',
  'Güvenlik & Kamera',
  'Genel İhtiyaç'
];

const LOCATIONS = [
  'Tesis Geneli',
  'Kazan Dairesi',
  'Hidrofor & Pompa Odası',
  'Havuz Dairesi & Sosyal Tesis',
  'A Blok',
  'B Blok',
  'C Blok',
  'Otopark & Sığınak',
  'Trafo & Elektrik Odası',
  'Güvenlik & Giriş Alanı'
];

export default function ManagementRequestsPage() {
  const [requests, setRequests] = useState<ManagementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Form States
  const [type, setType] = useState<'MALZEME_TALEBI' | 'BILGILENDIRME'>('MALZEME_TALEBI');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [urgency, setUrgency] = useState<'Dusuk' | 'Normal' | 'Acil' | 'Kritik'>('Normal');
  const [status, setStatus] = useState<'Beklemede' | 'Incelemede' | 'Onaylandi' | 'Reddedildi' | 'Tamamlandi'>('Beklemede');
  const [supplier, setSupplier] = useState('');
  const [managementResponse, setManagementResponse] = useState('');
  const [approvedBudget, setApprovedBudget] = useState('');
  
  // Material Items dynamic list
  const [items, setItems] = useState<MaterialItem[]>([
    { name: '', quantity: 1, unit: 'Adet', estimatedPrice: 0 }
  ]);

  // Printable / Preview Modal
  const [printItem, setPrintItem] = useState<ManagementRequest | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<{ success: boolean; data: ManagementRequest[] }>('/api/management-requests');
      if (res?.success) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error('Failed to load management requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Items handlers
  const handleAddItem = () => {
    setItems(prev => [...prev, { name: '', quantity: 1, unit: 'Adet', estimatedPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof MaterialItem, value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      return { ...item, [field]: value };
    }));
  };

  const calculatedTotal = useMemo(() => {
    return items.reduce((acc, curr) => {
      const q = Number(curr.quantity) || 0;
      const p = Number(curr.estimatedPrice) || 0;
      return acc + (q * p);
    }, 0);
  }, [items]);

  const openNewModal = (selectedType: 'MALZEME_TALEBI' | 'BILGILENDIRME' = 'MALZEME_TALEBI') => {
    setEditingId(null);
    setType(selectedType);
    setTitle('');
    setDescription('');
    setCategory(CATEGORIES[0]);
    setLocation(LOCATIONS[0]);
    setUrgency('Normal');
    setStatus('Beklemede');
    setSupplier('');
    setManagementResponse('');
    setApprovedBudget('');
    setItems([{ name: '', quantity: 1, unit: 'Adet', estimatedPrice: 0 }]);
    setIsModalOpen(true);
  };

  const openEditModal = (r: ManagementRequest) => {
    setEditingId(r.id);
    setType(r.type);
    setTitle(r.title);
    setDescription(r.description || '');
    setCategory(r.category || CATEGORIES[0]);
    setLocation(r.location || LOCATIONS[0]);
    setUrgency(r.urgency || 'Normal');
    setStatus(r.status || 'Beklemede');
    setSupplier(r.supplier || '');
    setManagementResponse(r.managementResponse || '');
    setApprovedBudget(r.approvedBudget ? String(r.approvedBudget) : '');

    try {
      const parsedItems = JSON.parse(r.itemsJson || '[]');
      if (Array.isArray(parsedItems) && parsedItems.length > 0) {
        setItems(parsedItems);
      } else {
        setItems([{ name: '', quantity: 1, unit: 'Adet', estimatedPrice: 0 }]);
      }
    } catch {
      setItems([{ name: '', quantity: 1, unit: 'Adet', estimatedPrice: 0 }]);
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Lütfen bir başlık giriniz.');
      return;
    }

    const payload = {
      type,
      title: title.trim(),
      description: description.trim() || null,
      category,
      location,
      urgency,
      status,
      supplier: supplier.trim() || null,
      managementResponse: managementResponse.trim() || null,
      approvedBudget: approvedBudget ? parseFloat(approvedBudget) : null,
      estimatedCost: type === 'MALZEME_TALEBI' ? calculatedTotal : null,
      itemsJson: type === 'MALZEME_TALEBI' ? JSON.stringify(items.filter(i => i.name.trim())) : '[]',
      requesterName: 'Serdar DOĞRUER (Teknik Sorumlu)',
    };

    try {
      if (editingId) {
        const res = await ApiClient.put<{ success: boolean; data: ManagementRequest }>('/api/management-requests', {
          id: editingId,
          ...payload
        });
        if (res?.success) {
          setRequests(prev => prev.map(r => r.id === editingId ? res.data : r));
          setIsModalOpen(false);
        }
      } else {
        const res = await ApiClient.post<{ success: boolean; data: ManagementRequest }>('/api/management-requests', payload);
        if (res?.success) {
          setRequests(prev => [res.data, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      alert('Kayıt kaydedilirken bir hata oluştu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu talebi / bilgilendirmeyi silmek istediğinize emin misiniz?')) return;
    try {
      const res: any = await ApiClient.delete(`/api/management-requests?id=${id}`);
      if (res?.success) {
        setRequests(prev => prev.filter(r => r.id !== id));
        if (isModalOpen && editingId === id) setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (filterType === 'MALZEME' && r.type !== 'MALZEME_TALEBI') return false;
      if (filterType === 'BILGILENDIRME' && r.type !== 'BILGILENDIRME') return false;
      if (filterType === 'BEKLEYEN' && r.status !== 'Beklemede') return false;
      if (filterType === 'ONAYLANAN' && r.status !== 'Onaylandi' && r.status !== 'Tamamlandi') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = r.title.toLowerCase().includes(q);
        const inDesc = (r.description || '').toLowerCase().includes(q);
        const inCategory = (r.category || '').toLowerCase().includes(q);
        const inLocation = (r.location || '').toLowerCase().includes(q);
        return inTitle || inDesc || inCategory || inLocation;
      }

      return true;
    });
  }, [requests, filterType, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalMaterials = requests.filter(r => r.type === 'MALZEME_TALEBI');
    const totalNotices = requests.filter(r => r.type === 'BILGILENDIRME');
    const pending = requests.filter(r => r.status === 'Beklemede');
    const approved = requests.filter(r => r.status === 'Onaylandi' || r.status === 'Tamamlandi');
    const totalCost = totalMaterials.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);

    return {
      total: requests.length,
      materials: totalMaterials.length,
      notices: totalNotices.length,
      pending: pending.length,
      approved: approved.length,
      totalCost
    };
  }, [requests]);

  const copyWhatsAppText = (item: ManagementRequest) => {
    let text = `📋 *TERRACEFERİ YÖNETİM ${item.type === 'MALZEME_TALEBI' ? 'MALZEME TALEP FORMU' : 'TEKNİK BİLGİLENDİRME'}*\n`;
    text += `🗓️ *Tarih:* ${new Date(item.createdAt).toLocaleDateString('tr-TR')}\n`;
    text += `📌 *Konu:* ${item.title}\n`;
    text += `📍 *Bölge / Kategori:* ${item.location || 'Tesis Geneli'} / ${item.category || 'Genel'}\n`;
    text += `🚨 *Aciliyet:* ${item.urgency.toUpperCase()}\n`;
    text += `👤 *Talep Eden:* ${item.requesterName || 'Teknik Sorumlu'}\n\n`;

    if (item.description) {
      text += `📝 *Açıklama / Gerekçe:*\n${item.description}\n\n`;
    }

    if (item.type === 'MALZEME_TALEBI') {
      try {
        const parsed: MaterialItem[] = JSON.parse(item.itemsJson || '[]');
        if (parsed.length > 0) {
          text += `📦 *Talep Edilen Malzemeler:*\n`;
          parsed.forEach((m, idx) => {
            text += `${idx + 1}. ${m.name} - ${m.quantity} ${m.unit} (${m.estimatedPrice > 0 ? (m.estimatedPrice * m.quantity).toLocaleString('tr-TR') + ' ₺' : 'Fiyat Belirtilmedi'})\n`;
          });
          text += `\n💰 *Tahmini Toplam Tutar:* ${item.estimatedCost?.toLocaleString('tr-TR') || 0} ₺\n`;
        }
      } catch {}
    }

    if (item.managementResponse) {
      text += `\n🏛️ *Yönetim Notu:* ${item.managementResponse}\n`;
    }
    text += `\n*Durum:* ${item.status.toUpperCase()}`;

    navigator.clipboard.writeText(text);
    alert('WhatsApp formatında metin panoya kopyalandı!');
  };

  return (
    <div className="space-y-6 max-w-[1240px] mx-auto pb-24">
      
      {/* 1. UNIFIED HEADER & FILTERS */}
      <div className="bg-[#080b12] border border-slate-800/80 p-5 rounded-2xl shadow-xl space-y-4">
        {/* Top Row: Title & Add Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                Yönetim Masası
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Teknik & Yönetim
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Site Yönetimine resmi bilgilendirme notları iletin veya malzeme/satın alma talepleri oluşturun.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto shrink-0">
            <button 
              onClick={() => openNewModal()}
              className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-indigo-900/20 hover:bg-indigo-900/40 border border-indigo-500/40 text-indigo-300 text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Yeni Kayıt Ekle
            </button>
          </div>
        </div>

        {/* Bottom Row: Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
          <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
            {[
              { id: 'ALL', label: 'Tümü' },
              { id: 'MALZEME', label: '📦 Malzeme Talepleri' },
              { id: 'BILGILENDIRME', label: '📢 Bilgilendirmeler' },
              { id: 'BEKLEYEN', label: '⏳ Bekleyenler' },
              { id: 'ONAYLANAN', label: '✅ Onaylananlar' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === tab.id
                    ? 'bg-indigo-900/20 border border-indigo-500/50 text-indigo-300 shadow-sm'
                    : 'bg-transparent border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Başlık, bölge ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-transparent border border-slate-700/60 text-white rounded-lg text-xs focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>
      </div>

      {/* 4. MAIN LIST - SIGNATURE DATA BOX ARCHITECTURE */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 bg-slate-900/60 border border-slate-800 rounded-xl">
          Talepler ve bilgilendirmeler yükleniyor...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-xl">
          <Send className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-slate-300">Henüz talep veya bilgilendirme kaydı yok</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Yukarıdaki butonları kullanarak site yönetimine malzeme talebi açabilir veya teknik bilgilendirme notu gönderebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(item => {
            const isMaterial = item.type === 'MALZEME_TALEBI';
            const isExpanded = expandedId === item.id;
            let parsedItems: MaterialItem[] = [];
            try {
              parsedItems = JSON.parse(item.itemsJson || '[]');
            } catch {}

            return (
              <div key={item.id} className="space-y-2">
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-slate-900 border ${
                    isExpanded ? 'border-indigo-500/60 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/30'
                  } rounded-xl transition-colors cursor-pointer`}
                >
                  {/* Data Boxes Row */}
                  <div className="flex items-center justify-between gap-2.5 flex-1 overflow-x-auto py-1">
                    <div className="flex items-center gap-2 shrink-0">
                      
                      {/* TARİH */}
                      <div className="flex flex-col items-center justify-center w-[100px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm px-2">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">TARİH</span>
                        <span className="text-[12px] font-bold text-slate-300">
                          {new Date(item.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>

                      {/* TÜR */}
                      <div className="flex flex-col items-center justify-center w-[140px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm px-2">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">TÜR</span>
                        <span className={`text-[12px] font-bold truncate max-w-[130px] ${isMaterial ? 'text-indigo-400' : 'text-blue-400'}`}>
                          {isMaterial ? 'Malzeme Talebi' : 'Bilgilendirme'}
                        </span>
                      </div>

                      {/* KONU / BAŞLIK */}
                      <div className="flex flex-col items-start justify-center min-w-[280px] max-w-[500px] flex-1 h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm px-3">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">TALEP / KONU</span>
                        <span className="text-[13px] font-bold text-white truncate max-w-[480px]">{item.title}</span>
                      </div>

                      {/* MALİYET / İÇERİK */}
                      <div className="flex flex-col items-center justify-center w-[130px] h-[52px] shrink-0 bg-[#070A11] border border-[#151B2B] rounded-lg shadow-sm px-2">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">
                          {isMaterial ? 'MALİYET' : 'İÇERİK'}
                        </span>
                        <span className="text-[12px] font-bold text-yellow-400 truncate max-w-[120px]">
                          {isMaterial 
                            ? (item.estimatedCost ? item.estimatedCost.toLocaleString('tr-TR') + ' ₺' : (parsedItems.length ? `${parsedItems.length} Kalem` : 'Belirtilmedi'))
                            : 'Bilgi Notu'}
                        </span>
                      </div>

                    </div>

                    {/* Actions (OZEL_KURALLAR Uyumlu Şeffaf / Renkli Kenarlıklı Butonlar) */}
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrintItem(item);
                        }}
                        className="p-2.5 bg-transparent border border-slate-700/60 hover:border-slate-500 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center justify-center w-10 h-10"
                        title="Resmi Form (PDF / Yazdır)"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(item);
                        }}
                        className="p-2.5 bg-blue-900/10 border border-blue-500/40 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors flex items-center justify-center w-10 h-10"
                        title="Düzenle"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="p-2.5 bg-rose-900/10 border border-rose-500/40 text-rose-400 hover:bg-rose-900/30 rounded-lg transition-colors flex items-center justify-center w-10 h-10"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(isExpanded ? null : item.id);
                        }}
                        className="p-2.5 bg-transparent border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500 rounded-lg transition-colors flex items-center justify-center w-10 h-10"
                        title={isExpanded ? 'Detayları Gizle' : 'Detayları Göster'}
                      >
                        <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-indigo-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Accordion Expand Details */}
                {isExpanded && (
                  <div className="p-4 bg-[#070a12] border border-slate-800 rounded-xl space-y-3 animate-in fade-in duration-200">
                    {item.description && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">AÇIKLAMA / GEREKÇE:</div>
                        <div className="text-xs text-slate-300 leading-relaxed bg-[#05070a] p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                          {item.description}
                        </div>
                      </div>
                    )}

                    {isMaterial && parsedItems.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">TALEP EDİLEN MALZEMELER:</div>
                        <div className="bg-[#05070a] border border-slate-800/80 rounded-lg overflow-hidden">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-900/80 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                              <tr>
                                <th className="p-2">#</th>
                                <th className="p-2">Malzeme Adı</th>
                                <th className="p-2 text-center">Miktar</th>
                                <th className="p-2 text-right">Tahmini Fiyat</th>
                                <th className="p-2 text-right">Toplam</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-slate-300">
                              {parsedItems.map((m, idx) => (
                                <tr key={idx}>
                                  <td className="p-2 text-slate-500">{idx + 1}</td>
                                  <td className="p-2 font-semibold text-white">{m.name}</td>
                                  <td className="p-2 text-center">{m.quantity} {m.unit}</td>
                                  <td className="p-2 text-right text-slate-400">{m.estimatedPrice ? m.estimatedPrice.toLocaleString('tr-TR') + ' ₺' : '-'}</td>
                                  <td className="p-2 text-right font-bold text-indigo-300">{((m.quantity || 1) * (m.estimatedPrice || 0)) ? ((m.quantity || 1) * (m.estimatedPrice || 0)).toLocaleString('tr-TR') + ' ₺' : '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {item.managementResponse && (
                      <div className="bg-amber-950/20 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-200">
                        <span className="font-bold block mb-1">🏛️ YÖNETİM DEĞERLENDİRMESİ & KARARI:</span>
                        {item.managementResponse}
                        {item.approvedBudget && (
                          <div className="font-bold text-emerald-400 mt-1">Onaylanan Bütçe: {item.approvedBudget.toLocaleString('tr-TR')} ₺</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. FORM MODAL (YENİ EKLE / DÜZENLE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/85 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#0b0f19] border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-[#070a12] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  {type === 'MALZEME_TALEBI' ? <Package className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingId ? 'Talebi / Bilgilendirmeyi Düzenle' : 'Yeni Yönetim Kaydı Oluştur'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Site Yönetimi onayına sunulacak kayıt</p>
                </div>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingId)}
                    className="ml-3 flex items-center px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Sil
                  </button>
                )}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              <form id="mgmt-form" onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Tür Seçimi */}
                {!editingId && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setType('MALZEME_TALEBI')}
                      className={`p-3.5 rounded-xl border flex items-center space-x-3 transition-all ${
                        type === 'MALZEME_TALEBI'
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                          : 'bg-[#060810] border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Package className={`w-5 h-5 ${type === 'MALZEME_TALEBI' ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <div className="text-left">
                        <div className="text-xs font-bold">📦 Malzeme & Satın Alma</div>
                        <div className="text-[10px] text-slate-500">Yedek parça, kimyasal vb.</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setType('BILGILENDIRME')}
                      className={`p-3.5 rounded-xl border flex items-center space-x-3 transition-all ${
                        type === 'BILGILENDIRME'
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                          : 'bg-[#060810] border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <MessageSquare className={`w-5 h-5 ${type === 'BILGILENDIRME' ? 'text-blue-400' : 'text-slate-500'}`} />
                      <div className="text-left">
                        <div className="text-xs font-bold">📢 Teknik Bilgilendirme</div>
                        <div className="text-[10px] text-slate-500">Durum raporu, uyarı vb.</div>
                      </div>
                    </button>
                  </div>
                )}

                {/* 2. Başlık */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    {type === 'MALZEME_TALEBI' ? 'Malzeme / Talep Başlığı' : 'Bilgilendirme Konusu'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={type === 'MALZEME_TALEBI' ? 'Örn: Kazan dairesi eşanjör temizleme kimyasalı ve conta takımı' : 'Örn: Havuz filtrasyon motorunda ses artışı hakkında'}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#060810] border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* 3. Kategori, Aciliyet (Yalnızca MALZEME_TALEBI için) */}
                {type === 'MALZEME_TALEBI' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kategori</label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-[#060810] border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Aciliyet</label>
                      <select
                        value={urgency}
                        onChange={e => setUrgency(e.target.value as any)}
                        className="w-full px-3 py-2 bg-[#060810] border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Dusuk">Düşük</option>
                        <option value="Normal">Normal</option>
                        <option value="Acil">Acil</option>
                        <option value="Kritik">Kritik</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 4. Malzeme Kalemleri (Yalnızca MALZEME_TALEBI için) */}
                {type === 'MALZEME_TALEBI' && (
                  <div className="bg-[#060810] border border-slate-800/80 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <Package className="w-4 h-4" /> Talep Edilen Malzemeler & Miktarlar
                      </label>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
                      >
                        <Plus className="w-3.5 h-3.5" /> Kalem Ekle
                      </button>
                    </div>

                    <div className="space-y-2">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Malzeme Adı / Marka / Model"
                            value={item.name}
                            onChange={e => handleItemChange(idx, 'name', e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-[#0a0e1a] border border-slate-800 text-white rounded-lg text-xs"
                          />
                          <input
                            type="number"
                            placeholder="Miktar"
                            min={1}
                            value={item.quantity}
                            onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-20 px-2 py-1.5 bg-[#0a0e1a] border border-slate-800 text-white rounded-lg text-xs text-center"
                          />
                          <select
                            value={item.unit}
                            onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                            className="w-24 px-2 py-1.5 bg-[#0a0e1a] border border-slate-800 text-white rounded-lg text-xs"
                          >
                            <option value="Adet">Adet</option>
                            <option value="Kg">Kg</option>
                            <option value="Metre">Metre</option>
                            <option value="Litre">Litre</option>
                            <option value="Paket">Paket</option>
                            <option value="Koli">Koli</option>
                            <option value="Takım">Takım</option>
                          </select>
                          <input
                            type="number"
                            placeholder="Tahmini Fiyat (₺)"
                            value={item.estimatedPrice || ''}
                            onChange={e => handleItemChange(idx, 'estimatedPrice', e.target.value)}
                            className="w-28 px-2 py-1.5 bg-[#0a0e1a] border border-slate-800 text-white rounded-lg text-xs text-right"
                          />
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                      <input
                        type="text"
                        placeholder="Teklif alınan firma / tedarikçi (Opsiyonel)"
                        value={supplier}
                        onChange={e => setSupplier(e.target.value)}
                        className="w-64 px-2.5 py-1 bg-[#0a0e1a] border border-slate-800 text-white rounded-lg text-[11px]"
                      />
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="text-slate-400">Tahmini Toplam:</span>
                        <span className="text-indigo-400 text-sm">{calculatedTotal.toLocaleString('tr-TR')} ₺</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Açıklama / Gerekçe */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    {type === 'MALZEME_TALEBI' ? 'Detaylı Açıklama / Gerekçe / Teknik Not' : 'Bilgilendirme Notu / Açıklama'}
                  </label>
                  <textarea
                    rows={type === 'BILGILENDIRME' ? 6 : 3}
                    placeholder={
                      type === 'BILGILENDIRME' 
                        ? 'Yönetim kuruluna iletilecek teknik bilgilendirme notunu buraya yazın...'
                        : 'Talebin gerekçesini, mevcut durum tespitini veya önerilen teknik çözümü detaylandırın...'
                    }
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#060810] border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                  ></textarea>
                </div>

                {/* 6. Yönetim Karar & Onay Alanı (Yalnızca MALZEME_TALEBI için) */}
                {type === 'MALZEME_TALEBI' && (
                  <div className="bg-[#060810] border border-slate-800/80 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">🏛️ Yönetim Kararı & Durum Takibi</span>
                      <select
                        value={status}
                        onChange={e => setStatus(e.target.value as any)}
                        className="px-3 py-1 bg-[#0a0e1a] border border-slate-700 text-white rounded-lg text-xs font-bold"
                      >
                        <option value="Beklemede">⏳ Beklemede</option>
                        <option value="Incelemede">🔍 İnceleniyor</option>
                        <option value="Onaylandi">✅ Onaylandı</option>
                        <option value="Reddedildi">❌ Reddedildi</option>
                        <option value="Tamamlandi">🎉 Tamamlandı / Temin Edildi</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Yönetim Notu / Açıklaması</label>
                        <input
                          type="text"
                          placeholder="Örn: 2 nolu teklif uygun bulundu, sipariş verilebilir."
                          value={managementResponse}
                          onChange={e => setManagementResponse(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#0a0e1a] border border-slate-800 text-white rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Onaylanan Bütçe (₺)</label>
                        <input
                          type="number"
                          placeholder="Örn: 4500"
                          value={approvedBudget}
                          onChange={e => setApprovedBudget(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#0a0e1a] border border-slate-800 text-white rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-[#070a12] flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-transparent border border-slate-600/50 text-slate-400 hover:bg-slate-800/30 hover:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                form="mgmt-form"
                type="submit"
                className="flex items-center px-6 py-2 bg-indigo-900/20 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-900/40 text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                {editingId ? 'Güncelle' : 'Kaydet ve İlet'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. RESMİ YÖNETİM TALEP / BİLGİLENDİRME FORMU (A4 PDF & YAZDIRMA) */}
      {printItem && (() => {
        let printItemsList: MaterialItem[] = [];
        try {
          printItemsList = JSON.parse(printItem.itemsJson || '[]');
        } catch {}

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/85 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPrintItem(null)}>
            <style>{`
              @page { margin: 10mm 8mm; size: A4 portrait; }
              @media print {
                body * { visibility: hidden; }
                #print-doc, #print-doc * { visibility: visible; }
                #print-doc {
                  position: fixed;
                  left: 0; top: 0;
                  width: 100%;
                  background: white !important;
                  color: black !important;
                  padding: 0 !important;
                }
                .print-hide { display: none !important; }
              }
            `}</style>

            <div className="bg-white border border-slate-300 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative text-slate-800" onClick={e => e.stopPropagation()}>
              
              {/* Modal Header (Hidden on print) */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print-hide shrink-0">
                <h3 className="text-base font-bold text-slate-800 flex items-center">
                  <Printer className="w-4 h-4 mr-2 text-indigo-600" /> Resmi Yönetim Formu Önizleme
                </h3>
                <div className="flex items-center space-x-2">
                  <button onClick={() => window.print()} className="px-5 py-2 bg-indigo-900/10 hover:bg-indigo-900/25 border border-indigo-500/40 text-indigo-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5" /> PDF Kaydet / Yazdır
                  </button>
                  <button onClick={() => setPrintItem(null)} className="p-2 bg-transparent border border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-900 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Content Area */}
              <div id="print-doc" className="flex-1 overflow-y-auto bg-white p-8">
                <div style={{ maxWidth: '720px', margin: '0 auto', fontFamily: 'Segoe UI, sans-serif' }}>
                  
                  {/* Antet Header */}
                  <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3 mb-4">
                    <div>
                      <h1 className="text-xl font-black text-slate-900 tracking-tight">TERRACEFERİ KONUTLARI</h1>
                      <h2 className="text-[11px] font-bold text-slate-600 mt-0.5">TerraceFeri Site Yöneticiliği & Teknik Birimi</h2>
                      <h3 className="text-[10px] text-slate-400">Teknik Operasyon & Yönetim İletişim Formu</h3>
                    </div>
                    <div className="text-right">
                      <div className="inline-block bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded text-[10px] font-bold mb-1 border border-slate-300">
                        FORM NO: TF-YNT-{printItem.id.slice(0, 6).toUpperCase()}
                      </div>
                      <div className="text-[10px] text-slate-600">Tarih: <b>{new Date(printItem.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</b></div>
                      <div className="text-[10px] text-slate-500">Talep Türü: <b className="text-indigo-600">{printItem.type === 'MALZEME_TALEBI' ? 'Malzeme & Satın Alma Talebi' : 'Teknik Bilgilendirme'}</b></div>
                    </div>
                  </div>

                  {/* Title Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-center mb-5">
                    <h2 className="text-base font-black text-slate-900 uppercase">{printItem.title}</h2>
                  </div>

                  {/* Description Box */}
                  {printItem.description && (
                    <div className="mb-5">
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">1. Gerekçe ve Teknik Açıklama:</div>
                      <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                        {printItem.description}
                      </div>
                    </div>
                  )}

                  {/* Materials Table if MALZEME_TALEBI */}
                  {printItem.type === 'MALZEME_TALEBI' && printItemsList.length > 0 && (
                    <div className="mb-5">
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">2. Talep Edilen Malzemeler & Yaklaşık Maliyet:</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #cbd5e1' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#334155' }}>
                            <th style={{ padding: '6px', textAlign: 'center', width: '30px' }}>#</th>
                            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Malzeme / Hizmet Tanımı</th>
                            <th style={{ padding: '6px', textAlign: 'center', width: '80px' }}>Miktar</th>
                            <th style={{ padding: '6px', textAlign: 'right', width: '100px' }}>Birim Fiyat</th>
                            <th style={{ padding: '6px 10px', textAlign: 'right', width: '110px' }}>Toplam Tutar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {printItemsList.map((m, idx) => {
                            const lineTotal = (m.quantity || 1) * (m.estimatedPrice || 0);
                            return (
                              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                                <td style={{ padding: '6px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                                <td style={{ padding: '6px 10px', fontWeight: 'bold', color: '#0f172a' }}>{m.name}</td>
                                <td style={{ padding: '6px', textAlign: 'center' }}>{m.quantity} {m.unit}</td>
                                <td style={{ padding: '6px', textAlign: 'right', color: '#64748b' }}>{m.estimatedPrice ? m.estimatedPrice.toLocaleString('tr-TR') + ' ₺' : '-'}</td>
                                <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>{lineTotal ? lineTotal.toLocaleString('tr-TR') + ' ₺' : '-'}</td>
                              </tr>
                            );
                          })}
                          <tr style={{ background: '#f8fafc', borderTop: '2px solid #cbd5e1' }}>
                            <td colSpan={4} style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 'bold' }}>TAHMİNİ TOPLAM BÜTÇE:</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '900', fontSize: '12px', color: '#1e40af' }}>
                              {printItem.estimatedCost?.toLocaleString('tr-TR') || 0} ₺
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      {printItem.supplier && (
                        <div className="text-[10px] text-slate-500 mt-1 italic">
                          Önerilen / Teklif Alınan Firma: <b>{printItem.supplier}</b>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Management Response Box (Sadece Malzeme & Satın Alma Taleplerinde Gösterilir) */}
                  {printItem.type === 'MALZEME_TALEBI' && (
                    <div className="mb-8 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">3. Yönetim Kurulu / Site Müdürü Değerlendirmesi:</div>
                      <div className="text-xs text-slate-700 min-h-[30px]">
                        {printItem.managementResponse || '................................................................................................................................................................................................................'}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200">
                        <div>Karar / Durum: <b>{printItem.status.toUpperCase()}</b></div>
                        <div>Onaylanan Bütçe: <b>{printItem.approvedBudget ? printItem.approvedBudget.toLocaleString('tr-TR') + ' ₺' : '...................... ₺'}</b></div>
                      </div>
                    </div>
                  )}

                  {/* Signatures */}
                  <div className="flex justify-between items-start mt-8 pt-4">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">
                        {printItem.type === 'MALZEME_TALEBI' ? 'Talep Eden (Teknik Sorumlu)' : 'Bilgilendiren (Teknik Sorumlu)'}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">Serdar DOĞRUER</div>
                      <div className="mt-8 border-b border-slate-400 w-44"></div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-800 text-xs">
                        {printItem.type === 'MALZEME_TALEBI' ? 'Onaylayan (Site Müdürü)' : 'Bilgilendirilen (Site Müdürü)'}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">Saliha ERCAN</div>
                      <div className="mt-8 border-b border-slate-400 w-44 ml-auto"></div>
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
