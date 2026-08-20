'use client';

import React, { useState } from 'react';
import { 
  Trees, 
  Droplet, 
  Inbox, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  X, 
  Clock, 
  Calendar, 
  Activity, 
  Check 
} from 'lucide-react';
import { MobileHeader } from '@/components/mobile/MobileHeader';

interface PoolLog {
  id: string;
  time: string;
  chlorine: string;
  ph: string;
  temp: string;
  operator: string;
  status: 'UYGUN' | 'DÜZELTME GEREKİYOR';
}

interface GardenTask {
  id: string;
  title: string;
  location: string;
  type: 'SULAMA' | 'BUDAMA' | 'İLAÇLAMA' | 'ÇİM BİÇME';
  isDone: boolean;
}

export default function PersonelDigerPage() {
  const [activeTab, setActiveTab] = useState<'pool' | 'garden' | 'packages'>('pool');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [poolLogs, setPoolLogs] = useState<PoolLog[]>([
    {
      id: 'POL-101',
      time: '08:00',
      chlorine: '1.5 ppm',
      ph: '7.4',
      temp: '26°C',
      operator: 'Ahmet Yılmaz',
      status: 'UYGUN'
    },
    {
      id: 'POL-100',
      time: '18:00 (Dün)',
      chlorine: '1.2 ppm',
      ph: '7.6',
      temp: '27°C',
      operator: 'Ahmet Yılmaz',
      status: 'UYGUN'
    }
  ]);

  const [gardenTasks, setGardenTasks] = useState<GardenTask[]>([
    {
      id: 'GDN-01',
      title: 'Ön bahçe ve süs bitkileri otomatik damlama kontrolü',
      location: 'A Blok Ön Bahçe',
      type: 'SULAMA',
      isDone: true
    },
    {
      id: 'GDN-02',
      title: 'Çocuk oyun parkı çevresi çim biçme ve budama',
      location: 'Sosyal Alan Park',
      type: 'ÇİM BİÇME',
      isDone: false
    }
  ]);

  const [newChlorine, setNewChlorine] = useState('1.5');
  const [newPh, setNewPh] = useState('7.4');
  const [newTemp, setNewTemp] = useState('26');

  const handleCreatePoolLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: PoolLog = {
      id: `POL-${Math.floor(100 + Math.random() * 900)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chlorine: `${newChlorine} ppm`,
      ph: newPh,
      temp: `${newTemp}°C`,
      operator: 'Ahmet Yılmaz',
      status: 'UYGUN'
    };

    setPoolLogs([newLog, ...poolLogs]);
    setIsModalOpen(false);
  };

  const toggleGardenTask = (id: string) => {
    setGardenTasks(gardenTasks.map(g => g.id === id ? { ...g, isDone: !g.isDone } : g));
  };

  return (
    <div className="space-y-4">
      <MobileHeader
        title="Bahçe / Havuz / Tesis"
        subtitle="Havuz kimyasal ölçümleri ve yeşil alan operasyonları"
        showBack={true}
        backUrl="/personel"
        type="personel"
      />

      {/* Havuz Ölçümü Girişi Butonu (Kural 3) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center px-5 py-2.5 bg-amber-900/20 hover:bg-amber-900/40 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-lg transition-colors shadow-sm gap-2"
      >
        <Plus className="w-4 h-4" /> Yeni Havuz Ölçüm Kaydı Gir
      </button>

      {/* Sekmeler (Kural 5) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('pool')}
          className={activeTab === 'pool'
            ? "flex-1 py-2 bg-[#070A11] border border-amber-500/50 text-amber-300 rounded-lg text-xs font-bold shadow-sm text-center"
            : "flex-1 py-2 bg-transparent border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 rounded-lg text-xs font-semibold text-center"}
        >
          Havuz ({poolLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('garden')}
          className={activeTab === 'garden'
            ? "flex-1 py-2 bg-[#070A11] border border-amber-500/50 text-amber-300 rounded-lg text-xs font-bold shadow-sm text-center"
            : "flex-1 py-2 bg-transparent border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 rounded-lg text-xs font-semibold text-center"}
        >
          Bahçe / Peyzaj ({gardenTasks.length})
        </button>
      </div>

      {activeTab === 'pool' ? (
        <div className="space-y-3">
          {poolLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 bg-[#070A11] border border-[#151B2B] rounded-xl space-y-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> {log.time}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                  {log.status}
                </span>
              </div>

              {/* Data Box Veri Kutucukları (Kural 4) */}
              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">KOD</span>
                  <span className="text-xs font-bold text-slate-200">{log.id}</span>
                </div>
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">KLOR</span>
                  <span className="text-xs font-bold text-blue-300">{log.chlorine}</span>
                </div>
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">PH</span>
                  <span className="text-xs font-bold text-emerald-300">{log.ph}</span>
                </div>
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">SICAKLIK</span>
                  <span className="text-xs font-bold text-amber-300">{log.temp}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500">Ölçüm Yapan: {log.operator}</span>
                <button
                  onClick={() => setPoolLogs(poolLogs.filter(p => p.id !== log.id))}
                  className="w-10 h-10 bg-[#060B14] border border-red-900/50 text-red-500 hover:bg-red-900/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {gardenTasks.map((task) => (
            <div
              key={task.id}
              className="p-3.5 bg-[#070A11] border border-[#151B2B] rounded-xl space-y-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{task.location}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  task.isDone ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                }`}>
                  {task.isDone ? 'TAMAMLANDI' : 'BEKLİYOR'}
                </span>
              </div>

              {/* Data Box Veri Kutucukları (Kural 4) */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">KOD</span>
                  <span className="text-xs font-bold text-slate-200">{task.id}</span>
                </div>
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">İŞLEM TÜRÜ</span>
                  <span className="text-xs font-bold text-amber-300">{task.type}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300">{task.title}</p>

              <div className="flex items-center justify-end pt-1">
                <button
                  onClick={() => toggleGardenTask(task.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1.5 ${
                    task.isDone
                      ? 'bg-transparent border-slate-700 text-slate-400'
                      : 'bg-emerald-900/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  {task.isDone ? 'Geri Al' : 'Tamamla'}
                </button>
              </div>
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
                  onClick={() => { setNewChlorine('1.5'); setNewPh('7.4'); }}
                  className="flex items-center px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Sıfırla
                </button>
                <h3 className="text-sm font-bold text-white">Havuz Kimyasal Ölçümü Kaydı</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePoolLog} className="space-y-3.5">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Serbest Klor (ppm - Hedef: 1.0 - 2.0)
                </label>
                <input
                  type="text"
                  required
                  value={newChlorine}
                  onChange={(e) => setNewChlorine(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  pH Değeri (Hedef: 7.2 - 7.6)
                </label>
                <input
                  type="text"
                  required
                  value={newPh}
                  onChange={(e) => setNewPh(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Su Sıcaklığı (°C)
                </label>
                <input
                  type="text"
                  required
                  value={newTemp}
                  onChange={(e) => setNewTemp(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/60"
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
                  className="flex items-center px-6 py-2 bg-amber-900/20 border border-amber-500/50 text-amber-300 hover:bg-amber-900/40 text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  Ölçümü Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
