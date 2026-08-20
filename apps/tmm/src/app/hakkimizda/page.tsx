import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Hakkımızda — TerraceFeri Rezidans',
  description: 'TerraceFeri Rezidans projesi hakkında bilgi alın. Feriköy, Şişli\'de premium yaşam deneyimi.',
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '72px' }}>
        {/* Page Header */}
        <section
          style={{
            position: 'relative',
            padding: 'clamp(64px, 10vw, 140px) 24px',
            overflow: 'hidden',
            background: '#0d0d0d',
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
            <div className="section-label" style={{ marginBottom: '16px' }}>Hakkımızda</div>
            <h1 className="section-title" style={{ marginBottom: '20px', maxWidth: '600px' }}>
              Şehrin Merkezinde<br />
              <em style={{ fontStyle: 'italic', color: '#c9a84c' }}>Prestijli Yaşam</em>
            </h1>
            <div className="gold-divider" />
          </div>
        </section>

        {/* Story */}
        <section style={{ padding: 'clamp(64px, 8vw, 120px) 24px', background: '#0a0a0a' }}>
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '64px',
              alignItems: 'center',
            }}
          >
            <div>
              <div className="section-label" style={{ marginBottom: '16px' }}>Proje Hikayesi</div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  fontWeight: 300,
                  color: '#f5f5f5',
                  marginBottom: '24px',
                  lineHeight: 1.2,
                }}
              >
                Feriköy&apos;ün Kalbinde Doğan Bir Vizyon
              </h2>
              <p className="section-subtitle" style={{ marginBottom: '20px' }}>
                TerraceFeri Rezidans, İstanbul&apos;un en dinamik semtlerinden Feriköy&apos;de hayat bulan,
                şehir merkezinin sunduğu tüm olanakları premium bir yaşam deneyimiyle birleştiren
                prestijli bir konut projesidir.
              </p>
              <p className="section-subtitle" style={{ marginBottom: '20px' }}>
                Yay Meydanı Caddesi üzerinde konumlanan rezidans, Taksim, Nişantaşı ve
                Mecidiyeköy&apos;e yakınlığıyla İstanbul&apos;un tam kalbinde yer almaktadır.
              </p>
              <p className="section-subtitle">
                İnanlar inşaat firmasının kaliteli işçiliği ve titiz tasarım anlayışıyla inşa edilen
                TerraceFeri, sakinlerine sadece bir konut değil; lüks, güven ve konforu bir arada
                sunan eksiksiz bir yaşam alanı sunmaktadır.
              </p>
            </div>

            <div style={{ position: 'relative', height: '480px', borderRadius: '2px', overflow: 'hidden' }}>
              <Image src="/foto/rpvsis6vmkky1dd5mqrq.jpg" alt="TerraceFeri Rezidans Lobi" fill style={{ objectFit: 'cover' }} />
              <div
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '24px',
                  right: '24px',
                }}
              >
                <div
                  className="glass"
                  style={{
                    padding: '20px 24px',
                    borderRadius: '2px',
                    display: 'inline-block',
                  }}
                >
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '4px' }}>
                    İnşaat Firması
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, color: '#f5f5f5' }}>
                    İnanlar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{ padding: 'clamp(64px, 8vw, 120px) 24px', background: '#080808' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div className="section-label" style={{ marginBottom: '16px' }}>Yaşam Konsepti</div>
              <h2 className="section-title">Neden TerraceFeri?</h2>
              <div className="gold-divider" style={{ margin: '20px auto' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
              {[
                {
                  num: '01',
                  title: 'Merkezi Konum',
                  desc: 'Taksim, Nişantaşı, Mecidiyeköy ve İstiklal Caddesi\'ne dakikalar mesafesinde.',
                },
                {
                  num: '02',
                  title: 'Premium Olanaklar',
                  desc: 'Kapalı yüzme havuzu, fitness salonu, sauna ve 13\'ü aşkın sosyal tesis.',
                },
                {
                  num: '03',
                  title: 'Güvenli Yaşam',
                  desc: '7/24 profesyonel güvenlik hizmeti, kapalı otopark ve modern güvenlik sistemleri.',
                },
                {
                  num: '04',
                  title: 'Konforlu Altyapı',
                  desc: 'Merkezi ısıtma, ısı pay ölçer, jeneratör ve teknik servis hizmeti.',
                },
              ].map((item) => (
                <div key={item.num} className="glass glass-hover amenity-card" style={{ borderRadius: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '56px',
                      fontWeight: 300,
                      color: 'rgba(201, 168, 76, 0.15)',
                      lineHeight: 1,
                      marginBottom: '16px',
                    }}
                  >
                    {item.num}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '22px',
                      fontWeight: 400,
                      color: '#f5f5f5',
                      marginBottom: '12px',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#6a6a6a', fontWeight: 300, lineHeight: 1.7 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: 'clamp(64px, 8vw, 100px) 24px', background: '#0d0d0d', textAlign: 'center' }}>
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2 className="section-title" style={{ marginBottom: '20px' }}>Daha Fazlasını Keşfet</h2>
            <div className="gold-divider" style={{ margin: '0 auto 24px' }} />
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/galeri" className="btn-gold">
                Galeri <ArrowRight size={15} />
              </Link>
              <Link href="/sosyal-alanlar" className="btn-outline">
                Sosyal Alanlar
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
