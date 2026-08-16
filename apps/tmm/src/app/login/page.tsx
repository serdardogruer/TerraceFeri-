'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';
import { Shield, Settings, Users, KeyRound, Globe, Sun } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@terraceferi.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('Giriş yapılıyor, lütfen bekleyin...');
    try {
      const res = await ApiClient.post<{success: boolean; message: string}>('/api/auth/login', { email, password });
      if (res?.success) {
        window.location.href = '/admin';
      } else {
        setError(res?.message || 'Giriş başarısız');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-300 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="flex justify-between items-center px-8 py-5 border-b border-slate-800/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-[#111827] border border-slate-800 flex items-center justify-center shrink-0 shadow-sm shadow-[#F97316]/5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-[22px] h-[22px] text-[#F97316]">
              <rect x="9.5" y="7" width="5" height="2.5" />
              <rect x="6.5" y="11.5" width="11" height="2.5" />
              <rect x="3.5" y="16" width="17" height="2.5" />
            </svg>
          </div>
          <div className="flex flex-col justify-center mt-1">
            <div className="text-[17px] tracking-wide leading-none font-bold">
              <span className="text-white">Terrace</span><span className="text-white">Feri</span>
            </div>
            <div className="text-[10px] text-[#F97316] font-bold tracking-widest mt-1">
              TMM Core v2.0
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-[#111827] hover:bg-slate-800 border border-slate-700/50 rounded-md px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors">
            <Globe className="w-3.5 h-3.5" />
            <span>TR</span>
          </button>
          <button className="flex items-center justify-center bg-[#111827] hover:bg-slate-800 border border-slate-700/50 rounded-md w-8 h-8 text-slate-400 transition-colors">
            <Sun className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-8 lg:px-24 gap-16 lg:gap-32">
        {/* Left Side: Information */}
        <div className="flex-1 max-w-xl">
          <div className="inline-flex items-center space-x-2 bg-[#111827]/80 border border-[#F97316]/20 rounded-full px-3 py-1 mb-6">
            <svg className="w-3.5 h-3.5 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-[11px] font-semibold text-[#F97316] tracking-wide">Tesis Yönetim & Operasyon Merkezi</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight">
            <span className="text-white">TerraceFeri Konutları </span>
            <span className="text-[#F97316]">TMM</span>
          </h1>
          
          <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-md">
            TMM Core Yönetim Sistem Portalı. Rezidans yönetimi, teknik arıza bildirimleri, 
            periyodik bakımlar, sayaç okumaları ve personel iş takibi için merkezi giriş kapısı.
          </p>

          <div className="space-y-3">
            <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              HIZLI ERİŞİM PANELLERİ
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center space-x-2 bg-[#111827] border border-slate-700/50 hover:border-slate-600 rounded-md px-4 py-2 text-xs font-medium text-slate-300 transition-colors">
                <Shield className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Yönetim Paneli</span>
              </button>
              <button className="flex items-center space-x-2 bg-[#111827] border border-slate-700/50 hover:border-slate-600 rounded-md px-4 py-2 text-xs font-medium text-slate-300 transition-colors">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Daire Sakini Paneli</span>
              </button>
              <button className="flex items-center space-x-2 bg-[#111827] border border-slate-700/50 hover:border-slate-600 rounded-md px-4 py-2 text-xs font-medium text-slate-300 transition-colors">
                <Settings className="w-3.5 h-3.5 text-green-400" />
                <span>Teknik Personel Paneli</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-[420px]">
          <div className="bg-[#0C1220] border border-slate-800/60 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 rounded-lg border border-[#F97316]/20 bg-[#F97316]/10 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-[#F97316]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Portala Giriş Yap</h2>
                <p className="text-xs text-slate-500">Güvenli kullanıcı doğrulaması</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">E-posta Adresi</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#050914] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-all"
                  placeholder="ornek@terraceferi.com"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Şifre</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#050914] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="text-red-400 text-xs font-medium bg-red-400/10 border border-red-400/20 rounded-md p-3">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleLogin}
                className="w-full flex items-center justify-center space-x-2 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-sm rounded-lg px-4 py-3.5 transition-colors mt-2"
              >
                <span>Sisteme Giriş Yap</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800/60 flex justify-between items-center px-8 text-[10px] text-slate-600">
        <div className="w-6 h-6 rounded bg-[#111827] border border-slate-800 flex items-center justify-center font-bold text-slate-400">
          N
        </div>
        <div>
          © 2026 TerraceFeri Konutları Yönetim Sistemi. Tüm hakları saklıdır.
        </div>
        <div className="w-6 h-6"></div> {/* Spacer for alignment */}
      </footer>
    </div>
  );
}
