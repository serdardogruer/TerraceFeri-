import { Building2, Users, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Dashboard</h2>
        <p className="text-slate-400 text-sm">Sistem özeti</p>
      </div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1 */}
        <div className="p-6 glass-card rounded-3xl relative overflow-hidden group">
          {/* Subtle color accent behind card */}
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-red-500/10 blur-2xl group-hover:bg-red-500/20 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-slate-400 text-sm">Açık Arızalar</h3>
              <div className="p-2 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="text-4xl font-extrabold text-white">12</p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-6 glass-card rounded-3xl relative overflow-hidden group">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-orange-500/10 blur-2xl group-hover:bg-orange-500/20 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-slate-400 text-sm">Okunmamış Sayaçlar</h3>
              <div className="p-2 rounded-xl" style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.15)' }}>
                <ShieldCheck className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="text-4xl font-extrabold text-white">5</p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-6 glass-card rounded-3xl relative overflow-hidden group">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-green-500/10 blur-2xl group-hover:bg-green-500/20 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-slate-400 text-sm">Aktif Personel</h3>
              <div className="p-2 rounded-xl" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                <Users className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="text-4xl font-extrabold text-white">8</p>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-6 glass-card rounded-3xl relative overflow-hidden group">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-slate-400 text-sm">Toplam Daire</h3>
              <div className="p-2 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                <Building2 className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="text-4xl font-extrabold text-white">120</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
