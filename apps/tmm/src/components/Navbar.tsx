'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
  { href: '/galeri', label: 'Galeri' },
  { href: '/sosyal-alanlar', label: 'Sosyal Alanlar' },
  { href: '/konum', label: 'Konum' },
  { href: '/iletisim', label: 'İletişim' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: 'all 0.4s ease',
          background: scrolled
            ? 'rgba(10,10,10,0.92)'
            : 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px',
          }}
        >
          {/* Logo Option 3 */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* 3 Architectural Layers Icon */}
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="#141414" stroke="rgba(201,168,76,0.3)" strokeWidth="1"/>
              <path d="M7 28 H33 V24 H7 Z" fill="url(#nav-gold-3)" />
              <path d="M11 22 H29 V18 H11 Z" fill="url(#nav-gold-3)" opacity="0.85" />
              <path d="M15 16 H25 V10 H15 Z" fill="url(#nav-gold-3)" opacity="0.7" />
              <defs>
                <linearGradient id="nav-gold-3" x1="7" y1="10" x2="33" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E8C97A" />
                  <stop offset="1" stopColor="#C9A84C" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '18px',
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
                  marginTop: '2px',
                }}
              >
                PREMIUM RESIDENCE
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav
            style={{ display: 'flex', alignItems: 'center', gap: '28px' }}
            className="hidden-mobile"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="show-mobile"
              style={{
                background: 'none',
                border: 'none',
                color: '#f5f5f5',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Menü"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99,
          pointerEvents: menuOpen ? 'all' : 'none',
        }}
      >
        {/* Overlay */}
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            opacity: menuOpen ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Drawer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '280px',
            height: '100%',
            background: '#111111',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            padding: '80px 32px 40px',
            gap: '8px',
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
                fontWeight: 400,
                color: pathname === link.href ? '#c9a84c' : 'rgba(255,255,255,0.8)',
                textDecoration: 'none',
                padding: '14px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                letterSpacing: '0.05em',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}
