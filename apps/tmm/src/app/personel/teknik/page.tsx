'use client';

import React, { useState } from 'react';
import { 
  Wrench, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  X, 
  Package, 
  Check, 
  Cpu, 
  FileText 
} from 'lucide-react';
import { MobileHeader } from '@/components/mobile/MobileHeader';

interface WorkOrder {
  id: string;
  faultCode: string;
  equipment: string;
  location: string;
  issue: string;
  priority: 'ACİL' | 'YÜKSEK' | 'NORMAL';
  status: 'AÇIK' | 'MÜDAHALE EDİLİYOR' | 'TAMAMLANDI';
  assignedTech: string;
  usedMaterials: string[];
}

export default function PersonelTeknikPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'meters' | 'materials'>('orders');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: 'WO-801',
      faultCode: 'FLT-092',
      equipment: 'Hidrofor Pompası 2',
      location: 'A Blok Kazan Dairesi (-3. Kat)',
      issue: 'Basınç regülatörü aşırı ısınıyor ve ses yapıyor.',
      priority: 'ACİL',
      status: 'MÜDAHALE EDİLİYOR',
      assignedTech: 'Hasan Usta',
      usedMaterials: ['Basınç Contası 2"', 'Rulman 6204']
    },
    {
      id: 'WO-802',
      faultCode: 'FLT-095',
      equipment: 'Aydınlatma Panosu 4',
      location: 'B Blok 4. Kat Koridor',
      issue: 'Sigorta atması sebebiyle kat holü karanlık.',
      priority: 'NORMAL',
      status: 'AÇIK',
      assignedTech: 'Hasan Usta',
      usedMaterials: []
    }
  ]);

  // Sayaç Hızlı Okuma
  const [meters, setMeters] = useState([
    { id: 'MTR-01', name: 'Ana Elektrik Sayacı', type: 'ELEKTRİK', lastRead: '14,820 kWh', status: 'Okundu' },
    { id: 'MTR-02', name: 'Kuyu & Bahçe Su Sayacı', type: 'SU', lastRead: '3,450 m³', status: 'Okundu' },
    { id: 'MTR-03', name: 'Kazan Dairesi Doğalgaz', type: 'DOĞALGAZ', lastRead: '8,910 Sm³', status: 'Bekliyor' }
  ]);

  const [newMaterialName, setNewMaterialName] = useState('');
  const [selectedWO, setSelectedWO] = useState<string | null>(null);

  const updateWOStatus = (id: string, newStatus: WorkOrder['status']) => {
    setWorkOrders(workOrders.map(wo => wo.id === id ? { ...wo, status: newStatus } : wo));
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWO || !newMaterialName.trim()) return;

    setWorkOrders(workOrders.map(wo => {
      if (wo.id === selectedWO) {
        return { ...wo, usedMaterials: [...wo.usedMaterials, newMaterialName] };
      }
      return wo;
    }));

    setIsModalOpen(false);
    setNewMaterialName('');
  };

  return (
    <div className="space-y-4">
      <MobileHeader
        title="Teknik Saha (TMM)"
        subtitle="Arıza iş emirleri, sayaçlar ve sarf malzeme"
        showBack={true}
        backUrl="/personel"
        type="personel"
      />

      {/* Sekmeler (Kural 5) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={activeTab === 'orders'
            ? "flex-1 py-2 bg-[#070A11] border border-indigo-500/50 text-indigo-300 rounded-lg text-xs font-bold shadow-sm text-center"
            : "flex-1 py-2 bg-transparent border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 rounded-lg text-xs font-semibold text-center"}
        >
          İş Emirleri ({workOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('meters')}
          className={activeTab === 'meters'
            ? "flex-1 py-2 bg-[#070A11] border border-indigo-500/50 text-indigo-300 rounded-lg text-xs font-bold shadow-sm text-center"
            : "flex-1 py-2 bg-transparent border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 rounded-lg text-xs font-semibold text-center"}
        >
          Sayaç Okuma ({meters.length})
        </button>
      </div>

      {activeTab === 'orders' ? (
        <div className="space-y-3">
          {workOrders.map((wo) => (
            <div
              key={wo.id}
              className="p-3.5 bg-[#070A11] border border-[#151B2B] rounded-xl space-y-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" /> {wo.equipment}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  wo.status === 'TAMAMLANDI'
                    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                    : wo.status === 'MÜDAHALE EDİLİYOR'
                    ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    : 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10'
                }`}>
                  {wo.status}
                </span>
              </div>

              {/* Data Box Veri Kutucukları (Kural 4) */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">İŞ EMRİ</span>
                  <span className="text-xs font-bold text-slate-200">{wo.id}</span>
                </div>
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">TMM KOD</span>
                  <span className="text-xs font-bold text-indigo-300">{wo.faultCode}</span>
                </div>
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">ÖNCELİK</span>
                  <span className={`text-xs font-bold ${
                    wo.priority === 'ACİL' ? 'text-rose-400' : 'text-slate-300'
                  }`}>{wo.priority}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">{wo.location}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{wo.issue}</p>
              </div>

              {/* Kullanılan Malzemeler */}
              {wo.usedMaterials.length > 0 && (
                <div className="p-2 bg-[#060B14] rounded-lg border border-slate-800/80">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                    Kullanılan Sarf Malzeme:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {wo.usedMaterials.map((mat, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 rounded">
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Aksiyon Satırı (Kural 4 & 3) */}
              <div className="flex items-center justify-between pt-2 border-t border-[#151B2B]/80">
                <button
                  onClick={() => { setSelectedWO(wo.id); setIsModalOpen(true); }}
                  className="px-3 py-1.5 bg-indigo-900/10 hover:bg-indigo-900/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5" /> Malzeme Ekle
                </button>

                <div className="flex items-center gap-2">
                  {wo.status !== 'TAMAMLANDI' ? (
                    <button
                      onClick={() => updateWOStatus(wo.id, 'TAMAMLANDI')}
                      className="px-3 py-1.5 bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-500/50 text-emerald-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> İşi Kapat
                    </button>
                  ) : (
                    <button
                      onClick={() => updateWOStatus(wo.id, 'MÜDAHALE EDİLİYOR')}
                      className="px-3 py-1.5 bg-transparent border border-slate-700 text-slate-400 text-xs font-semibold rounded-lg"
                    >
                      Geri Al
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Sayaç Okuma Listesi */
        <div className="space-y-3">
          {meters.map((m) => (
            <div
              key={m.id}
              className="p-3.5 bg-[#070A11] border border-[#151B2B] rounded-xl flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{m.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                    <span className="text-indigo-300 font-semibold">{m.lastRead}</span>
                    <span>•</span>
                    <span className="text-slate-500">{m.type}</span>
                  </div>
                </div>
              </div>

              <button
                className="w-10 h-10 bg-[#060B14] border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/30 rounded-lg flex items-center justify-center transition-colors shrink-0"
                title="Yeni Değer Gir"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pop-up (Modal) Standardı (Kural 2 & 3) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#070A11] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewMaterialName('')}
                  className="flex items-center px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Temizle
                </button>
                <h3 className="text-sm font-bold text-white">Sarf Malzeme Harcama Kaydı</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMaterial} className="space-y-3.5">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Kullanılan Malzeme Adı & Miktarı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 2 Adet Philips 18W Led Spot veya 5m NYM Kablo"
                  value={newMaterialName}
                  onChange={(e) => setNewMaterialName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              {/* Modal Footer: Sağ Alt İptal ve Kaydet (Kural 2 & 3) */}
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
                  Malzemeyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
