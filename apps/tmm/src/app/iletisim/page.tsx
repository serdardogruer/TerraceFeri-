import type { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'İletişim — TerraceFeri Rezidans',
  description: 'TerraceFeri Rezidans yönetim ofisi iletişim bilgileri. Bize ulaşın.',
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '72px' }}>
        {/* Header */}
        <section style={{ padding: 'clamp(64px, 10vw, 120px) 24px', background: '#0d0d0d' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div className="section-label" style={{ marginBottom: '16px' }}>İletişim</div>
            <h1 className="section-title" style={{ marginBottom: '16px' }}>
              Bizimle İletişime Geçin
            </h1>
            <div className="gold-divider" style={{ marginBottom: '20px' }} />
            <p className="section-subtitle" style={{ maxWidth: '560px' }}>
              Yönetim ofisimizle iletişime geçmek, soru ve taleplerinizi iletmek için aşağıdaki bilgileri kullanabilir veya formu doldurabilirsiniz.
            </p>
          </div>
        </section>

        {/* Content */}
        <section style={{ padding: 'clamp(48px, 6vw, 80px) 24px', background: '#0a0a0a' }}>
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '64px',
            }}
          >
            {/* Info */}
            <div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '32px',
                  fontWeight: 400,
                  color: '#f5f5f5',
                  marginBottom: '32px',
                }}
              >
                İletişim Bilgileri
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(201, 168, 76, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={20} style={{ color: '#c9a84c' }} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f5f5f5', marginBottom: '8px' }}>
                      Adres
                    </h3>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', color: '#9a9a9a', lineHeight: 1.6, fontWeight: 300 }}>
                      Yay Meydanı Caddesi No:15<br />
                      34377 Şişli / İstanbul
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(201, 168, 76, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={20} style={{ color: '#c9a84c' }} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f5f5f5', marginBottom: '8px' }}>
                      Telefon
                    </h3>
                    <a href="tel:4442002" style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', color: '#9a9a9a', textDecoration: 'none', fontWeight: 300 }}>
                      444 2 002
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(201, 168, 76, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={20} style={{ color: '#c9a84c' }} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f5f5f5', marginBottom: '8px' }}>
                      E-Posta
                    </h3>
                    <a href="mailto:info@terraceferi.com" style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', color: '#9a9a9a', textDecoration: 'none', fontWeight: 300 }}>
                      info@terraceferi.com
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(201, 168, 76, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={20} style={{ color: '#c9a84c' }} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f5f5f5', marginBottom: '8px' }}>
                      Çalışma Saatleri
                    </h3>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', color: '#9a9a9a', lineHeight: 1.6, fontWeight: 300 }}>
                      Pazartesi - Cuma: 09:00 - 18:00<br />
                      Cumartesi: 09:00 - 13:00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="glass" style={{ padding: '40px', borderRadius: '2px' }}>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '28px',
                  fontWeight: 400,
                  color: '#f5f5f5',
                  marginBottom: '24px',
                }}
              >
                Bize Ulaşın
              </h2>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label className="form-label">Ad Soyad</label>
                    <input type="text" className="form-input" placeholder="Adınız ve Soyadınız" />
                  </div>
                  <div>
                    <label className="form-label">Telefon</label>
                    <input type="tel" className="form-input" placeholder="05XX XXX XX XX" />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">E-Posta</label>
                  <input type="email" className="form-input" placeholder="ornek@email.com" />
                </div>
                
                <div>
                  <label className="form-label">Konu</label>
                  <select className="form-input" style={{ appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Seçiniz...</option>
                    <option value="bilgi">Bilgi Alma</option>
                    <option value="sikayet">Şikayet & Öneri</option>
                    <option value="diger">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Mesajınız</label>
                  <textarea 
                    className="form-input" 
                    rows={4} 
                    placeholder="Mesajınızı buraya yazabilirsiniz..."
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button type="button" className="btn-gold" style={{ justifyContent: 'center', marginTop: '12px' }}>
                  Gönder
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
