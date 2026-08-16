'use client';

import { Search } from 'lucide-react';

export function Header() {
  return (
    <header className="h-20 flex items-center justify-between px-8 glass-panel border-t-0 border-l-0 border-r-0" style={{ borderRadius: 0 }}>
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-2.5 glass-input rounded-2xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
            placeholder="Daire, alan, cihaz veya arıza ara..."
          />
        </div>
      </div>
    </header>
  );
}
