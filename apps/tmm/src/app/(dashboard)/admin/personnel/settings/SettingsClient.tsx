'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Save, MapPin, QrCode, X, Printer } from 'lucide-react';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface LocationSetting {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
  allowedIps: string[];
}

export default function SettingsClient({ initialSettings }: { initialSettings: LocationSetting[] }) {
  const router = useRouter();
  const { canEdit } = useUserPermissions();
  const [settings, setSettings] = useState<LocationSetting[]>(initialSettings);

  const [loading, setLoading] = useState(false);
  const [qrModal, setQrModal] = useState<{isOpen: boolean, setting: LocationSetting | null}>({ isOpen: false, setting: null });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Eğer hiç ayar yoksa varsayılan boş bir form açmak için
  const handleAddFirst = () => {
    setSettings([{
      id: 'new',
      name: 'Merkez Şantiye',
      latitude: 41.0082,
      longitude: 28.9784,
      allowedRadiusMeters: 100,
      allowedIps: []
    }]);
  };

  const handleSave = async (setting: LocationSetting) => {
    setLoading(true);
    try {
      const res = await fetch('/api/personnel/settings', {
        method: setting.id === 'new' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setting),
      });
      
      if (res.ok) {
        alert('Ayarlar başarıyla kaydedildi.');
        router.refresh();
      } else {
        const err = await res.json();
        alert('Hata: ' + (err.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error(error);
      alert('Kaydetme sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof LocationSetting, value: any) => {
    const updated = [...settings];
    if (field === 'allowedIps') {
      // Virgülle ayrılmış IP listesini diziye çevir
      updated[index][field] = value.split(',').map((ip: string) => ip.trim()).filter(Boolean);
    } else if (field === 'latitude' || field === 'longitude' || field === 'allowedRadiusMeters') {
      updated[index][field] = Number(value);
    } else {
      updated[index][field] = value;
    }
    setSettings(updated);
  };

  return (
    <div className="bg-[#0C1220] border border-slate-800/60 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-slate-800/60 bg-[#080d18] flex items-center gap-3">
        <MapPin className="w-6 h-6 text-[#F97316]" />
        <h2 className="text-xl font-bold text-white">QR Konum ve Mesafe Sınırları</h2>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="bg-[#111827] border border-[#F97316]/20 rounded-xl p-4 flex gap-4 items-start">
          <ShieldAlert className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300 leading-relaxed">
            Personelin QR kodu okuttuğu yerin, şantiye merkezine en fazla kaç metre uzaklıkta olabileceğini buradan belirleyebilirsiniz. 
            Belirlenen yarıçap (örn: 100m) dışındaki okutmalar sistem tarafından sahtekarlık şüphesiyle <strong>reddedilir.</strong>
          </p>
        </div>

        {settings.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-slate-700 rounded-xl">
            <p className="text-slate-400 mb-4">Henüz kayıtlı bir şantiye konumu yok.</p>
            {canEdit && (
              <button onClick={handleAddFirst} className="bg-orange-900/10 border border-orange-500/40 text-orange-400 px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-orange-900/30 transition-colors cursor-pointer">
                İlk Konumu Ekle
              </button>
            )}
          </div>
        ) : (

          settings.map((setting, index) => (
            <div key={setting.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#050914] p-5 rounded-xl border border-slate-800/60">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 mb-2">Konum / Şantiye Adı</label>
                <input 
                  type="text" 
                  value={setting.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  className="w-full bg-[#111827] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#F97316] outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Merkez Enlem (Latitude)</label>
                <input 
                  type="number" step="any"
                  value={setting.latitude} 
                  onChange={(e) => handleChange(index, 'latitude', e.target.value)}
                  className="w-full bg-[#111827] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#F97316] outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Merkez Boylam (Longitude)</label>
                <input 
                  type="number" step="any"
                  value={setting.longitude} 
                  onChange={(e) => handleChange(index, 'longitude', e.target.value)}
                  className="w-full bg-[#111827] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#F97316] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">İzin Verilen Yarıçap (Metre)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={setting.allowedRadiusMeters} 
                    onChange={(e) => handleChange(index, 'allowedRadiusMeters', e.target.value)}
                    className="w-full bg-[#111827] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#F97316] outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Metre</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">İzin Verilen Wi-Fi (Sabit IP'ler)</label>
                <input 
                  type="text" 
                  value={setting.allowedIps.join(', ')} 
                  onChange={(e) => handleChange(index, 'allowedIps', e.target.value)}
                  placeholder="Örn: 195.123.45.67, 192.168.1.1"
                  className="w-full bg-[#111827] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#F97316] outline-none"
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-between mt-2 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => {
                    if (setting.id === 'new') {
                      alert('Önce ayarları kaydetmelisiniz.');
                      return;
                    }
                    setQrModal({ isOpen: true, setting });
                  }}
                  className="bg-indigo-900/20 border border-indigo-500/40 hover:bg-indigo-900/40 text-indigo-400 px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  QR Üret / Yazdır
                </button>
                {canEdit && (
                  <button 
                    type="button" 
                    disabled={loading}
                    onClick={() => handleSave(setting)}
                    className="bg-orange-900/20 border border-orange-500/40 hover:bg-orange-900/40 text-orange-400 disabled:opacity-50 px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                  </button>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* QR Modalı */}
      {qrModal.isOpen && qrModal.setting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C1220] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-[#080d18] flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-400" />
                Şantiye QR Kodu
              </h3>
              <button onClick={() => setQrModal({ isOpen: false, setting: null })} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 flex flex-col items-center justify-center bg-white">
              {/* Beyaz arkaplan, çünkü QR kodu siyah beyaz basılacak */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-slate-900">{qrModal.setting.name}</h2>
                <p className="text-sm font-bold text-slate-500 mt-1">PERSONEL GİRİŞ / ÇIKIŞ NOKTASI</p>
              </div>
              
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(isMounted ? `${window.location.origin}/q/${qrModal.setting.id}` : '')}`} 
                alt="QR Code"
                className="w-64 h-64 border-4 border-slate-900 p-2 rounded-xl"
              />

              <div className="mt-8 text-center">
                <p className="text-xs text-slate-600 font-medium">Lütfen telefonunuzun kamerasını <br/>veya TerraceFeri Personel uygulamasını kullanarak okutun.</p>
              </div>
            </div>
            <div className="p-4 bg-[#080d18] border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors w-full justify-center"
              >
                <Printer className="w-4 h-4" />
                Çıktı Al (Yazdır)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
