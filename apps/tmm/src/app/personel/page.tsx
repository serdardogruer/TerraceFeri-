'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Sparkles, 
  Lock, 
  KeyRound, 
  User, 
  ArrowRight,
  AlertCircle,
  Building,
  CheckCircle2
} from 'lucide-react';
import { MobileHeader } from '@/components/mobile/MobileHeader';

export default function PersonelLoginPage() {
  const router = useRouter();
  const [personnelCode, setPersonnelCode] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Tanımlı Personel Hesapları ve Şifreleri (Kendi sistemlerine özel)
  const staffAccounts = [
    {
      code: 'TEM-01',
      pin: '1234',
      name: 'Fatma Şahin',
      role: 'TEMIZLIK',
      title: 'Temizlik Görevlisi',
      redirectUrl: '/personel/temizlik'
    },
    {
      code: 'TEM-02',
      pin: '1234',
      name: 'Ayşe Kaya',
      role: 'TEMIZLIK',
      title: 'Temizlik Görevlisi',
      redirectUrl: '/personel/temizlik'
    },
    {
      code: 'TEM-03',
      pin: '1234',
      name: 'Emine Yılmaz',
      role: 'TEMIZLIK',
      title: 'Temizlik Görevlisi',
      redirectUrl: '/personel/temizlik'
    },
    {
      code: 'GUV-01',
      pin: '5678',
      name: 'Mustafa Yıldırım',
      role: 'GUVENLIK',
      title: 'Güvenlik Amiri',
      redirectUrl: '/personel/guvenlik'
    },
    {
      code: 'GUV-02',
      pin: '5678',
      name: 'Hasan Demir',
      role: 'GUVENLIK',
      title: 'Nöbetçi Güvenlik Memuru',
      redirectUrl: '/personel/guvenlik'
    }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const cleanCode = personnelCode.trim().toUpperCase();
    const cleanPin = pinCode.trim();

    // Eşleşen personeli bul
    const found = staffAccounts.find(
      s => s.code === cleanCode && s.pin === cleanPin
    );

    if (found) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tf_active_staff', JSON.stringify({
          code: found.code,
          name: found.name,
          role: found.role,
          title: found.title,
          loginTime: new Date().toISOString()
        }));
      }
      setTimeout(() => {
        router.push(found.redirectUrl);
      }, 400);
    } else {
      setLoading(false);
      setErrorMsg('Hatalı Personel Kodu veya Şifre! Lütfen kontrol ediniz.');
    }
  };

  const handleQuickFill = (code: string, pin: string) => {
    setPersonnelCode(code);
    setPinCode(pin);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-4 max-w-sm mx-auto py-2">
      <MobileHeader 
        title="TERRACE FERİ" 
        subtitle="Personel Güvenli Giriş Paneli"
        badge="Şifreli Giriş"
        type="personel"
      />

      {/* Güvenli Giriş Başlık Kartı */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0A121D] to-[#070A11] border border-[#151B2B] text-center space-y-2 shadow-lg">
        <div className="w-12 h-12 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-400 mx-auto flex items-center justify-center shadow-inner">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">Personel Girişi</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Her personel yalnızca kendi yetkili alanına erişebilir.
          </p>
        </div>
      </div>

      {/* Hata Bildirimi */}
      {errorMsg && (
        <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Şifreli Giriş Formu (Kural 3 Standartları) */}
      <form onSubmit={handleLogin} className="p-4 bg-[#070A11] border border-[#151B2B] rounded-2xl space-y-3.5 shadow-md">
        <div>
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-400" /> Personel Kodu *
          </label>
          <input
            type="text"
            required
            placeholder="Örn: TEM-01 veya GUV-01"
            value={personnelCode}
            onChange={(e) => setPersonnelCode(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#060B14] border border-slate-800 focus:border-indigo-500/60 rounded-xl text-xs text-white uppercase placeholder:normal-case focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> PIN / Şifre *
          </label>
          <input
            type="password"
            required
            placeholder="4 haneli şifreniz"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#060B14] border border-slate-800 focus:border-emerald-500/60 rounded-xl text-xs text-white focus:outline-none transition-colors tracking-widest"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-3 bg-indigo-900/30 hover:bg-indigo-900/50 active:bg-indigo-900/70 border border-indigo-500/50 text-indigo-300 text-xs font-bold rounded-xl transition-all shadow-md gap-2 cursor-pointer"
        >
          {loading ? (
            <span>Giriş Yapılıyor...</span>
          ) : (
            <>
              <span>Sisteme Giriş Yap</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Hızlı Test Girişleri (Geliştirme / Test İçin Kolay Doldurma) */}
      <div className="p-3 bg-[#060B14] border border-slate-800/80 rounded-2xl space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
          Hızlı Test Girişleri (Demo Hesaplar)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('TEM-01', '1234')}
            className="p-2 bg-[#070A11] border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
              <Sparkles className="w-3 h-3" /> Temizlik
            </div>
            <p className="text-[10px] text-slate-300 mt-0.5">Kod: TEM-01</p>
            <p className="text-[9px] text-slate-500">Şifre: 1234</p>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('GUV-01', '5678')}
            className="p-2 bg-[#070A11] border border-blue-500/30 hover:border-blue-500/60 rounded-xl text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1 text-blue-400 text-[11px] font-bold">
              <Shield className="w-3 h-3" /> Güvenlik
            </div>
            <p className="text-[10px] text-slate-300 mt-0.5">Kod: GUV-01</p>
            <p className="text-[9px] text-slate-500">Şifre: 5678</p>
          </button>
        </div>
      </div>
    </div>
  );
}
