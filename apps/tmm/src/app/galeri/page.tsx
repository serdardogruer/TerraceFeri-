'use client';

import Image from 'next/image';
import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const categories = ['Tümü', 'Dış Cephe', 'Sosyal Alanlar', 'İç Mekan', 'Daire Planları'];

const images = [
  { src: '/foto/inanlar-terrrace-feri.jpg', cat: 'Dış Cephe', label: 'Ana Giriş ve Işıklı Tabela', aspect: 'wide' },
  { src: '/foto/ba04da85-0110-446e-a7d2-ca3fe2264e45.webp', cat: 'Dış Cephe', label: 'Bina Ön Cephesi ve Giriş', aspect: 'wide' },
  { src: '/foto/thnvyjsrrzyyktcjkrsu.webp', cat: 'Dış Cephe', label: 'Gece Aydınlatmalı Cephe Görünümü', aspect: 'wide' },
  { src: '/foto/ouiwutpv6nqtf1idoqr1.webp', cat: 'Dış Cephe', label: 'Mimari Cephe ve İç Avlu', aspect: 'normal' },
  { src: '/foto/images-1.jpeg', cat: 'Dış Cephe', label: 'Üst Açıdan İç Avlu ve Ahşap Detaylar', aspect: 'normal' },
  { src: '/foto/oomuuehdmzhf7r3cyjub.webp', cat: 'Sosyal Alanlar', label: 'Aydınlatmalı İç Avlu Peyzaj Bahçesi', aspect: 'wide' },
  { src: '/foto/rpvsis6vmkky1dd5mqrq.jpg', cat: 'İç Mekan', label: 'Ana Giriş Lobisi ve Resepsiyon', aspect: 'normal' },
  { src: '/foto/xcg3kxe9fxegfiznkxyy.jpg', cat: 'Sosyal Alanlar', label: 'Isıtmalı Kapalı Yüzme Havuzu', aspect: 'wide' },
  { src: '/foto/images.jpeg', cat: 'Sosyal Alanlar', label: 'Kapalı Yüzme Havuzu ve Şezlong Alanı', aspect: 'normal' },
  { src: '/foto/ewwhjdwhwch85tac74bt.jpg', cat: 'Sosyal Alanlar', label: 'Ahşap Fin Saunası', aspect: 'normal' },
  { src: '/foto/cv2l28ot7oc9kkkhg1et.jpg', cat: 'İç Mekan', label: 'Rezidans Daire Salonu ve Açık Mutfak', aspect: 'wide' },
  { src: '/foto/s2vm8xlcqnmib9oyhgy0.jpg', cat: 'İç Mekan', label: 'Örnek Daire Oturma Alanı', aspect: 'normal' },
  { src: '/foto/ofnpd1rkrfid3awbvchp.webp', cat: 'Daire Planları', label: '2+1 / 106 m² Brüt Daire Planı', aspect: 'normal' },
  { src: '/foto/ukmjwxysfbnsmfiyteip.webp', cat: 'Daire Planları', label: '1+1 / 122 m² Dubleks Daire Planı', aspect: 'normal' },
  { src: '/foto/wigog1vl1b3gxkur1f54.webp', cat: 'Daire Planları', label: '2+1 / 149 m² Şehir Villası Dubleks Planı', aspect: 'normal' },
  { src: '/foto/xbsjh3rqp7tchcrcodyr.webp', cat: 'Daire Planları', label: '3+1 / 154 m² Dubleks Daire Planı', aspect: 'normal' },
  { src: '/foto/jvakcb7hx2rwslw3frpa.webp', cat: 'Daire Planları', label: '2+1 / 162 m² Dubleks Daire Planı', aspect: 'normal' },
  { src: '/foto/t1qzvrtdsotb5cisk7pm.webp', cat: 'Daire Planları', label: '3+1 / 187 m² Dubleks Daire Planı', aspect: 'normal' },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [lightbox, setLightbox] = useState<string | null>(null);

  const filtered = activeCategory === 'Tümü'
    ? images
    : images.filter((img) => img.cat === activeCategory);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '72px' }}>
        {/* Header */}
        <section style={{ padding: 'clamp(64px, 10vw, 120px) 24px', background: '#0d0d0d' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div className="section-label" style={{ marginBottom: '16px' }}>Galeri</div>
            <h1 className="section-title" style={{ marginBottom: '20px' }}>
              Yaşam Alanları
            </h1>
            <div className="gold-divider" />
          </div>
        </section>

        {/* Filter Tabs */}
        <section style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: '72px', zIndex: 50, padding: '12px 0' }}>
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '0 24px',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
            }}
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    background: isActive ? '#070A11' : 'transparent',
                    border: isActive ? '1px solid rgba(201, 168, 76, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#e8c97a' : '#94a3b8',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    fontWeight: isActive ? 700 : 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive ? '0 2px 8px rgba(201, 168, 76, 0.15)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = '#94a3b8';
                    }
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* Gallery Grid */}
        <section style={{ padding: 'clamp(40px, 6vw, 80px) 24px', background: '#080808', minHeight: '60vh' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '8px',
              }}
            >
              {filtered.map((img, i) => (
                <div
                  key={i}
                  className="gallery-item"
                  onClick={() => setLightbox(img.src)}
                  style={{
                    height: img.aspect === 'wide' ? '320px' : '260px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <Image
                    src={img.src}
                    alt={img.label}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="gallery-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ZoomIn size={28} style={{ color: '#c9a84c', opacity: 0.8 }} />
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                      padding: '24px 20px 16px',
                      zIndex: 2,
                    }}
                  >
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {img.cat}
                    </div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: '#f5f5f5' }}>
                      {img.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lightbox */}
        {lightbox && (
          <div
            onClick={() => setLightbox(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(0,0,0,0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'zoom-out',
            }}
          >
            <button
              onClick={() => setLightbox(null)}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#f5f5f5',
              }}
            >
              <X size={20} />
            </button>
            <div
              style={{
                position: 'relative',
                width: '90vw',
                height: '80vh',
                maxWidth: '1200px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox}
                alt="Tam ekran"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
