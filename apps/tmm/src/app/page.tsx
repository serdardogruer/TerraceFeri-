import Link from 'next/link';
import { 
  Building2, ShieldCheck, Zap, Sparkles, PhoneCall, 
  MapPin, Clock, ArrowRight, CheckCircle2, UserCheck, 
  Wifi, Car, Activity, Lock, MessageSquare, ChevronRight
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#060B14] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* ═══════════════════════════════════════════════
          1. HEADER / NAVBAR
         ═══════════════════════════════════════════════ */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#060B14]/80 backdrop-blur-xl border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-[#C5A55B]/40 flex items-center justify-center shadow-lg shadow-amber-950/20 group-hover:border-[#C5A55B] transition-all">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#C5A55B]">
                <rect x="9.5" y="7" width="5" height="2.5" />
                <rect x="6.5" y="11.5" width="11" height="2.5" />
                <rect x="3.5" y="16" width="17" height="2.5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="text-lg tracking-widest leading-none font-bold">
                <span className="text-white">TERRACE</span>
                <span className="text-[#C5A55B]">FERİ</span>
              </div>
              <span className="text-[8px] text-slate-400 font-bold tracking-[0.3em] mt-1">
                PREMIUM RESIDENCE
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#hakkimizda" className="hover:text-[#C5A55B] transition-colors">Hakkımızda</a>
            <a href="#ayricaliklar" className="hover:text-[#C5A55B] transition-colors">Ayrıcalıklar</a>
            <a href="#hizmetler" className="hover:text-[#C5A55B] transition-colors">Hizmetler</a>
            <a href="#iletisim" className="hover:text-[#C5A55B] transition-colors">İletişim</a>
          </nav>

          {/* Right CTA */}
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/905305631781"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl glass-surface border border-emerald-500/30 text-emerald-400 hover:text-white hover:bg-emerald-600/20 text-xs font-semibold transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Danışma</span>
            </a>
            
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A55B] to-[#9D7E38] hover:from-[#d6b66a] hover:to-[#ae8d42] text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/40 border border-[#e2c785]/50 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>Yönetim Girişi (TMM)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          2. HERO SECTION
         ═══════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Glow & Ambient Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gradient-to-tr from-blue-600/15 via-amber-500/10 to-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-medium text-slate-300 mb-8 backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A55B]" />
            <span>Şişli Feriköy&apos;ün Kalbinde Prestijli Yaşam</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Ayrıcalıklı, Konforlu ve <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-slate-200 to-[#C5A55B] bg-clip-text text-transparent">
              Akıllı Rezidans Yaşamı
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            TerraceFeri, modern mimarisi, 7/24 üst düzey güvenliği, akıllı tesis otomasyonu ve merkezi konumuyla sakinlerine benzersiz bir rezidans deneyimi sunar.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/admin"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#C5A55B] to-[#A0823B] hover:from-[#d6b76c] hover:to-[#b09146] text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-950/40 border border-[#e6cb8e]/60 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Building2 className="w-5 h-5" />
              <span>TMM Yönetim Paneline Geç</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#ayricaliklar"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-surface hover:bg-white/[0.08] text-white text-sm font-semibold border border-white/[0.12] flex items-center justify-center gap-2 transition-all"
            >
              <span>Rezidansı Keşfet</span>
            </a>
          </div>

          {/* Mini KPI Showcase */}
          <div className="mt-16 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-6 glass-card rounded-2xl border border-white/[0.08] text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-white">88</p>
              <span className="text-xs text-slate-400 mt-1 block">Lüks Daire</span>
            </div>
            <div className="p-6 glass-card rounded-2xl border border-white/[0.08] text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#C5A55B]">22</p>
              <span className="text-xs text-slate-400 mt-1 block">Sosyal & Tesis Alanı</span>
            </div>
            <div className="p-6 glass-card rounded-2xl border border-white/[0.08] text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-400">7/24</p>
              <span className="text-xs text-slate-400 mt-1 block">Güvenlik & Resepsiyon</span>
            </div>
            <div className="p-6 glass-card rounded-2xl border border-white/[0.08] text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400">%100</p>
              <span className="text-xs text-slate-400 mt-1 block">Akıllı Tesis Yönetimi</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          3. FEATURES / AYRICALIKLAR
         ═══════════════════════════════════════════════ */}
      <section id="ayricaliklar" className="py-20 relative border-t border-white/[0.06] bg-[#080E1A]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-[0.25em] text-[#C5A55B] mb-2">
              AYRICALIKLAR
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Modern Yaşamın Tüm Konforu Bir Arada
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 glass-card rounded-3xl border border-white/[0.08] hover:border-amber-500/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#C5A55B] mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">7/24 İleri Düzey Güvenlik</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Rezidans giriş ve çevrelerinde 24 saat kesintisiz profesyonel güvenlik ekibi, CCTV kamera izleme ve kontrollü geçiş sistemi.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 glass-card rounded-3xl border border-white/[0.08] hover:border-blue-500/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Kapalı Otopark & Plaka Tanıma</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Her daireye özel kapalı otopark alanı ve otomatik plaka tanıma sistemi ile güvenli, hızlı ve konforlu araç girişi.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 glass-card rounded-3xl border border-white/[0.08] hover:border-emerald-500/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Akıllı Sayaç & Enerji Takibi</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Elektrik, su ve kalorimetre tüketimlerinin dijital ortamda şeffaf ve anlık takibi ile maksimum enerji verimliliği.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 glass-card rounded-3xl border border-white/[0.08] hover:border-purple-500/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Profesyonel Teknik Servis</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Tesis bünyesindeki uzman teknik personel ile periyodik asansör, jeneratör, hidrofor bakımları ve hızlı arıza müdahalesi.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 glass-card rounded-3xl border border-white/[0.08] hover:border-cyan-500/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Sosyal Tesis & Yaşam Alanları</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Fitness merkezi, dinlenme salonları, peyzaj bahçeleri ve sakinlerimizin sosyal ihtiyaçlarına yönelik özel alanlar.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 glass-card rounded-3xl border border-white/[0.08] hover:border-rose-500/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Dijital Asistan & WhatsApp Destek</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Sakinlerimizin arıza bildirimleri, duyurular ve yönetimle iletişimini kolaylaştıran 7/24 akıllı asistan altyapısı.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          4. MANAGEMENT CTA BANNER
         ═══════════════════════════════════════════════ */}
      <section id="hakkimizda" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-14 glass-card rounded-3xl border border-[#C5A55B]/30 relative overflow-hidden bg-gradient-to-br from-[#0c1424] to-[#060B14]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A55B]/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl text-center lg:text-left">
                <span className="text-xs uppercase tracking-widest text-[#C5A55B] font-bold">
                  TERRACEFERİ YÖNETİM PORTALI
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                  Tesis ve Rezidans Operasyonları
                </h2>
                <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                  Yönetim kurulu, teknik personel ve idari ekipler için hazırlanmış kapsamlı TMM (Tesis Yönetim Modülü) sistemiyle tüm operasyonlar anlık olarak yönetilmektedir.
                </p>
              </div>

              <Link
                href="/admin"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#C5A55B] to-[#9E7F3A] hover:from-[#d8b96e] hover:to-[#b3944a] text-slate-950 font-bold text-sm shadow-xl shadow-amber-950/40 border border-[#f0d599]/60 flex items-center gap-3 shrink-0 transition-all transform hover:-translate-y-0.5"
              >
                <span>Yönetici Paneline Giriş Yap</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          5. CONTACT / İLETİŞİM
         ═══════════════════════════════════════════════ */}
      <section id="iletisim" className="py-20 border-t border-white/[0.06] bg-[#070C16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 glass-card rounded-2xl border border-white/[0.06] flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-[#C5A55B] border border-amber-500/20 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Rezidans Adresi</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Feriköy Mahallesi, Şişli / İstanbul, Türkiye
                </p>
              </div>
            </div>

            <div className="p-6 glass-card rounded-2xl border border-white/[0.06] flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Yönetim & Danışma</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  +90 530 563 17 81 <br />
                  admin@terraceferi.com
                </p>
              </div>
            </div>

            <div className="p-6 glass-card rounded-2xl border border-white/[0.06] flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Çalışma Saatleri</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Resepsiyon & Güvenlik: 7/24 Kesintisiz <br />
                  Yönetim Ofisi: Hafta İçi 09:00 - 18:00
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          6. FOOTER
         ═══════════════════════════════════════════════ */}
      <footer className="py-10 border-t border-white/[0.08] bg-[#040810]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">TerraceFeri Premium Residence</span>
            <span>•</span>
            <span>Tüm hakları saklıdır © 2026</span>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/admin" className="text-slate-400 hover:text-[#C5A55B] transition-colors">
              Yönetim Paneli (TMM)
            </Link>
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
              Giriş Yap
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
