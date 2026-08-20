'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  FileText, 
  Download, 
  Calendar, 
  ShieldCheck, 
  Search, 
  ChevronRight, 
  AlertCircle, 
  ExternalLink 
} from 'lucide-react';
import { MobileHeader } from '@/components/mobile/MobileHeader';

export default function SakinDuyurularPage() {
  const [activeTab, setActiveTab] = useState<'announcements' | 'documents'>('announcements');
  const [searchTerm, setSearchTerm] = useState('');

  const announcements = [
    {
      id: 'DUY-01',
      date: '19.08.2026',
      title: 'Periyodik Havuz Bakımı ve İlaçlama',
      category: 'TESİS',
      summary: '21 Ağustos Cuma günü saat 09:00 - 15:00 arasında açık yüzme havuzunda periyodik klorlama ve filtre temizliği yapılacaktır.',
      isImportant: true
    },
    {
      id: 'DUY-02',
      date: '17.08.2026',
      title: 'Açık Otopark Çizgi Yenileme Çalışması',
      category: 'GENEL',
      summary: 'Site otoparkındaki park çizgileri hafta sonu yenilenecektir. Araç sahiplerinin işaretli alanlara dikkat etmesi rica olunur.',
      isImportant: false
    },
    {
      id: 'DUY-03',
      date: '10.08.2026',
      title: '2026 Yılı Olağan Kat Malikleri Toplantı Özeti',
      category: 'YÖNETİM',
      summary: 'Gerçekleştirilen genel kurul kararları ve onaylanan bütçe raporu belgeler sekmesine yüklenmiştir.',
      isImportant: false
    }
  ];

  const documents = [
    {
      id: 'DOC-01',
      date: '10.08.2026',
      title: '2026 Genel Kurul Toplantı Tutanağı.pdf',
      category: 'YÖNETİM',
      size: '2.4 MB',
      type: 'PDF'
    },
    {
      id: 'DOC-02',
      date: '01.06.2026',
      title: 'Site Yaşam ve Ortak Alan Kullanım Kuralları.pdf',
      category: 'REHBER',
      size: '1.1 MB',
      type: 'PDF'
    },
    {
      id: 'DOC-03',
      date: '15.01.2026',
      title: 'Acil Durum ve Tahliye Planı.pdf',
      category: 'GÜVENLİK',
      size: '3.8 MB',
      type: 'PDF'
    }
  ];

  return (
    <div className="space-y-4">
      <MobileHeader
        title="Duyurular & Belgeler"
        subtitle="Yönetim bilgilendirmeleri ve resmi dökümanlar"
        showBack={true}
        backUrl="/sakin"
        type="sakin"
      />

      {/* Sekmeler (Kural 5) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('announcements')}
          className={activeTab === 'announcements'
            ? "flex-1 py-2 bg-[#070A11] border border-indigo-500/50 text-indigo-300 rounded-lg text-xs font-bold shadow-sm text-center"
            : "flex-1 py-2 bg-transparent border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 rounded-lg text-xs font-semibold text-center"}
        >
          Duyurular ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={activeTab === 'documents'
            ? "flex-1 py-2 bg-[#070A11] border border-indigo-500/50 text-indigo-300 rounded-lg text-xs font-bold shadow-sm text-center"
            : "flex-1 py-2 bg-transparent border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 rounded-lg text-xs font-semibold text-center"}
        >
          Site Belgeleri ({documents.length})
        </button>
      </div>

      {/* Arama */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
        <input
          type="text"
          placeholder="Başlık veya içerikte ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-[#070A11] border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60"
        />
      </div>

      {/* İçerik Listesi */}
      {activeTab === 'announcements' ? (
        <div className="space-y-3">
          {announcements.map((item) => (
            <div 
              key={item.id}
              className="p-3.5 bg-[#070A11] border border-[#151B2B] rounded-xl space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-500" /> {item.date}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  item.isImportant 
                    ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    : 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10'
                }`}>
                  {item.category}
                </span>
              </div>

              <h4 className="text-xs font-bold text-white">{item.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.summary}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div 
              key={doc.id}
              className="p-3.5 bg-[#070A11] border border-[#151B2B] rounded-xl flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{doc.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                    <span>{doc.date}</span>
                    <span>•</span>
                    <span className="text-indigo-400 font-semibold">{doc.size}</span>
                  </div>
                </div>
              </div>

              {/* Standart w-10 h-10 aksiyon butonu (Kural 4) */}
              <button 
                title="İndir"
                className="w-10 h-10 bg-[#060B14] border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/30 rounded-lg flex items-center justify-center transition-colors shrink-0"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
