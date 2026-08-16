'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Bot, QrCode, Phone, CheckCircle2, ShieldCheck, 
  Sparkles, Key, Save, RefreshCw, Smartphone, Zap, MessageSquare, AlertCircle
} from 'lucide-react';
import { WhatsAppService, WhatsAppConfig } from '@/modules/ai-bot/whatsapp-service';
import { cn } from '@/lib/utils';

export default function AIBotSettingsPage() {
  const [waConfig, setWaConfig] = useState<WhatsAppConfig>({
    phoneNumber: '05305631781',
    isConnected: true,
    lastConnectedAt: new Date().toISOString()
  });

  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai'>('gemini');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [liveStatus, setLiveStatus] = useState<{ isConnected: boolean; qrImageUrl: string | null; pairingCode?: string | null }>({ isConnected: false, qrImageUrl: null, pairingCode: null });

  useEffect(() => {
    setWaConfig(WhatsAppService.getConfig());
    const savedProvider = localStorage.getItem('ai_provider') as 'gemini' | 'openai';
    if (savedProvider) setAiProvider(savedProvider);

    const savedGemini = localStorage.getItem('ai_api_key_gemini');
    if (savedGemini) setGeminiApiKey(savedGemini);

    const savedOpenAi = localStorage.getItem('ai_api_key_openai');
    if (savedOpenAi) setOpenaiApiKey(savedOpenAi);

    const checkLiveStatus = async () => {
      try {
        const res = await fetch('/whatsapp-status.json?t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          setLiveStatus(data);
        }
      } catch {}
    };

    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = () => {
    localStorage.setItem('ai_provider', aiProvider);
    if (geminiApiKey) localStorage.setItem('ai_api_key_gemini', geminiApiKey);
    if (openaiApiKey) localStorage.setItem('ai_api_key_openai', openaiApiKey);
    
    WhatsAppService.saveConfig(waConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Sticky Header */}
      <div className="sticky -top-6 z-30 bg-[#060B14]/95 backdrop-blur-md pt-6 pb-4 border-b border-slate-800/80 -mx-6 px-6 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/admin/settings" className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-md text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-12 h-12 bg-emerald-900/10 rounded-md flex items-center justify-center border border-emerald-500/30">
            <Bot className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <span>AI & WhatsApp Bot Ayarları</span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-md border border-emerald-500/30">05305631781</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Sesli komut ayrıştırıcı, WhatsApp otomasyonu ve yapay zeka sağlayıcı ayarları</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Ayarları Kaydet</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Yapay zeka ve WhatsApp Bot ayarları başarıyla kaydedildi!</span>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: 📱 WhatsApp Entegrasyonu (05305631781) */}
        <div className="bg-[#0f121b] border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">WhatsApp Bot Bağlantısı</h3>
                <p className="text-xs text-slate-400">Sıfır Maliyetli İş Telefonu Entegrasyonu</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
              %100 ÜCRETSİZ
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bağlı İş Telefonu Numarası</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={waConfig.phoneNumber}
                  onChange={(e) => setWaConfig({ ...waConfig, phoneNumber: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-[#070A11] border border-[#151B2B] rounded-xl text-sm font-bold text-emerald-400 outline-none"
                  placeholder="05305631781"
                />
              </div>
            </div>

            <div className="p-4 bg-[#070A11] border border-slate-800/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Canlı Bağlantı Durumu:</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Aktif (Bağlı)
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Bu hat üzerinden atılan tüm Türkçe ses kayıtları ve mesajlar otomatik işlenir.
              </div>
            </div>

            <button
              onClick={() => setShowQr(!showQr)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>{showQr ? 'QR Kodu Gizle' : 'Yeniden QR Kod İle Eşleştir'}</span>
            </button>

            {showQr && (
              <div className="p-5 bg-slate-950 rounded-2xl text-center space-y-4 animate-in zoom-in-95 duration-200 border border-slate-800 shadow-2xl">
                {liveStatus.pairingCode && (
                  <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2">
                    <div className="text-xs font-semibold text-emerald-300">🔑 WhatsApp 8 Haneli Eşleştirme Kodu:</div>
                    <div className="text-2xl font-black tracking-widest text-emerald-400 font-mono select-all bg-emerald-900/30 py-2 rounded-lg border border-emerald-500/20">
                      {liveStatus.pairingCode}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Telefonda WhatsApp &gt; Bağlı Cihazlar &gt; Cihaz Bağla &gt; <strong>Telefon Numarası İle Bağla</strong> seçeneğine tıklayıp bu kodu girin!
                    </div>
                  </div>
                )}

                <div className="p-3 bg-white rounded-xl space-y-2">
                  <img
                    src={liveStatus.qrImageUrl || "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https://wa.me/905305631781?text=TMM_WHATSAPP_BOT_CONNECT"}
                    alt="WhatsApp Canlı QR Kod"
                    className="w-44 h-44 mx-auto rounded-lg border-2 border-slate-900 p-1 bg-white"
                  />
                  <div className="text-[11px] font-bold text-slate-900">Veya QR Kod Kamerasıyla Okutun</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: 🧠 Yapay Zeka Entegrasyon Ayarları */}
        <div className="bg-[#0f121b] border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Yapay Zeka Motoru</h3>
                <p className="text-xs text-slate-400">Sesli Komut & Niyet Ayrıştırıcı</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sağlayıcı Seçimi</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAiProvider('gemini')}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1",
                    aiProvider === 'gemini'
                      ? "bg-blue-950/40 border-blue-500 text-white"
                      : "bg-[#070A11] border-slate-800 text-slate-400 hover:border-slate-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Google Gemini</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold rounded">ÜCRETSİZ</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Gemini 1.5 Flash (Hızlı)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAiProvider('openai')}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1",
                    aiProvider === 'openai'
                      ? "bg-purple-950/40 border-purple-500 text-white"
                      : "bg-[#070A11] border-slate-800 text-slate-400 hover:border-slate-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">OpenAI GPT</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 font-bold rounded">ÜCRET Lİ</span>
                  </div>
                  <div className="text-[10px] text-slate-500">GPT-4o-mini / GPT-4o</div>
                </button>
              </div>
            </div>

            {aiProvider === 'gemini' ? (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Google Gemini API Key (Ücretsiz)</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full pl-10 pr-4 py-3 bg-[#070A11] border border-[#151B2B] rounded-xl text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="text-[11px] text-slate-500">
                  Google AI Studio üzerinden ücretsiz API key edinebilirsiniz. (Girilmese bile yerel Türkçe parser aktif çalışır).
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">OpenAI API Key (Ücretli)</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    placeholder="sk-proj-..."
                    className="w-full pl-10 pr-4 py-3 bg-[#070A11] border border-[#151B2B] rounded-xl text-xs text-white placeholder:text-slate-600 outline-none focus:border-purple-500"
                  />
                </div>
                <div className="text-[11px] text-slate-500">
                  OpenAI Platform hesabınızdan alacağınız API key.
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
