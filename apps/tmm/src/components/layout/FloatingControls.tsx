'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, MessageSquare, X, Send, CheckCircle2, 
  Sparkles, Phone, Trash2, History, CheckCheck, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIService, ParsedCommand } from '@/modules/ai-bot/ai-service';
import { CommandExecutor } from '@/modules/ai-bot/command-executor';
import { ApiClient } from '@/lib/api-client';

interface WaMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  date: string;
  timestamp: number;
}

interface VoiceHistoryItem {
  id: string;
  command: string;
  response: string;
  time: string;
  date: string;
  timestamp: number;
  success: boolean;
}

const DEFAULT_WA_MESSAGES: WaMessage[] = [
  {
    id: 'msg-init-1',
    sender: 'bot',
    text: '👋 Merhaba! TerraceFeri TMM WhatsApp Botuna hoş geldiniz. Numaradan (05305631781) ses kaydı atabilir veya sayaç, arıza ve tüm yönetim komutlarını buraya yazabilirsiniz.',
    time: '10:00',
    date: 'Bugün',
    timestamp: Date.now() - 3600000
  }
];

export function FloatingControls() {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const waChatEndRef = useRef<HTMLDivElement>(null);
  const voiceChatEndRef = useRef<HTMLDivElement>(null);
  
  // Voice Recording state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  // Persistent Voice History state
  const [voiceHistory, setVoiceHistory] = useState<VoiceHistoryItem[]>([]);

  // WhatsApp Simulator state
  const [waInputText, setWaInputText] = useState('');
  const [waMessages, setWaMessages] = useState<WaMessage[]>(DEFAULT_WA_MESSAGES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persistent histories from Server and LocalStorage on mount
  useEffect(() => {
    let mounted = true;

    async function loadHistories() {
      try {
        // 1. WhatsApp Messages
        let loadedWa: WaMessage[] = [];
        const localWa = localStorage.getItem('tmm_wa_chat_history');
        if (localWa) {
          try {
            const parsed = JSON.parse(localWa);
            if (Array.isArray(parsed) && parsed.length > 0) loadedWa = parsed;
          } catch {}
        }

        // Fetch from server
        try {
          const res = await ApiClient.get<{ success: boolean; data: WaMessage[] }>('/api/ai-bot/history?type=whatsapp');
          if (res?.success && res.data && res.data.length > 0) {
            loadedWa = res.data;
          }
        } catch {}

        if (mounted && loadedWa.length > 0) {
          setWaMessages(loadedWa);
        }

        // 2. Voice History
        let loadedVoice: VoiceHistoryItem[] = [];
        const localVoice = localStorage.getItem('tmm_voice_command_history');
        if (localVoice) {
          try {
            const parsed = JSON.parse(localVoice);
            if (Array.isArray(parsed) && parsed.length > 0) loadedVoice = parsed;
          } catch {}
        }

        try {
          const res = await ApiClient.get<{ success: boolean; data: VoiceHistoryItem[] }>('/api/ai-bot/history?type=voice');
          if (res?.success && res.data && res.data.length > 0) {
            loadedVoice = res.data;
          }
        } catch {}

        if (mounted && loadedVoice.length > 0) {
          setVoiceHistory(loadedVoice);
        }
      } catch (e) {
        console.error('Error loading chat histories:', e);
      } finally {
        if (mounted) setIsLoaded(true);
      }
    }

    loadHistories();
    return () => { mounted = false; };
  }, []);

  // Save WhatsApp messages to localStorage and Server (Only after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('tmm_wa_chat_history', JSON.stringify(waMessages));
      ApiClient.post('/api/ai-bot/history', { type: 'whatsapp', messages: waMessages }).catch(() => {});
    } catch {}
  }, [waMessages, isLoaded]);

  // Save Voice history to localStorage and Server (Only after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('tmm_voice_command_history', JSON.stringify(voiceHistory));
      ApiClient.post('/api/ai-bot/history', { type: 'voice', messages: voiceHistory }).catch(() => {});
    } catch {}
  }, [voiceHistory, isLoaded]);

  // Auto scroll WhatsApp to bottom
  useEffect(() => {
    if (isWhatsappOpen) {
      setTimeout(() => {
        waChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [waMessages, isWhatsappOpen]);

  // Auto scroll Voice History to bottom
  useEffect(() => {
    if (isVoiceOpen) {
      setTimeout(() => {
        voiceChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [voiceHistory, isVoiceOpen]);

  // Close modals when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsVoiceOpen(false);
        setIsWhatsappOpen(false);
      }
    }

    if (isVoiceOpen || isWhatsappOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isVoiceOpen, isWhatsappOpen]);

  // Close modals on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsVoiceOpen(false);
        setIsWhatsappOpen(false);
      }
    }

    if (isVoiceOpen || isWhatsappOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVoiceOpen, isWhatsappOpen]);

  // Web Speech API initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'tr-TR';
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let current = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        current += event.results[i][0].transcript;
      }
      setTranscript(current);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    (window as any)._tmmRecognition = recognition;
  }, []);

  const toggleListening = () => {
    const recognition = (window as any)._tmmRecognition;
    if (isListening) {
      if (recognition) recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResultMessage(null);
      setIsListening(true);
      if (recognition) {
        try {
          recognition.start();
        } catch (e) {
          console.warn('Recognition start failed:', e);
        }
      }
    }
  };

  const handleRunVoiceCommand = async () => {
    if (!transcript.trim()) return;
    const currentCommand = transcript.trim();
    setProcessing(true);
    setResultMessage(null);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    try {
      const parsed: ParsedCommand = await AIService.parseCommand(currentCommand);
      const res = await CommandExecutor.execute(parsed);
      setResultMessage(res.message);

      // Append to persistent voice history
      setVoiceHistory(prev => [
        ...prev,
        {
          id: `vh-${Date.now()}`,
          command: currentCommand,
          response: res.message,
          time: timeStr,
          date: dateStr,
          timestamp: Date.now(),
          success: res.success
        }
      ]);

      if (res.success) {
        setTranscript('');
      }
    } catch (e: any) {
      const errorMsg = `Hata: ${e.message || 'Komut işlenemedi.'}`;
      setResultMessage(errorMsg);
      setVoiceHistory(prev => [
        ...prev,
        {
          id: `vh-${Date.now()}`,
          command: currentCommand,
          response: errorMsg,
          time: timeStr,
          date: dateStr,
          timestamp: Date.now(),
          success: false
        }
      ]);
    } finally {
      setProcessing(false);
    }
  };

  const handleSendWaMessage = async (overrideText?: string) => {
    const textToSend = overrideText || waInputText;
    if (!textToSend.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    const userMsgId = `msg-u-${Date.now()}`;
    const newMsgs: WaMessage[] = [
      ...waMessages,
      {
        id: userMsgId,
        sender: 'user' as const,
        text: textToSend,
        time: timeStr,
        date: dateStr,
        timestamp: Date.now()
      }
    ];
    setWaMessages(newMsgs);
    if (!overrideText) setWaInputText('');

    // Process via AI Engine
    const parsed = await AIService.parseCommand(textToSend);
    const execRes = await CommandExecutor.execute(parsed);

    setTimeout(() => {
      const botNow = new Date();
      setWaMessages(prev => [
        ...prev,
        {
          id: `msg-b-${Date.now()}`,
          sender: 'bot' as const,
          text: execRes.message,
          time: botNow.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          date: botNow.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
          timestamp: Date.now()
        }
      ]);
    }, 400);
  };

  const clearVoiceHistory = async () => {
    if (confirm('Tüm sesli komut geçmişini temizlemek istiyor musunuz?')) {
      setVoiceHistory([]);
      localStorage.removeItem('tmm_voice_command_history');
      await ApiClient.post('/api/ai-bot/history', { type: 'voice', messages: [] }).catch(() => {});
    }
  };

  const clearWaHistory = async () => {
    if (confirm('Tüm WhatsApp konuşma geçmişini temizlemek istiyor musunuz?')) {
      setWaMessages(DEFAULT_WA_MESSAGES);
      localStorage.setItem('tmm_wa_chat_history', JSON.stringify(DEFAULT_WA_MESSAGES));
      await ApiClient.post('/api/ai-bot/history', { type: 'whatsapp', messages: DEFAULT_WA_MESSAGES }).catch(() => {});
    }
  };

  return (
    <div ref={containerRef}>
      {/* Floating Bottom Right 2 Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Button 1: 🎙️ Voice Command Button */}
        <button
          onClick={() => { setIsVoiceOpen(prev => !prev); setIsWhatsappOpen(false); }}
          className={cn(
            "relative group p-3.5 rounded-2xl glass-surface border border-blue-500/40 text-blue-400 hover:text-white hover:bg-blue-600/20 shadow-2xl transition-all flex items-center justify-center cursor-pointer",
            isListening && "animate-pulse border-red-500 bg-red-900/30 text-red-400"
          )}
          title="Sesli Komut İkonu"
        >
          <Mic className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </button>

        {/* Button 2: 💬 WhatsApp Bot Button */}
        <button
          onClick={() => { setIsWhatsappOpen(prev => !prev); setIsVoiceOpen(false); }}
          className="relative group p-3.5 rounded-2xl glass-surface border border-emerald-500/40 text-emerald-400 hover:text-white hover:bg-emerald-600/20 shadow-2xl transition-all flex items-center justify-center cursor-pointer"
          title="WhatsApp Bot (05305631781)"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-emerald-950" />
        </button>
      </div>

      {/* Voice Command Modal with Scrollable History */}
      {isVoiceOpen && (
        <div className="fixed bottom-24 right-6 w-[430px] max-w-[95vw] bg-[#090D16]/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl z-50 p-5 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Canlı Sesli Asistan & Geçmiş</span>
            </div>
            <div className="flex items-center gap-2">
              {voiceHistory.length > 0 && (
                <button 
                  onClick={clearVoiceHistory}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  title="Sesli komut geçmişini temizle"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => setIsVoiceOpen(false)} className="text-slate-500 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Voice Record Action Bar */}
          <div className="flex items-center gap-3 p-3 bg-blue-950/20 border border-blue-500/30 rounded-2xl">
            <button
              onClick={toggleListening}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl cursor-pointer border shrink-0",
                isListening 
                  ? "bg-red-600/20 border-red-500 text-red-400 animate-pulse ring-4 ring-red-500/20" 
                  : "bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30"
              )}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <div className="text-xs">
              <div className="font-bold text-white">
                {isListening ? '🎙️ Dinleniyor...' : 'Konuşmak için mikrofona basın'}
              </div>
              <div className="text-[11px] text-slate-400">
                {isListening ? 'Konuşmanız bittiğinde tekrar dokunun.' : 'Türkçe sesli komutlarınızı anında işler.'}
              </div>
            </div>
          </div>

          {/* Scrollable Conversation / Command History */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-500 px-1">
              <span className="flex items-center gap-1">
                <History className="w-3 h-3 text-blue-400" />
                Komut Geçmişi
              </span>
              <span>{voiceHistory.length} kayıt</span>
            </div>

            <div className="h-48 bg-[#04060A] border border-slate-800 rounded-xl p-3 overflow-y-auto space-y-2.5 text-xs custom-scrollbar">
              {voiceHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-[11px] text-center space-y-1 py-6">
                  <Mic className="w-5 h-5 text-slate-600" />
                  <span>Henüz sesli komut verilmedi.</span>
                  <span className="text-[10px] text-slate-600">&quot;Bugünkü günlük rutin işleri tamamlandı yap&quot;</span>
                </div>
              ) : (
                voiceHistory.map((item) => (
                  <div key={item.id} className="space-y-1.5 bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 shadow-sm">
                    {/* User Command */}
                    <div className="flex items-start justify-between gap-2 text-blue-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                        <span className="text-white font-semibold">🎙️ &quot;{item.command}&quot;</span>
                      </div>
                      <span className="text-[9px] text-slate-500 shrink-0">{item.date} {item.time}</span>
                    </div>
                    {/* Bot Execution Response */}
                    <div className={cn(
                      "text-[11px] pl-3 border-l-2 py-0.5 whitespace-pre-wrap leading-relaxed",
                      item.success ? "border-emerald-500 text-emerald-300" : "border-red-500 text-red-300"
                    )}>
                      {item.response}
                    </div>
                  </div>
                ))
              )}
              <div ref={voiceChatEndRef} />
            </div>
          </div>

          {/* Current Live Input / Edit Box */}
          <div className="space-y-1.5">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Mikrofondan algılanan sözler veya elle komut yazın..."
              className="w-full h-14 p-2.5 bg-[#05070D] border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 outline-none resize-none focus:border-blue-500"
            />

            <button
              onClick={handleRunVoiceCommand}
              disabled={processing || !transcript.trim()}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{processing ? 'İşleniyor...' : 'Komutu Çalıştır & Kaydet'}</span>
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Bot Quick Modal with Full WhatsApp Style Scrollable Feed */}
      {isWhatsappOpen && (
        <div className="fixed bottom-24 right-6 w-[430px] max-w-[95vw] bg-[#0c1317] border border-emerald-900/40 rounded-3xl shadow-2xl z-50 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-emerald-900/30 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="text-emerald-400 font-bold text-xs">WhatsApp Akıllı Asistan</div>
                <div className="text-[10px] text-emerald-300/70 font-mono">05305631781 • Çevrimiçi</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearWaHistory}
                className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                title="WhatsApp konuşma geçmişini temizle"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setIsWhatsappOpen(false)} className="text-slate-500 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleSendWaMessage('Bugünkü günlük rutin işleri tamamlandı yap')}
              className="px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 text-[10px] text-emerald-300 rounded-lg border border-emerald-800/40 transition-colors"
            >
              ⚡ Rutinleri Tamamla
            </button>
            <button
              onClick={() => handleSendWaMessage('Elektrik 26945 gaz 2592500 su daire 82140 dükkan 203')}
              className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-700 text-[10px] text-slate-300 rounded-lg border border-slate-700 transition-colors"
            >
              + Sayaç Oku
            </button>
            <button
              onClick={() => handleSendWaMessage('Günlük arıza raporunu tamamla ve gönder')}
              className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-700 text-[10px] text-slate-300 rounded-lg border border-slate-700 transition-colors"
            >
              + Rapor Gönder
            </button>
          </div>

          {/* Scrollable Chat Window with Date Badges (WhatsApp Style) */}
          <div className="h-64 bg-[#0b141a] bg-opacity-95 border border-emerald-950/60 rounded-2xl p-3 overflow-y-auto space-y-3 text-xs custom-scrollbar">
            {waMessages.map((m, idx) => {
              const showDateHeader = idx === 0 || waMessages[idx - 1].date !== m.date;
              return (
                <div key={m.id || idx} className="space-y-2">
                  {showDateHeader && (
                    <div className="flex justify-center my-1">
                      <span className="px-2.5 py-0.5 bg-[#182229] border border-slate-800 text-[10px] text-slate-400 rounded-lg font-medium shadow-sm">
                        {m.date || 'Bugün'}
                      </span>
                    </div>
                  )}

                  <div
                    className={cn(
                      "p-2.5 rounded-2xl max-w-[85%] text-xs space-y-1 shadow-md whitespace-pre-wrap leading-relaxed relative",
                      m.sender === 'user'
                        ? "ml-auto bg-[#005c4b] text-[#e9edef] rounded-tr-none border border-emerald-700/40"
                        : "mr-auto bg-[#202c33] text-[#d1d7db] rounded-tl-none border border-slate-700/40"
                    )}
                  >
                    <div>{m.text}</div>
                    <div className="flex items-center justify-end gap-1 text-[9px] text-emerald-200/60 pt-0.5">
                      <span>{m.time}</span>
                      {m.sender === 'user' && (
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={waChatEndRef} />
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={waInputText}
              onChange={(e) => setWaInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendWaMessage()}
              placeholder="WhatsApp komutu veya sayaç endeksi yazın..."
              className="flex-1 px-3 py-2 bg-[#111b21] border border-emerald-900/50 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => handleSendWaMessage()}
              className="p-2.5 bg-[#00a884] hover:bg-[#008f6f] text-slate-950 font-bold rounded-xl transition-all cursor-pointer shadow-lg"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
