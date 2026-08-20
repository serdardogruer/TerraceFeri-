import React from 'react';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

export const metadata = {
  title: 'Terrace Feri - Personel Portalı',
  description: 'Terrace Feri Personel Mobil Uygulaması'
};

export default function PersonelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#060B14] text-slate-100 flex flex-col font-sans pb-20 selection:bg-emerald-500/30">
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-4">
        {children}
      </main>
      <MobileBottomNav type="personel" />
    </div>
  );
}
