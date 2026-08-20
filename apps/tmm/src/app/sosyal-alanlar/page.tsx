import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Sosyal Alanlar — TerraceFeri Rezidans',
  description: 'Kapalı yüzme havuzu, fitness salonu, sauna, kapalı otopark ve daha fazlası. TerraceFeri\'nin tüm sosyal olanakları.',
};

const amenities = [
  {
    icon: '🏊',
    title: 'Kapalı Yüzme Havuzu',
    desc: 'Isıtmalı kapalı yüzme havuzumuz, dört mevsim yüzme keyfi sunar. Modern filtre sistemi ve profesyonel bakım ekibi ile hijyenik ve konforlu bir yüzme deneyimi yaşayın.',
    tags: ['Isıtmalı', 'Dört Mevsim', 'Hijyenik'],
  },
  {
    icon: '💪',
    title: 'Fitness Salonu',
    desc: 'Modern kardiyovasküler ekipmanlar, ağırlık istasyonları ve fonksiyonel egzersiz alanlarıyla donatılmış fitness merkezimizde sağlıklı bir yaşam tarzını benimseyin.',
    tags: ['Modern Ekipman', 'Kardiyovasküler', 'Ağırlık Antrenmanı'],
  },
  {
    icon: '🧖‍♂️',
    title: 'Bay Sauna',
    desc: 'Geleneksel Fin sauna deneyimini modernize eden özel bay saunamız, günün yorgunluğunu atmak için ideal bir ortam sunmaktadır.',
    tags: ['Özel Alan', 'Fin Sauna', 'Detoks'],
  },
  {
    icon: '🧖‍♀️',
    title: 'Bayan Sauna',
    desc: 'Sakinlerin özel ve huzurlu bir ortamda dinlenebileceği bayan saunamız, hem beden hem de zihin için ideal bir dinlenme köşesidir.',
    tags: ['Özel Alan', 'Huzurlu', 'Rahatlatıcı'],
  },
  {
    icon: '🚗',
    title: 'Kapalı Otopark',
    desc: 'Güvenli kapalı otopark alanımız ile araçlarınız her hava koşulunda koruma altındadır. 7/24 güvenlik kamerası ile izlenen otopark, hırsızlık ve vandalizme karşı tam güvenlik sağlar.',
    tags: ['7/24 Kamera', 'Kapalı Alan', 'Güvenli'],
  },
  {
    icon: '🛡️',
    title: '7/24 Güvenlik',
    desc: 'Profesyonel güvenlik personelimiz ve modern güvenlik sistemlerimiz ile rezidansımız günün her saatinde korunmaktadır. Güvenliğiniz bizim önceliğimizdir.',
    tags: ['Profesyonel Personel', '7/24', 'Kamera Sistemi'],
  },
  {
    icon: '🛗',
    title: 'Asansör',
    desc: 'Modernize edilmiş yolcu ve yük asansörlerimiz, konforlu ve hızlı dikey ulaşım imkânı sunar. Düzenli bakım ve denetimlerle her zaman güvenli çalışmaktadır.',
    tags: ['Modernize', 'Hızlı', 'Güvenilir'],
  },
  {
    icon: '⚡',
    title: 'Jeneratör',
    desc: 'Güçlü yedek jeneratörümüz sayesinde olası elektrik kesintilerinde yaşam hiçbir aksamaya uğramadan devam eder. Güç kesintisi yoktur.',
    tags: ['Kesintisiz Güç', 'Otomatik Devreye Girme', 'Yedek Sistem'],
  },
  {
    icon: '🔥',
    title: 'Merkezi Isıtma',
    desc: 'Enerji verimli merkezi ısıtma sistemi ile kış aylarında eviniz her zaman konforlu bir sıcaklıkta olur. Eşit ısı dağılımı ve optimal enerji tüketimi.',
    tags: ['Enerji Verimli', 'Eşit Dağılım', 'Konforlu'],
  },
  {
    icon: '🌡️',
    title: 'Isı Pay Ölçer',
    desc: 'Bireysel ısı tüketiminizi ölçen ısı pay ölçer sistemi ile yalnızca kullandığınız kadar ısıtma bedeli ödersiniz. Adaletli ve şeffaf tüketim takibi.',
    tags: ['Bireysel Sayaç', 'Adaletli Ödeme', 'Şeffaf'],
  },
  {
    icon: '🚨',
    title: 'Yangın Güvenlik Sistemi',
    desc: 'Standartları aşan yangın algılama ve söndürme sistemimiz, olası yangın risklerine karşı sakinleri ve mülkleri korur. Tüm katlarda aktif sistem mevcuttur.',
    tags: ['Algılama Sistemi', 'Tüm Katlar', 'Sertifikalı'],
  },
  {
    icon: '💧',
    title: 'Su Deposu & Hidrofor',
    desc: 'Büyük kapasiteli su deposu ve modern hidrofor sistemi ile olası su kesintilerinde bile kesintisiz su temini sağlanmaktadır.',
    tags: ['Büyük Kapasite', 'Hidrofor', 'Kesintisiz Su'],
  },
  {
    icon: '🔧',
    title: 'Teknik Servis Hizmeti',
    desc: 'Deneyimli teknik ekibimiz, tesisat, elektrik ve mekanik sistemlerdeki arızalara hızlı müdahale ederek yaşam kalitenizin sürekli yüksek kalmasını sağlar.',
    tags: ['Hızlı Müdahale', 'Deneyimli Ekip', 'Kapsamlı Hizmet'],
  },
];

export default function SocialAreasPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '72px' }}>
        {/* Header */}
        <section style={{ padding: 'clamp(64px, 10vw, 120px) 24px', background: '#0d0d0d' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div className="section-label" style={{ marginBottom: '16px' }}>Sosyal Alanlar</div>
            <h1 className="section-title" style={{ marginBottom: '16px' }}>
              Lüksün Her Detayı<br />
              <em style={{ fontStyle: 'italic', color: '#c9a84c' }}>Kapınızın Önünde</em>
            </h1>
            <div className="gold-divider" style={{ marginBottom: '20px' }} />
            <p className="section-subtitle" style={{ maxWidth: '560px' }}>
              TerraceFeri Rezidans&apos;ta yaşamak, 13&apos;ü aşkın premium sosyal tesise erişim anlamına gelir.
              Her ihtiyacınız için kusursuz bir çözüm.
            </p>
          </div>
        </section>

        {/* Amenities Grid */}
        <section style={{ padding: 'clamp(48px, 6vw, 80px) 24px', background: '#080808' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1px',
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              {amenities.map((item, i) => (
                <div
                  key={i}
                  className="glass glass-hover"
                  style={{
                    padding: '36px 32px',
                    borderRadius: 0,
                    transition: 'all 0.4s ease',
                  }}
                >
                  {/* Icon */}
                  <div style={{ fontSize: '40px', marginBottom: '20px', display: 'block' }}>
                    {item.icon}
                  </div>

                  {/* Title */}
                  <h2
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '22px',
                      fontWeight: 400,
                      color: '#f5f5f5',
                      marginBottom: '12px',
                      lineHeight: 1.3,
                    }}
                  >
                    {item.title}
                  </h2>

                  {/* Description */}
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                      color: '#6a6a6a',
                      lineHeight: 1.7,
                      fontWeight: 300,
                      marginBottom: '20px',
                    }}
                  >
                    {item.desc}
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#c9a84c',
                          border: '1px solid rgba(201,168,76,0.2)',
                          padding: '4px 10px',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
