import React from 'react';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

export const metadata = {
  title: 'Terrace Feri - Sakin Portalı',
  description: 'Terrace Feri Sakin Mobil Uygulaması'
};

export default function SakinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#060B14] text-slate-100 flex flex-col font-sans pb-20 selection:bg-indigo-500/30">
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-4">
        {children}
      </main>
      <MobileBottomNav type="sakin" />
    </div>
  );
}
