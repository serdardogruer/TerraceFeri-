export const dynamic = 'force-dynamic';

import { prismaPersonnel } from '../../../../../../modules/personnel/database/client';
import { Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import SettingsClient from './SettingsClient';

interface LocationSetting {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
  allowedIps: string[];
}

export default async function PersonnelSettingsPage() {
  let locationSettings: LocationSetting[] = [];
  try {
    locationSettings = await prismaPersonnel.locationSetting.findMany();
  } catch (error) {
    console.error('LocationSetting çekme hatası:', error);
    locationSettings = [];
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto font-sans">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/personnel" className="p-2 bg-[#111827] hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-[#F97316]" />
            Modül Ayarları
          </h1>
          <p className="text-slate-400 mt-1">Konum, Wi-Fi doğrulama ve genel sistem yapılandırmaları.</p>
        </div>
      </div>

      <div className="space-y-6">
        <SettingsClient initialSettings={locationSettings} />
      </div>
    </div>
  );
}
