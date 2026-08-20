'use client';

import React, { useState } from 'react';
import { 
  Send, 
  User, 
  Shield, 
  Wrench, 
  MessageSquare, 
  Clock, 
  CheckCheck, 
  Check, 
  Phone,
  Info
} from 'lucide-react';
import { MobileHeader } from '@/components/mobile/MobileHeader';

interface Message {
  id: string;
  sender: 'user' | 'management';
  text: string;
  time: string;
  status: 'read' | 'delivered';
}

export default function SakinMesajlarPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'management',
      text: 'Merhaba, A Blok 42 numaralı daire talebiniz hakkında: Kat holü aydınlatması için teknik personelimiz görevlendirilmiştir.',
      time: '10:15',
      status: 'read'
    },
    {
      id: '2',
      sender: 'user',
      text: 'Bilgi için teşekkürler, bugün saat 14:00 sonrasında müsait olacağız.',
      time: '10:20',
      status: 'read'
    },
    {
      id: '3',
      sender: 'management',
      text: 'Teknik şefimize iletildi, 14:30 civarı kontrol sağlanacaktır.',
      time: '10:22',
      status: 'read'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered'
    };

    setMessages([...messages, newMsg]);
    setInputMessage('');
  };

  return (
    <div className="space-y-4">
      <MobileHeader
        title="Yönetim & Danışma"
        subtitle="Doğrudan canlı talep ve operasyon mesajlaşması"
        showBack={true}
        backUrl="/sakin"
        type="sakin"
      />

      {/* İletişim Kartı */}
      <div className="p-3 bg-[#070A11] border border-[#151B2B] rounded-xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Terrace Feri Yönetim Masası</h3>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Çevrimiçi
            </span>
          </div>
        </div>
        <a 
          href="tel:02120000000"
          className="px-3 py-1.5 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Phone className="w-3.5 h-3.5" /> Ara
        </a>
      </div>

      {/* Mesaj Akışı */}
      <div className="space-y-3 p-3 bg-[#070A11]/60 border border-[#151B2B] rounded-xl min-h-[350px] max-h-[420px] overflow-y-auto flex flex-col justify-end">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
            }`}
          >
            <div
              className={`p-3 rounded-xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-950/40 border border-indigo-500/30 text-slate-100 rounded-tr-none'
                  : 'bg-[#0A101D] border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 px-1">
              <span>{msg.time}</span>
              {msg.sender === 'user' && (
                <CheckCheck className="w-3 h-3 text-indigo-400" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mesaj Gönderim Alanı (Standart Buton Kural 3) */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Yönetime mesaj yazın..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 px-3.5 py-2.5 bg-[#070A11] border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-indigo-900/20 hover:bg-indigo-900/40 border border-indigo-500/40 text-indigo-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
