'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';
import { Shield, Settings, Users, KeyRound, Globe, Sun, Loader2, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await ApiClient.post<{
        success: boolean; 
        message?: string;
        user?: { name: string; email: string; role: string };
      }>('/api/auth/login', { email, password });

      if (res?.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 400);
      } else {
        setError(res?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
        setLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Giriş sırasında bir hata oluştu.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px]">
      <div className="bg-[#0C1220] border border-slate-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center space-x-3.5 mb-7 relative z-10">
          <div className="w-11 h-11 rounded-2xl border border-[#F97316]/30 bg-[#F97316]/15 flex items-center justify-center shadow-lg shadow-[#F97316]/10">
            <KeyRound className="w-5 h-5 text-[#F97316]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Yönetici Girişi</h2>
            <p className="text-xs text-slate-400 font-medium">Yetkili TMM Yönetim Portalı</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              E-posta / Kullanıcı Adı
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#050914] border border-slate-800 focus:border-[#F97316] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 transition-all font-medium"
              placeholder="serdardogruer@gmail.com"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Şifre
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#050914] border border-slate-800 focus:border-[#F97316] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 transition-all font-medium"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs font-semibold bg-red-950/40 border border-red-500/30 rounded-xl p-3.5 flex items-start space-x-2">
              <span className="shrink-0 text-base leading-none">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="text-emerald-400 text-xs font-semibold bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Giriş başarılı! Yönetim paneline aktarılıyorsunuz...</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#F97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] text-white font-bold text-sm rounded-xl px-4 py-3.5 transition-all shadow-lg shadow-[#F97316]/20 disabled:opacity-60 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Doğrulanıyor...</span>
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Giriş Yapıldı</span>
              </>
            ) : (
              <>
                <span>Yönetim Paneline Giriş Yap</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#060913] text-slate-300 flex flex-col font-sans selection:bg-[#F97316]/30">
      {/* Top Navigation Bar */}
      <header className="flex justify-between items-center px-8 py-5 border-b border-slate-800/60 bg-[#060913]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-center shrink-0 shadow-sm shadow-[#F97316]/5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-[22px] h-[22px] text-[#F97316]">
              <rect x="9.5" y="7" width="5" height="2.5" />
              <rect x="6.5" y="11.5" width="11" height="2.5" />
              <rect x="3.5" y="16" width="17" height="2.5" />
            </svg>
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-[17px] tracking-wide leading-none font-extrabold">
              <span className="text-white">Terrace</span><span className="text-[#F97316]">Feri</span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold tracking-widest mt-1">
              TMM Core v2.0
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <a
            href="/"
            className="flex items-center space-x-2 bg-[#111827] hover:bg-slate-800 border border-slate-700/50 rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <span>Ana Sayfa</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-8 lg:px-24 gap-12 lg:gap-24 py-12">
        {/* Left Side: Information */}
        <div className="flex-1 max-w-xl">
          <div className="inline-flex items-center space-x-2 bg-[#111827]/80 border border-[#F97316]/20 rounded-full px-3.5 py-1 mb-6">
            <Shield className="w-3.5 h-3.5 text-[#F97316]" />
            <span className="text-[11px] font-semibold text-[#F97316] tracking-wide">Güvenli TMM Yönetim & Operasyon Merkezi</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">
            <span className="text-white">TerraceFeri Konutları </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-amber-400">TMM</span>
          </h1>
          
          <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-md">
            TMM Core Yönetim Sistem Portalı. Rezidans yönetimi, teknik arıza bildirimleri, 
            periyodik bakımlar, sayaç okumaları ve personel iş takibi için şifreli ve yetkilendirilmiş merkezi giriş kapısı.
          </p>

          <div className="space-y-3">
            <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              HIZLI ERİŞİM PANELLERİ
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center space-x-2 bg-[#111827] border border-[#F97316]/30 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm">
                <Shield className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Yönetici Paneli (Şifreli)</span>
              </button>
              <a href="/q/fault" className="flex items-center space-x-2 bg-[#111827] border border-slate-700/50 hover:border-slate-600 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-300 transition-colors">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Hızlı Arıza Bildirimi</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form wrapped in Suspense */}
        <Suspense fallback={
          <div className="w-full max-w-[440px] h-[400px] bg-[#0C1220] border border-slate-800 rounded-3xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800/60 flex justify-between items-center px-8 text-[11px] text-slate-500">
        <div>
          © 2026 TerraceFeri Konutları Yönetim Sistemi. Tüm hakları saklıdır.
        </div>
        <div className="text-slate-600">
          Güvenli SSL / TLS & JWT Korumalı
        </div>
      </footer>
    </div>
  );
}

