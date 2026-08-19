'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Server, Database, Activity, Map, Wrench, Zap, Cpu, Briefcase, Send, Users, UserCheck, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isSuperAdmin = currentUser?.email === 'serdardogruer@gmail.com' || currentUser?.role === 'SUPER_ADMIN';
  const hasSettingsPermission = isSuperAdmin || (Array.isArray(currentUser?.permissions) && currentUser.permissions.includes('settings'));

  if (!loading && !hasSettingsPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-white">Erişim Yetkiniz Bulunmamaktadır</h2>
        <p className="text-sm text-slate-400 max-w-md">
          Sistem Ayarları sayfasına erişim izniniz kısıtlanmıştır. Lütfen Süper Admin ile iletişime geçin.
        </p>
        <Link
          href="/admin"
          className="px-5 py-2 bg-indigo-900/20 hover:bg-indigo-900/40 border border-indigo-500/40 text-indigo-300 text-xs font-bold rounded-lg transition-colors"
        >
          Panele Geri Dön
        </Link>
      </div>
    );
  }

  const modules = [
    {
      id: 'core',
      name: 'TMM Core (Çekirdek)',
      description: 'Temel kullanıcı, oturum ve rol yönetimi',
      status: 'active',
      icon: Server,
      db: 'terraceferi_core',
      version: '1.0.0'
    },
    {
      id: 'area',
      name: 'Alan Yönetimi (AreaDB)',
      description: 'Tesis, blok, kat ve bağımsız bölüm hiyerarşisi',
      status: 'active',
      icon: Map,
      db: 'terraceferi_area',
      version: '1.0.0'
    },
    {
      id: 'equipment',
      name: 'Ekipman Yönetimi (EquipmentDB)',
      description: 'Sitedeki tüm demirbaş ve cihazların envanteri',
      status: 'active',
      icon: Cpu,
      db: 'terraceferi_equipment',
      version: '1.0.0',
      href: '/admin/equipments'
    },
    {
      id: 'faults',
      name: 'Arıza & Bakım Modülü',
      description: 'Sistem üzerindeki arıza kayıtları ve bakım planları',
      status: 'active',
      icon: Wrench,
      db: 'terraceferi_faults',
      version: '1.0.0',
      href: '/admin/faults'
    },
    {
      id: 'companies',
      name: 'Servis Firmaları Modülü (CompanyDB)',
      description: 'Dışarıdan gelen servis firmalarının kaydı',
      status: 'active',
      icon: Briefcase,
      db: 'terraceferi_company',
      version: '1.0.0',
      href: '/admin/settings/companies'
    },
    {
      id: 'meters',
      name: 'Sayaç Yönetimi',
      description: 'Elektrik, su, doğalgaz sayaç okumaları ve tüketim takibi',
      status: 'active',
      icon: Zap,
      db: 'terraceferi_meters',
      version: '1.0.0',
      href: '/admin/meters'
    },
    {
      id: 'management',
      name: 'Yönetim Masası Modülü',
      description: 'Teknik bilgilendirme notları ve malzeme / satın alma talep formları',
      status: 'active',
      icon: Send,
      db: 'terraceferi_management',
      version: '1.0.0',
      href: '/admin/management-requests'
    },
    {
      id: 'users',
      name: 'Kullanıcı & Yetki Yönetimi',
      description: 'Sistem kullanıcıları, şifreler, roller ve modül bazlı erişim yetkileri',
      status: 'active',
      icon: Users,
      db: 'terraceferi_core',
      version: '1.0.0',
      href: '/admin/users'
    },
    {
      id: 'personnel',
      name: 'Personel & PDKS Yönetimi',
      description: 'Teknik personel listesi, vardiya saatleri ve QR kodlu konum bazlı giriş/çıkış takibi',
      status: 'active',
      icon: UserCheck,
      db: 'terraceferi_personnel',
      version: '1.0.0',
      href: '/admin/personnel'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Sistem Ayarları & Modüller</h2>
        <p className="text-slate-400 text-sm">Sisteme entegre edilmiş aktif ve pasif modüllerin yönetimi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map(mod => (
          <div 
            key={mod.id} 
            className={`p-6 rounded-3xl shadow-lg relative overflow-hidden transition-all duration-300 ${
              mod.status === 'active' 
                ? 'glass-card !border-blue-500/20 hover:!border-blue-500/40' 
                : 'glass-card opacity-70 grayscale'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-2xl ${
                  mod.status === 'active' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-500'
                }`}>
                  <mod.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{mod.name}</h3>
                  <div className="flex items-center text-xs text-slate-400 mt-1 space-x-3">
                    <span className="flex items-center"><Database className="w-3 h-3 mr-1" /> {mod.db}</span>
                    <span className="flex items-center"><Activity className="w-3 h-3 mr-1" /> v{mod.version}</span>
                  </div>
                </div>
              </div>
              
              {mod.status === 'active' ? (
                <span className="flex items-center px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> AKTİF
                </span>
              ) : (
                <span className="px-3 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-md text-xs font-semibold">
                  KURULMADI
                </span>
              )}
            </div>

            <p className="text-slate-400 text-sm mt-4">
              {mod.description}
            </p>

            {mod.status === 'active' && (
              <div className="mt-5 pt-5 border-t glass-divider flex justify-end">
                {mod.href ? (
                  <Link href={mod.href} className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                    Yapılandır
                  </Link>
                ) : (
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                    Yapılandır
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
