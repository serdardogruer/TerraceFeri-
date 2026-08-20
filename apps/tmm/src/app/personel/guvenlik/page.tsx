'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  X, 
  Clock, 
  MapPin, 
  Car, 
  UserCheck, 
  FileWarning 
} from 'lucide-react';
import { MobileHeader } from '@/components/mobile/MobileHeader';

interface Incident {
  id: string;
  time: string;
  type: 'ŞÜPHELİ ARAÇ' | 'KAPI AÇIK' | 'GÜRÜLTÜ' | 'DİĞER';
  location: string;
  description: string;
  reportedBy: string;
}

export default function PersonelGuvenlikPage() {
  const [activeTab, setActiveTab] = useState<'patrol' | 'incidents' | 'visitors'>('patrol');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Devriye Noktaları
  const [patrolPoints, setPatrolPoints] = useState([
    { id: 1, name: 'Ana Giriş Nizamiyesi & Turnikeler', lastCheck: '09:00', status: 'checked' },
    { id: 2, name: 'A Blok Yangın Çıkışı ve Merdivenler', lastCheck: '09:15', status: 'checked' },
    { id: 3, name: 'Kapalı Otopark -1 & -2 Seviyeleri', lastCheck: '09:30', status: 'pending' },
    { id: 4, name: 'Teknik Hacimler ve Jeneratör Odası', lastCheck: '--:--', status: 'pending' },
    { id: 5, name: 'Teras & Çatı Kilit Kontrolü', lastCheck: '--:--', status: 'pending' }
  ]);

  // Olay Kayıtları
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'INC-201',
      time: '08:45',
      type: 'KAPI AÇIK',
      location: 'B Blok -1 Otopark Yangın Kapısı',
      description: 'Yangın kapısı kama ile açık bırakılmış, güvenlik tarafından kapatılıp kilitlendi.',
      reportedBy: 'Serkan Güven'
    }
  ]);

  const [newIncidentType, setNewIncidentType] = useState<'ŞÜPHELİ ARAÇ' | 'KAPI AÇIK' | 'GÜRÜLTÜ' | 'DİĞER'>('KAPI AÇIK');
  const [newIncidentLocation, setNewIncidentLocation] = useState('');
  const [newIncidentDesc, setNewIncidentDesc] = useState('');

  const handleCheckPatrol = (id: number) => {
    setPatrolPoints(patrolPoints.map(p => 
      p.id === id ? { ...p, status: 'checked', lastCheck: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : p
    ));
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncidentLocation.trim()) return;

    const newInc: Incident = {
      id: `INC-${Math.floor(200 + Math.random() * 800)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: newIncidentType,
      location: newIncidentLocation,
      description: newIncidentDesc,
      reportedBy: 'Serkan Güven'
    };

    setIncidents([newInc, ...incidents]);
    setIsModalOpen(false);
    setNewIncidentLocation('');
    setNewIncidentDesc('');
  };

  return (
    <div className="space-y-4">
      <MobileHeader
        title="Güvenlik & Devriye"
        subtitle="Nokta devriye, olay kaydı ve nizamiyeler"
        showBack={true}
        backUrl="/personel"
        type="personel"
      />

      {/* Hızlı Olay / Tutanak Butonu (Kural 3) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center px-5 py-2.5 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-500/40 text-blue-300 text-xs font-bold rounded-lg transition-colors shadow-sm gap-2"
      >
        <Plus className="w-4 h-4" /> Yeni Olay / Tutanak Kaydı Ekle
      </button>

      {/* Sekmeler (Kural 5) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('patrol')}
          className={activeTab === 'patrol'
            ? "flex-1 py-2 bg-[#070A11] border border-blue-500/50 text-blue-300 rounded-lg text-xs font-bold shadow-sm text-center"
            : "flex-1 py-2 bg-transparent border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 rounded-lg text-xs font-semibold text-center"}
        >
          Devriye ({patrolPoints.filter(p => p.status === 'checked').length}/{patrolPoints.length})
        </button>
        <button
          onClick={() => setActiveTab('incidents')}
          className={activeTab === 'incidents'
            ? "flex-1 py-2 bg-[#070A11] border border-blue-500/50 text-blue-300 rounded-lg text-xs font-bold shadow-sm text-center"
            : "flex-1 py-2 bg-transparent border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 rounded-lg text-xs font-semibold text-center"}
        >
          Olay Defteri ({incidents.length})
        </button>
      </div>

      {activeTab === 'patrol' ? (
        <div className="space-y-3">
          <div className="p-3 bg-[#070A11] border border-[#151B2B] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Aktif Devriye Turu</span>
              <h4 className="text-xs font-bold text-white">Sabah Devriyesi (09:00 - 10:30)</h4>
            </div>
            <button 
              className="px-3 py-1.5 bg-blue-950/40 border border-blue-500/40 text-blue-300 text-xs font-bold rounded-lg flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5" /> QR Tara
            </button>
          </div>

          <div className="space-y-2">
            {patrolPoints.map((point) => (
              <div
                key={point.id}
                className="p-3 bg-[#070A11] border border-[#151B2B] rounded-xl flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    point.status === 'checked'
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-900/50 border-slate-800 text-slate-500'
                  }`}>
                    {point.status === 'checked' ? <CheckCircle2 className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{point.name}</h4>
                    <span className="text-[10px] text-slate-500">Son Kontrol: {point.lastCheck}</span>
                  </div>
                </div>

                {point.status === 'checked' ? (
                  <span className="text-[10px] font-bold text-emerald-400 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    Tamamlandı
                  </span>
                ) : (
                  <button
                    onClick={() => handleCheckPatrol(point.id)}
                    className="px-3 py-1.5 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-500/40 text-blue-300 text-xs font-bold rounded-lg transition-colors"
                  >
                    Onayla
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="p-3.5 bg-[#070A11] border border-[#151B2B] rounded-xl space-y-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> {inc.time}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border text-rose-400 border-rose-500/30 bg-rose-500/10">
                  {inc.type}
                </span>
              </div>

              {/* Data Box Veri Kutucukları (Kural 4) */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">KOD</span>
                  <span className="text-xs font-bold text-slate-200">{inc.id}</span>
                </div>
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">TÜR</span>
                  <span className="text-xs font-bold text-blue-300">{inc.type}</span>
                </div>
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">PERSONEL</span>
                  <span className="text-[11px] font-bold text-slate-300 truncate w-full">{inc.reportedBy}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">{inc.location}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{inc.description}</p>
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  onClick={() => setIncidents(incidents.filter(i => i.id !== inc.id))}
                  className="w-10 h-10 bg-[#060B14] border border-red-900/50 text-red-500 hover:bg-red-900/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
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
                  onClick={() => { setNewIncidentLocation(''); setNewIncidentDesc(''); }}
                  className="flex items-center px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Temizle
                </button>
                <h3 className="text-sm font-bold text-white">Yeni Olay / Tutanak Bildirimi</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-3.5">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Olay Türü
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['ŞÜPHELİ ARAÇ', 'KAPI AÇIK', 'GÜRÜLTÜ', 'DİĞER'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewIncidentType(t)}
                      className={`py-2 px-1 text-center text-[10px] font-bold rounded-lg border transition-all ${
                        newIncidentType === t
                          ? 'bg-blue-950/40 border-blue-500 text-blue-300'
                          : 'bg-[#060B14] border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Olay Mahalli / Konum *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: B Blok Yangın Merdiveni 2. Kat"
                  value={newIncidentLocation}
                  onChange={(e) => setNewIncidentLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500/60"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Olay Özeti / Alınan Tedbir
                </label>
                <textarea
                  rows={3}
                  placeholder="Olayın detayları ve uygulanan güvenlik müdahalesi..."
                  value={newIncidentDesc}
                  onChange={(e) => setNewIncidentDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500/60"
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
                  className="flex items-center px-6 py-2 bg-blue-900/20 border border-blue-500/50 text-blue-300 hover:bg-blue-900/40 text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  Olayı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
