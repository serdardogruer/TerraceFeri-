import type { Metadata } from 'next';
import { MapPin, Navigation, Train, Bus, ShoppingBag, GraduationCap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Konum — TerraceFeri Rezidans',
  description: 'Yay Meydanı Caddesi No:15, Şişli, İstanbul. Taksim ve Nişantaşı\'na 5 dakika mesafede.',
};

const distances = [
  { place: 'Taksim', time: '~5 dk', cat: 'Ulaşım' },
  { place: 'Nişantaşı', time: '~5 dk', cat: 'Alışveriş' },
  { place: 'Mecidiyeköy', time: '~5 dk', cat: 'Ulaşım' },
  { place: 'Cevahir AVM', time: '~5 dk', cat: 'Alışveriş' },
  { place: "City's AVM", time: '~8 dk', cat: 'Alışveriş' },
  { place: 'İstiklal Caddesi', time: '~10 dk', cat: 'Eğlence' },
  { place: 'Bilgi Üniversitesi', time: '~10 dk', cat: 'Eğitim' },
  { place: 'Beykent Üniversitesi', time: '~12 dk', cat: 'Eğitim' },
];

const nearbyCategories = [
  {
    icon: ShoppingBag,
    title: 'Alışveriş & Eğlence',
    items: ['Cevahir AVM', "City's AVM", 'İstiklal Caddesi', 'Nişantaşı Boutique'],
  },
  {
    icon: Train,
    title: 'Ulaşım Merkezleri',
    items: ['Taksim Meydanı', 'Mecidiyeköy Metro', 'Şişli-Mecidiyeköy Metro', 'Otobüs Hatları'],
  },
  {
    icon: GraduationCap,
    title: 'Eğitim',
    items: ['İstanbul Bilgi Üniversitesi', 'Beykent Üniversitesi'],
  },
  {
    icon: Bus,
    title: 'Toplu Taşıma',
    items: ['Metro M2 Hattı', 'İETT Otobüs Hatları', 'Metrobüs Bağlantısı', 'Taksi Durakları'],
  },
];

export default function LocationPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '72px' }}>
        {/* Header */}
        <section style={{ padding: 'clamp(64px, 10vw, 120px) 24px', background: '#0d0d0d' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div className="section-label" style={{ marginBottom: '16px' }}>Konum</div>
            <h1 className="section-title" style={{ marginBottom: '16px' }}>
              İstanbul&apos;un Tam Merkezinde
            </h1>
            <div className="gold-divider" style={{ marginBottom: '20px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={16} style={{ color: '#c9a84c', flexShrink: 0 }} />
              <span className="section-subtitle">
                Yay Meydanı Caddesi No:15, 34377 Şişli / İstanbul
              </span>
            </div>
          </div>
        </section>

        {/* Map */}
        <section style={{ background: '#080808' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 8px' }}>
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3009.028765!2d28.9772!3d41.0605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab63c5c43e1f5%3A0x1cd8bcd5a47f45df!2sFeriky%C3%B6y%2C%20%C5%9Ei%C5%9Fli%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.8)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="TerraceFeri Rezidans Konum"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Yay+Meydanı+Caddesi+No:15+Şişli+İstanbul"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
                style={{ fontSize: '13px', padding: '12px 24px' }}
              >
                <Navigation size={15} /> Yol Tarifi Al
              </a>
            </div>
          </div>
        </section>

        {/* Distances */}
        <section style={{ padding: 'clamp(64px, 8vw, 100px) 24px', background: '#0a0a0a' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div className="section-label" style={{ marginBottom: '12px' }}>Yakınlık</div>
              <h2 className="section-title">Her Yere Yakın</h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1px',
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              {distances.map((item, i) => (
                <div
                  key={i}
                  className="glass glass-hover"
                  style={{
                    padding: '24px 28px',
                    borderRadius: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '20px',
                        fontWeight: 400,
                        color: '#f5f5f5',
                        marginBottom: '4px',
                      }}
                    >
                      {item.place}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '10px',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#5a5a5a',
                      }}
                    >
                      {item.cat}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '24px',
                      fontWeight: 300,
                      color: '#c9a84c',
                    }}
                  >
                    {item.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nearby Categories */}
        <section style={{ padding: 'clamp(48px, 6vw, 80px) 24px', background: '#080808' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div className="section-label" style={{ marginBottom: '12px' }}>Çevre</div>
              <h2 className="section-title">Yakın Çevre</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {nearbyCategories.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <div key={i} className="glass" style={{ padding: '28px', borderRadius: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                      <Icon size={20} style={{ color: '#c9a84c' }} />
                      <h3
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '12px',
                          fontWeight: 600,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#c9a84c',
                        }}
                      >
                        {cat.title}
                      </h3>
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {cat.items.map((item) => (
                        <li
                          key={item}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '14px',
                            color: '#7a7a7a',
                            fontWeight: 300,
                          }}
                        >
                          <div
                            style={{
                              width: '4px',
                              height: '4px',
                              background: '#c9a84c',
                              borderRadius: '50%',
                              flexShrink: 0,
                            }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
