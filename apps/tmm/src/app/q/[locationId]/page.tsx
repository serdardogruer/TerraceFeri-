'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, XCircle, MapPin, Smartphone, Loader2 } from 'lucide-react';

type ScanState = 'INIT' | 'SELECT_PERSONNEL' | 'LOCATING' | 'SUBMITTING' | 'SUCCESS' | 'ERROR';

export default function QRScanPage() {
  const params = useParams();
  const locationId = params.locationId as string;
  
  const [state, setState] = useState<ScanState>('INIT');
  const [personnelList, setPersonnelList] = useState<any[]>([]);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  useEffect(() => {
    const fetchPersonnelAndCheck = async () => {
      try {
        const res = await fetch('/api/personnel');
        const data = await res.json();
        if (data.success) {
          setPersonnelList(data.personnel);
        }
      } catch (e) {
        console.error(e);
      }

      const savedPersonnelId = localStorage.getItem('personnel_id');
      if (!savedPersonnelId) {
        setState('SELECT_PERSONNEL');
      } else {
        startScanProcess(savedPersonnelId);
      }
    };
    
    fetchPersonnelAndCheck();
  }, []);

  const startScanProcess = (personnelId: string) => {
    setState('LOCATING');
    
    // Konum iste (Opsiyonel)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          submitScan(personnelId, position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Konum alınamazsa sadece IP ile dene
          submitScan(personnelId, null, null);
        },
        { timeout: 5000, maximumAge: 0 }
      );
    } else {
      // Geolocation desteklenmiyorsa
      submitScan(personnelId, null, null);
    }
  };

  const submitScan = async (personnelId: string, lat: number | null, lng: number | null) => {
    setState('SUBMITTING');
    try {
      const res = await fetch('/api/personnel/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personnelId, locationId, lat, lng })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setState('SUCCESS');
      } else {
        setErrorMsg(data.message || 'Bir hata oluştu');
        setState('ERROR');
      }
    } catch (error) {
      setErrorMsg('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
      setState('ERROR');
    }
  };

  const handlePersonnelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonnelId) {
      setErrorMsg('Lütfen adınızı seçin.');
      return;
    }
    
    localStorage.setItem('personnel_id', selectedPersonnelId);
    startScanProcess(selectedPersonnelId);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-300 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-[#0C1220] border border-slate-800/60 rounded-2xl p-8 shadow-2xl text-center">
        
        {(state === 'INIT' || state === 'LOCATING' || state === 'SUBMITTING') && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-16 h-16 text-[#F97316] animate-spin mb-4" />
            <h2 className="text-xl font-bold text-white">
              {state === 'INIT' && 'Sistem Hazırlanıyor...'}
              {state === 'LOCATING' && 'Konum Doğrulanıyor...'}
              {state === 'SUBMITTING' && 'İşlem Kaydediliyor...'}
            </h2>
            {state === 'LOCATING' && (
              <p className="text-xs text-slate-500 mt-2">Lütfen konum izni istendiğinde onaylayın.</p>
            )}
          </div>
        )}

        {state === 'SELECT_PERSONNEL' && (
          <div className="py-2">
            <div className="w-16 h-16 rounded-full bg-[#111827] border border-slate-800 flex items-center justify-center mx-auto mb-6 shadow-sm shadow-[#F97316]/10">
              <Smartphone className="w-8 h-8 text-[#F97316]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Kimlik Seçimi</h2>
            <p className="text-sm text-slate-400 mb-8">
              Lütfen listeden adınızı seçin. Bu seçim telefonunuza kaydedilecek ve sonraki okutmalarda size tek tıkla giriş imkanı sağlayacaktır.
            </p>
            
            <form onSubmit={handlePersonnelSubmit} className="space-y-4">
              <div>
                <select
                  required
                  value={selectedPersonnelId}
                  onChange={(e) => setSelectedPersonnelId(e.target.value)}
                  className="w-full bg-[#050914] border border-slate-800 rounded-lg px-4 py-3.5 text-center text-lg tracking-wider text-white focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-all appearance-none"
                >
                  <option value="" disabled>-- Personel Seçiniz --</option>
                  {personnelList.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>
              {errorMsg && <div className="text-red-400 text-sm mt-2">{errorMsg}</div>}
              <button
                type="submit"
                className="w-full bg-[#F97316] hover:bg-[#ea580c] text-white font-bold rounded-lg px-4 py-3.5 transition-colors mt-4"
              >
                Kaydet ve Giriş Yap
              </button>
            </form>
          </div>
        )}

        {state === 'SUCCESS' && (
          <div className="py-6 flex flex-col items-center">
            <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-2">Başarılı!</h2>
            <p className="text-sm text-slate-400">İşleminiz kaydedildi.</p>
            <p className="text-xs text-slate-500 mt-8">Bu pencereyi kapatabilirsiniz.</p>
          </div>
        )}

        {state === 'ERROR' && (
          <div className="py-6 flex flex-col items-center">
            <XCircle className="w-20 h-20 text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">İşlem Başarısız</h2>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8 text-sm text-red-400">
              {errorMsg}
            </div>
            <button
              onClick={() => {
                setState('INIT');
                setErrorMsg('');
                const personnelId = localStorage.getItem('personnel_id');
                if (personnelId) startScanProcess(personnelId);
                else setState('SELECT_PERSONNEL');
              }}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        )}
        
      </div>
      
      <div className="mt-8 text-center text-[10px] text-slate-600 flex flex-col items-center gap-1">
         <div>TMM Personel Sistemi</div>
         <div className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {locationId}</div>
      </div>
    </div>
  );
}
