import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ArrowRight, MapPin, Shield, Waves, Dumbbell, Car, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const stats = [
  { value: '13+', label: 'Sosyal Tesis' },
  { value: '7/24', label: 'Güvenlik' },
  { value: '5', label: "Dk'da Taksim" },
  { value: '100%', label: 'Kapalı Otopark' },
];

const features = [
  { icon: Waves, label: 'Kapalı Yüzme Havuzu', desc: 'Isıtmalı, dört mevsim kullanım' },
  { icon: Dumbbell, label: 'Fitness Salonu', desc: 'Modern ekipmanlı spor merkezi' },
  { icon: Shield, label: '7/24 Güvenlik', desc: 'Kesintisiz profesyonel güvenlik' },
  { icon: Car, label: 'Kapalı Otopark', desc: 'Güvenli, kapalı araç park alanı' },
  { icon: Zap, label: 'Jeneratör', desc: 'Kesintisiz elektrik güvencesi' },
  { icon: MapPin, label: 'Merkezi Konum', desc: 'Taksim ve Nişantaşı\'na yakın' },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ─── HERO ─── */}
        <section
          style={{
            position: 'relative',
            height: '100vh',
            minHeight: '640px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Background image */}
          <Image
            src="/foto/inanlar-terrrace-feri.jpg"
            alt="TerraceFeri Rezidans"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
          />
          {/* Dark overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.85) 100%)',
            }}
          />

          {/* Content */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              textAlign: 'center',
              padding: '0 24px',
              maxWidth: '900px',
            }}
          >
            <div
              className="animate-fade-in-up"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(9px, 3vw, 11px)',
                fontWeight: 600,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: '#c9a84c',
                marginBottom: '20px',
              }}
            >
              Feriköy, Şişli · İstanbul
            </div>

            <h1
              className="animate-fade-in-up delay-100"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: 'clamp(36px, 10vw, 88px)',
                lineHeight: 1.08,
                color: '#f5f5f5',
                marginBottom: '24px',
                letterSpacing: '-0.01em',
              }}
            >
              Şişli&apos;nin Kalbinde<br />
              <em style={{ fontStyle: 'italic', color: '#e8c97a' }}>Modern Yaşam</em>
            </h1>

            <p
              className="animate-fade-in-up delay-200"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(14px, 4vw, 17px)',
                color: 'rgba(255,255,255,0.65)',
                fontWeight: 300,
                lineHeight: 1.7,
                marginBottom: '40px',
                maxWidth: '520px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Feriköy&apos;ün prestijli noktasında, İstanbul&apos;un merkezinde yaşamanın ayrıcalığını keşfedin.
            </p>

            <div
              className="animate-fade-in-up delay-300"
              style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Link href="/galeri" className="btn-gold">
                Galeriyi Keşfet <ArrowRight size={16} />
              </Link>
              <Link href="/iletisim" className="btn-outline">
                Bize Ulaşın
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            className="scroll-indicator"
            style={{
              position: 'absolute',
              bottom: '36px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)' }}>
              KEŞFET
            </span>
            <ChevronDown size={18} style={{ color: '#c9a84c' }} />
          </div>
        </section>

        {/* ─── STATS ─── */}
        <section style={{ background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div
            className="stats-grid"
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '0 24px',
              display: 'grid',
            }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                style={{
                  padding: '40px 24px',
                  textAlign: 'center',
                  borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                <div className="stat-number">{stat.value}</div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#6a6a6a',
                    marginTop: '6px',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <style>{`
            .stats-grid { grid-template-columns: repeat(4, 1fr); }
            @media (max-width: 640px) {
              .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
            }
            @media (max-width: 400px) {
              .stats-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </section>

        {/* ─── FEATURES ─── */}
        <section style={{ padding: 'clamp(64px, 8vw, 120px) 24px', background: '#0a0a0a' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div className="section-label" style={{ marginBottom: '16px' }}>Olanaklar</div>
              <h2 className="section-title" style={{ marginBottom: '16px' }}>
                Lüks Yaşamın Her Detayı
              </h2>
              <div className="gold-divider" style={{ margin: '20px auto' }} />
              <p className="section-subtitle" style={{ maxWidth: '520px', margin: '0 auto' }}>
                TerraceFeri Rezidans&apos;ta, şehir merkezinde yaşarken ihtiyacınız olan tüm sosyal alanlar kapınızın önünde.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className="amenity-card glass glass-hover"
                    style={{ borderRadius: 0 }}
                  >
                    <div className="amenity-icon" style={{ marginBottom: '16px', display: 'flex' }}>
                      <Icon size={32} style={{ color: '#c9a84c' }} />
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '20px',
                        fontWeight: 400,
                        color: '#f5f5f5',
                        marginBottom: '8px',
                      }}
                    >
                      {feature.label}
                    </h3>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#6a6a6a', fontWeight: 300 }}>
                      {feature.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link href="/sosyal-alanlar" className="btn-outline">
                Tüm Sosyal Alanları Gör <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── GALLERY PREVIEW ─── */}
        <section style={{ padding: 'clamp(64px, 8vw, 120px) 24px', background: '#080808' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div className="section-label" style={{ marginBottom: '12px' }}>Galeri</div>
                <h2 className="section-title">Yaşam Alanları</h2>
              </div>
              <Link href="/galeri" className="btn-outline" style={{ whiteSpace: 'nowrap' }}>
                Tüm Galeri <ArrowRight size={15} />
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gridTemplateRows: 'auto auto',
                gap: '8px',
              }}
            >
              {/* Large image */}
              <div
                className="gallery-item"
                style={{
                  gridRow: '1 / 3',
                  height: '540px',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <Image src="/foto/rpvsis6vmkky1dd5mqrq.jpg" alt="Lobi ve Resepsiyon" fill style={{ objectFit: 'cover' }} />
                <div className="gallery-overlay">
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: '#f5f5f5', opacity: 0 }}>
                    Lobi
                  </span>
                </div>
                <div style={{ position: 'absolute', bottom: '16px', left: '20px', zIndex: 2 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
                    Lobi & Resepsiyon
                  </span>
                </div>
              </div>

              {/* Small images */}
              {[
                { src: '/foto/xcg3kxe9fxegfiznkxyy.jpg', label: 'Kapalı Havuz' },
                { src: '/foto/ewwhjdwhwch85tac74bt.jpg', label: 'Sauna & Spa' },
              ].map((img, i) => (
                <div
                  key={i}
                  className="gallery-item"
                  style={{
                    height: '264px',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Image src={img.src} alt={img.label} fill style={{ objectFit: 'cover' }} />
                  <div className="gallery-overlay" />
                  <div style={{ position: 'absolute', bottom: '16px', left: '20px', zIndex: 2 }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
                      {img.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <style>{`
            @media (max-width: 640px) {
              .gallery-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </section>

        {/* ─── LOCATION CTA ─── */}
        <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(64px, 8vw, 120px) 24px' }}>
          <Image
            src="/foto/ewwhjdwhwch85tac74bt.jpg"
            alt="İstanbul"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 100%)',
            }}
          />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ maxWidth: '600px' }}>
              <div className="section-label" style={{ marginBottom: '20px' }}>Konum</div>
              <h2 className="section-title" style={{ marginBottom: '20px' }}>
                İstanbul&apos;un Tam Merkezinde
              </h2>
              <div className="gold-divider" style={{ marginBottom: '24px' }} />
              <p className="section-subtitle" style={{ marginBottom: '32px' }}>
                Taksim&apos;e 5 dakika, Nişantaşı&apos;na yürüme mesafesinde, Cevahir AVM&apos;ye 5 dakika.
                Şehrin her noktasına kolayca ulaşın.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
                {['Taksim — ~5 dk', 'Nişantaşı — ~5 dk', 'Cevahir AVM — ~5 dk', 'Mecidiyeköy — ~5 dk'].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '6px', height: '6px', background: '#c9a84c', borderRadius: '50%', flexShrink: 0 }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/konum" className="btn-gold">
                Haritada Görüntüle <MapPin size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── CONTACT CTA ─── */}
        <section style={{ padding: 'clamp(64px, 8vw, 100px) 24px', background: '#0d0d0d', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="section-label" style={{ marginBottom: '16px' }}>İletişim</div>
            <h2 className="section-title" style={{ marginBottom: '20px' }}>
              Bizimle İletişime Geçin
            </h2>
            <div className="gold-divider" style={{ margin: '0 auto 24px' }} />
            <p className="section-subtitle" style={{ marginBottom: '36px' }}>
              Sorularınız için bize ulaşabilir, yönetim ofisimizi ziyaret edebilirsiniz.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/iletisim" className="btn-gold">
                İletişim Formu <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
