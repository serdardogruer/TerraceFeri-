'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  Trash2, 
  X, 
  Camera, 
  Image as ImageIcon, 
  FileText, 
  AlertCircle,
  Wrench,
  Sparkles,
  Shield,
  HelpCircle,
  Eye,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { MobileHeader } from '@/components/mobile/MobileHeader';

interface RequestItem {
  id: string;
  date: string;
  category: 'TEKNİK' | 'TEMİZLİK' | 'GÜVENLİK' | 'DİĞER';
  title: string;
  description: string;
  location: string;
  status: 'İNCELENİYOR' | 'PERSONELE ATANDI' | 'TAMAMLANDI';
  priority: 'DÜŞÜK' | 'NORMAL' | 'ACİL';
  photoCount?: number;
}

export default function SakinTaleplerPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: 'TEKNİK',
    title: '',
    description: '',
    location: 'A Blok - Daire 42',
    priority: 'NORMAL'
  });

  const [requests, setRequests] = useState<RequestItem[]>([
    {
      id: 'REQ-104',
      date: '20.08.2026',
      category: 'TEKNİK',
      title: 'Kat holü aydınlatma arızası',
      description: '4. kat asansör karşısındaki spot lamba titriyor ve sönüyor.',
      location: 'A Blok 4. Kat Koridor',
      status: 'PERSONELE ATANDI',
      priority: 'NORMAL',
      photoCount: 1
    },
    {
      id: 'REQ-101',
      date: '19.08.2026',
      category: 'TEMİZLİK',
      title: 'Yangın merdiveni temizlik ihtiyacı',
      description: '3. ve 4. kat arasındaki yangın merdiveninde toz birikimi var.',
      location: 'A Blok Yangın Merdiveni',
      status: 'İNCELENİYOR',
      priority: 'DÜŞÜK',
      photoCount: 0
    },
    {
      id: 'REQ-098',
      date: '18.08.2026',
      category: 'TEMİZLİK',
      title: 'B Blok -1 Asansör önü paspas değişimi',
      description: 'Paspas yıpranmış ve kirlenmiş durumdaydı.',
      location: 'B Blok -1 Otopark Girişi',
      status: 'TAMAMLANDI',
      priority: 'NORMAL',
      photoCount: 2
    }
  ]);

  // Aktif Sakin Bilgisi
  const [currentResident, setCurrentResident] = useState({
    code: 'SAK-42',
    name: 'Ahmet Yılmaz',
    doorNo: 'A-42',
    block: 'A Blok',
    apartmentNo: '42'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tf_active_resident');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCurrentResident(parsed);
          setFormData(prev => ({
            ...prev,
            location: `${parsed.block || 'A Blok'} - Daire ${parsed.apartmentNo || '42'}`
          }));
        } catch (e) {}
      }
    }
  }, []);

  useEffect(() => {
    fetch('/api/management-requests?type=SAKIN_TALEBI')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const apiRequests: RequestItem[] = data.data.map((item: any) => ({
            id: item.id,
            date: new Date(item.createdAt).toLocaleDateString('tr-TR'),
            category: (item.category?.toUpperCase() || 'TEKNİK') as any,
            title: item.title,
            description: item.description || '',
            location: item.location || 'A Blok - Daire 42',
            status: item.status === 'Tamamlandi' ? 'TAMAMLANDI' : item.status === 'Incelemede' ? 'PERSONELE ATANDI' : 'İNCELENİYOR',
            priority: item.urgency === 'Acil' || item.urgency === 'Kritik' ? 'ACİL' : item.urgency === 'Dusuk' ? 'DÜŞÜK' : 'NORMAL',
            photoCount: 0
          }));
          
          setRequests(prev => {
            const apiMap = new Map();
            apiRequests.forEach(r => apiMap.set(r.id, r));
            prev.forEach(r => {
              if (!apiMap.has(r.id)) apiMap.set(r.id, r);
            });
            return Array.from(apiMap.values());
          });
        }
      })
      .catch(() => {});
  }, []);

  const filteredRequests = requests.filter(req => {
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'open' ? req.status !== 'TAMAMLANDI' :
      req.status === 'TAMAMLANDI';
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newReq: RequestItem = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toLocaleDateString('tr-TR'),
      category: formData.category as any,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      status: 'İNCELENİYOR',
      priority: formData.priority as any,
      photoCount: 0
    };

    setRequests([newReq, ...requests]);
    setIsModalOpen(false);

    // Arka planda veritabanına kaydet
    try {
      await fetch('/api/management-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SAKIN_TALEBI',
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          urgency: formData.priority === 'ACİL' ? 'Acil' : 'Normal',
          status: 'Beklemede',
          requesterName: 'A Blok Daire 42 (Sakin)'
        })
      });
    } catch {}

    setFormData({
      category: 'TEKNİK',
      title: '',
      description: '',
      location: 'A Blok - Daire 42',
      priority: 'NORMAL'
    });
  };

  return (
    <div className="space-y-4">
      <MobileHeader
        title="Taleplerim & Arızalar"
        subtitle="Arıza ve servis bildirimleri"
        showBack={true}
        backUrl="/sakin"
        type="sakin"
      />

      {/* Üst Aksiyon & Arama */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center px-5 py-2.5 bg-indigo-900/20 hover:bg-indigo-900/40 border border-indigo-500/40 text-indigo-300 text-xs font-bold rounded-lg transition-colors shadow-sm gap-2"
        >
          <Plus className="w-4 h-4" /> Yeni Arıza / Talep Oluştur
        </button>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Taleplerde ara (başlık, konum, kod)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#070A11] border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60"
          />
        </div>
      </div>

      {/* Filtre ve Sekme (Tab) Butonları Standardı (Kural 5) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={activeTab === 'all' 
            ? "px-4 py-2 bg-[#070A11] border border-indigo-500/50 text-indigo-300 rounded-lg text-xs font-bold shadow-sm whitespace-nowrap"
            : "px-4 py-2 bg-transparent border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap"}
        >
          Tüm Talepler ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('open')}
          className={activeTab === 'open' 
            ? "px-4 py-2 bg-[#070A11] border border-indigo-500/50 text-indigo-300 rounded-lg text-xs font-bold shadow-sm whitespace-nowrap"
            : "px-4 py-2 bg-transparent border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap"}
        >
          Devam Edenler ({requests.filter(r => r.status !== 'TAMAMLANDI').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={activeTab === 'completed' 
            ? "px-4 py-2 bg-[#070A11] border border-indigo-500/50 text-indigo-300 rounded-lg text-xs font-bold shadow-sm whitespace-nowrap"
            : "px-4 py-2 bg-transparent border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap"}
        >
          Tamamlananlar ({requests.filter(r => r.status === 'TAMAMLANDI').length})
        </button>
      </div>

      {/* Tablo ve Liste Satır Kartı Tasarım Standardı (Data Box Mimarisi - Kural 4) */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center bg-[#070A11] border border-[#151B2B] rounded-xl text-slate-400 text-xs">
            Arama kriterine uygun talep bulunamadı.
          </div>
        ) : (
          filteredRequests.map((item) => (
            <div 
              key={item.id}
              className="p-3.5 bg-[#070A11] border border-[#151B2B] rounded-xl space-y-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-500" /> {item.date}
                  <span className="text-slate-600">•</span>
                  <span className="text-indigo-400 font-semibold">{item.location}</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  item.status === 'TAMAMLANDI'
                    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                    : item.status === 'PERSONELE ATANDI'
                    ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10'
                    : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                }`}>
                  {item.status}
                </span>
              </div>

              {/* Data Box Veri Kutucukları (Kural 4) */}
              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">KOD</span>
                  <span className="text-xs font-bold text-slate-200">{item.id}</span>
                </div>
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">TÜR</span>
                  <span className="text-xs font-bold text-indigo-300">{item.category}</span>
                </div>
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">ÖNCELİK</span>
                  <span className={`text-[10px] font-bold ${
                    item.priority === 'ACİL' ? 'text-rose-400' : 'text-slate-300'
                  }`}>{item.priority}</span>
                </div>
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">MEDYA</span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-slate-500" /> {item.photoCount || 0}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">{item.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
              </div>

              {/* Aksiyon Satırı (w-10 h-10 standart Kural 4) */}
              <div className="flex items-center justify-between pt-2 border-t border-[#151B2B]/60">
                <span className="text-[10px] text-slate-500">TMM Otomatik Entegrasyon Aktif</span>
                <div className="flex items-center gap-2">
                  <button 
                    title="Detay Görüntüle"
                    className="w-10 h-10 bg-[#070A11] border border-slate-800 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    title="Talebi İptal Et / Sil"
                    onClick={() => setRequests(requests.filter(r => r.id !== item.id))}
                    className="w-10 h-10 bg-[#070A11] border border-red-900/50 text-red-500 hover:bg-red-900/20 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pop-up (Modal) Ekranı Standardı (Kural 2 & 3) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#070A11] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header: Sol Üst Sil Butonu & Başlık (Kural 2 & 3) */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ category: 'TEKNİK', title: '', description: '', location: 'A Blok - Daire 42', priority: 'NORMAL' })}
                  title="Formu Sıfırla"
                  className="flex items-center px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Temizle
                </button>
                <h3 className="text-sm font-bold text-white">Yeni Arıza / Talep Bildirimi</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Alanları */}
            <form onSubmit={handleCreateRequest} className="space-y-3.5">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Kategori Seçimi
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['TEKNİK', 'TEMİZLİK', 'GÜVENLİK', 'DİĞER'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`py-2 px-1 text-center text-[10px] font-bold rounded-lg border transition-all ${
                        formData.category === cat
                          ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300'
                          : 'bg-[#060B14] border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Konu / Arıza Başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Koridor spot lamba arızası"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Konum Bilgisi
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Açıklama ve Detaylar
                </label>
                <textarea
                  rows={3}
                  placeholder="Arıza veya talep hakkında teknik ekibe yardımcı olacak detayları yazınız..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Fotoğraf / Ek Dosya
                </label>
                <div className="border border-dashed border-slate-800 hover:border-slate-700 bg-[#060B14] rounded-lg p-3 text-center cursor-pointer">
                  <Camera className="w-5 h-5 mx-auto text-indigo-400 mb-1" />
                  <span className="text-[11px] text-slate-400">Fotoğraf Çek veya Galeriden Seç</span>
                </div>
              </div>

              {/* Modal Footer: Sağ Alt İptal ve Kaydet Butonları (Kural 2 & 3) */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 bg-transparent border border-slate-600/50 text-slate-400 hover:bg-slate-800/30 hover:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex items-center px-6 py-2 bg-indigo-900/20 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-900/40 text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  Kaydet / Talebi Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
