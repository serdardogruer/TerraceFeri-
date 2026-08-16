'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Phone, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export default function NewPersonnelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    tcNo: '',
    shiftStartTime: '08:00',
    shiftEndTime: '18:00',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/personnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        router.push('/admin/personnel');
        router.refresh();
      } else {
        const data = await res.json();
        alert('Hata: ' + (data.error || 'Bilinmeyen bir hata oluştu'));
      }
    } catch (err) {
      console.error(err);
      alert('Sistemsel bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/personnel" className="p-2 hover:bg-[#111827] rounded-lg transition-colors text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            Yeni Personel Ekle
          </h1>
          <p className="text-slate-400 mt-1">Sisteme yeni bir personel tanımlayın.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0C1220] border border-slate-800/60 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 space-y-8">
          
          {/* Kişisel Bilgiler */}
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-orange-400" /> Kişisel Bilgiler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Ad *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-[#050914] border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-white focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
                  placeholder="Personel Adı"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Soyad *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-[#050914] border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-white focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
                  placeholder="Personel Soyadı"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Telefon Numarası *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-[#050914] border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-white focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
                  placeholder="05XX XXX XX XX"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">TC Kimlik No (İsteğe Bağlı)</label>
                <input
                  type="text"
                  value={formData.tcNo}
                  onChange={(e) => setFormData({...formData, tcNo: e.target.value})}
                  className="w-full bg-[#050914] border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-white focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
                  placeholder="11 Haneli TC Kimlik"
                />
              </div>
            </div>
          </div>

          {/* Vardiya Bilgileri */}
          <div className="pt-6 border-t border-slate-800/60">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-orange-400" /> Vardiya Saatleri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Giriş Saati (Standart)</label>
                <input
                  type="time"
                  required
                  value={formData.shiftStartTime}
                  onChange={(e) => setFormData({...formData, shiftStartTime: e.target.value})}
                  className="w-full bg-[#050914] border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-white focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Çıkış Saati (Standart)</label>
                <input
                  type="time"
                  required
                  value={formData.shiftEndTime}
                  onChange={(e) => setFormData({...formData, shiftEndTime: e.target.value})}
                  className="w-full bg-[#050914] border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-white focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
                />
              </div>
            </div>
          </div>

        </div>

        <div className="p-4 bg-[#080d18] border-t border-slate-800/60 flex justify-end gap-3">
          <Link href="/admin/personnel" className="px-6 py-2.5 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 text-sm font-semibold rounded-lg transition-colors">
            İptal
          </Link>
          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-orange-900/20 border border-orange-500/40 hover:bg-orange-900/40 disabled:opacity-50 text-orange-400 text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? 'Kaydediliyor...' : (
              <>
                <Save className="w-4 h-4" />
                Personeli Kaydet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
