'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';

const quickLinks = [
  { href: '/hakkimizda', label: 'Hakkımızda' },
  { href: '/galeri', label: 'Galeri' },
  { href: '/sosyal-alanlar', label: 'Sosyal Alanlar' },
  { href: '/konum', label: 'Konum' },
  { href: '/iletisim', label: 'İletişim' },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: '#060606',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '64px 24px 32px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '48px',
            marginBottom: '48px',
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="38" height="38" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="#141414" stroke="rgba(201,168,76,0.3)" strokeWidth="1" />
                <path d="M7 28 H33 V24 H7 Z" fill="url(#footer-gold-3)" />
                <path d="M11 22 H29 V18 H11 Z" fill="url(#footer-gold-3)" opacity="0.85" />
                <path d="M15 16 H25 V10 H15 Z" fill="url(#footer-gold-3)" opacity="0.7" />
                <defs>
                  <linearGradient id="footer-gold-3" x1="7" y1="10" x2="33" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E8C97A" />
                    <stop offset="1" stopColor="#C9A84C" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '20px',
                    fontWeight: 300,
                    color: '#ffffff',
                    letterSpacing: '0.12em',
                    lineHeight: 1,
                  }}
                >
                  TERRACE<strong style={{ fontWeight: 700, color: '#c9a84c' }}>FERİ</strong>
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '8px',
                    fontWeight: 500,
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.45)',
                    marginTop: '3px',
                  }}
                >
                  PREMIUM RESIDENCE
                </span>
              </div>
            </div>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                color: '#6a6a6a',
                lineHeight: 1.7,
                fontWeight: 300,
                maxWidth: '240px',
              }}
            >
              Şişli&apos;nin kalbinde, İstanbul&apos;un merkezinde lüks ve konforlu yaşam alanı.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
              <a
                href="#"
                style={{ color: '#5a5a5a', transition: 'color 0.3s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#c9a84c')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#5a5a5a')}
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a
                href="#"
                style={{ color: '#5a5a5a', transition: 'color 0.3s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#c9a84c')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#5a5a5a')}
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#c9a84c',
                marginBottom: '20px',
              }}
            >
              Hızlı Erişim
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                      color: '#6a6a6a',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#c9a84c')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6a6a6a')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#c9a84c',
                marginBottom: '20px',
              }}
            >
              İletişim
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <MapPin size={16} style={{ color: '#c9a84c', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#6a6a6a', lineHeight: 1.6 }}>
                  Yay Meydanı Caddesi No:15<br />
                  34377 Şişli / İstanbul
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Phone size={16} style={{ color: '#c9a84c', flexShrink: 0 }} />
                <a
                  href="tel:4442002"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#6a6a6a', textDecoration: 'none' }}
                >
                  444 2 002
                </a>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Mail size={16} style={{ color: '#c9a84c', flexShrink: 0 }} />
                <a
                  href="mailto:info@terraceferi.com"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#6a6a6a', textDecoration: 'none' }}
                >
                  info@terraceferi.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#3a3a3a' }}>
            © {new Date().getFullYear()} TerraceFeri Rezidans. Tüm hakları saklıdır.
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#3a3a3a' }}>
          </p>
        </div>
      </div>
    </footer>
  );
}
