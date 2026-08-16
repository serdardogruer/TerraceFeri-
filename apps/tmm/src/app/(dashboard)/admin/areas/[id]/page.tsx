'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AreaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/areas" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">Alan Detayı</h2>
      </div>

      <div className="bg-[#0f121b] border border-slate-800/80 rounded-3xl p-8 shadow-xl min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Alan ID: {resolvedParams.id}</p>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Burada Alt Alanlar ve Ekipmanlar listelenecek. Bu ekran tasarım aşamasındadır.
          </p>
          <button className="px-6 py-2.5 bg-purple-900/20 text-purple-400 border border-purple-500/30 rounded-md text-sm font-semibold hover:bg-purple-900/40 transition-colors">
            Tasarım Aşamasında
          </button>
        </div>
      </div>
    </div>
  );
}
