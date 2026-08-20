'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Lock, 
  Phone, 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Info,
  UserCheck
} from 'lucide-react';

// Terrace Feri Sakinleri Veritabanı (Her Sakine Özel Şifre / PIN)
const RESIDENTS_DATABASE = [
  {
    code: 'SAK-42',
    name: 'Ahmet Yılmaz',
    phone: '05321112233',
    doorNo: 'A-42',
    block: 'A Blok',
    apartmentNo: '42',
    floor: 'Kat 4',
    type: 'Mülk Sahibi',
    password: '4242' // Özel Şifresi
  },
  {
    code: 'SAK-15',
    name: 'Mehmet Kaya',
    phone: '05332223344',
    doorNo: 'B-15',
    block: 'B Blok',
    apartmentNo: '15',
    floor: 'Kat 2',
    type: 'Kiracı',
    password: '1515' // Özel Şifresi
  },
  {
    code: 'SAK-08',
    name: 'Zeynep Demir',
    phone: '05353334455',
    doorNo: 'A-08',
    block: 'A Blok',
    apartmentNo: '08',
    floor: 'Kat 1',
    type: 'Mülk Sahibi',
    password: '0808' // Özel Şifresi
  },
  {
    code: 'SAK-24',
    name: 'Ayşe Çelik',
    phone: '05364445566',
    doorNo: 'B-24',
    block: 'B Blok',
    apartmentNo: '24',
    floor: 'Kat 3',
    type: 'Mülk Sahibi',
    password: '2424' // Özel Şifresi
  }
];

export default function SakinLoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState(''); // Telefon No veya Daire (Örn: A-42 veya 0532...)
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const cleanIdentifier = identifier.trim().toLowerCase().replace(/[\s-]/g, '');
    const cleanPassword = password.trim();

    // Eşleşen sakini bul (Telefon no, daire no veya isim ile)
    const matchedResident = RESIDENTS_DATABASE.find(r => {
      const matchPhone = r.phone.replace(/[\s-]/g, '').includes(cleanIdentifier);
      const matchDoor = r.doorNo.toLowerCase().replace(/[\s-]/g, '') === cleanIdentifier ||
                        `daire${r.apartmentNo}` === cleanIdentifier ||
                        r.apartmentNo === cleanIdentifier;
      const matchCode = r.code.toLowerCase().replace(/[\s-]/g, '') === cleanIdentifier;
      return matchPhone || matchDoor || matchCode;
    });

    setTimeout(() => {
      if (!matchedResident) {
        setErrorMessage('Girilen telefon numarası veya daire no kayıtlarımızda bulunamadı.');
        setIsLoading(false);
        return;
      }

      if (matchedResident.password !== cleanPassword) {
        setErrorMessage('Hatalı şifre! Lütfen bu daireye ait özel şifrenizi kontrol ediniz.');
        setIsLoading(false);
        return;
      }

      // Başarılı Giriş -> Sakin Oturumunu Başlat
      if (typeof window !== 'undefined') {
        localStorage.setItem('tf_active_resident', JSON.stringify({
          code: matchedResident.code,
          name: matchedResident.name,
          phone: matchedResident.phone,
          doorNo: matchedResident.doorNo,
          block: matchedResident.block,
          apartmentNo: matchedResident.apartmentNo,
          floor: matchedResident.floor,
          type: matchedResident.type
        }));
      }

      router.push('/sakin');
    }, 350);
  };

  const handleQuickFill = (res: typeof RESIDENTS_DATABASE[0]) => {
    setIdentifier(res.doorNo);
    setPassword(res.password);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#060B14] flex flex-col justify-center px-4 py-8 max-w-sm mx-auto">
      {/* Üst Logo & Başlık */}
      <div className="text-center space-y-2 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-900/60 to-indigo-600/30 border border-indigo-500/40 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <Building2 className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-wider">TERRACE FERİ</h1>
        <p className="text-xs text-indigo-300/80 font-medium">Sakin Portalı • Bireysel Güvenli Giriş</p>
      </div>

      {/* Giriş Formu */}
      <div className="bg-[#070A11] border border-slate-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Daire No veya Telefon Numarası
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Örn: A-42 veya 0532 111 22 33"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setErrorMessage(null); }}
                className="w-full pl-9 pr-3 py-2.5 bg-[#060B14] border border-slate-800 focus:border-indigo-500/60 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none transition-colors"
              />
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Özel Giriş Şifresi
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Dairenize özel şifreniz"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMessage(null); }}
                className="w-full pl-9 pr-3 py-2.5 bg-[#060B14] border border-slate-800 focus:border-indigo-500/60 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none transition-colors"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Hata Bildirimi */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] font-semibold rounded-xl text-center">
              {errorMessage}
            </div>
          )}

          {/* Giriş Yap Butonu */}
          <button
            type="submit"
            disabled={isLoading || !identifier.trim() || !password.trim()}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{isLoading ? 'Giriş Doğrulanıyor...' : 'Kendi Hesabıma Giriş Yap'}</span>
          </button>
        </form>

        {/* Demo Hesaplar Hızlı Test Kutusu */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <Info className="w-3 h-3 text-indigo-400" />
            <span>Farklı Sakinleri Test Edin:</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {RESIDENTS_DATABASE.map(r => (
              <button
                key={r.code}
                type="button"
                onClick={() => handleQuickFill(r)}
                className="p-2 bg-[#060B14] hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-lg text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-white group-hover:text-indigo-300">
                  <span>{r.doorNo}</span>
                  <span className="text-[9px] font-mono text-indigo-400">Şifre: {r.password}</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">{r.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-[11px] text-slate-500">
        Terrace Feri Residence • Güvenli Sakin Giriş Sistemi
      </div>
    </div>
  );
}
