'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Check, 
  User, 
  Calendar, 
  Search, 
  Plus, 
  Trash2, 
  X, 
  Package, 
  RotateCcw, 
  Send, 
  Bell, 
  AlertCircle,
  Building,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Flame,
  FileText,
  CheckSquare
} from 'lucide-react';
import { MobileHeader } from '@/components/mobile/MobileHeader';

interface RoutineCleanTask {
  id: string;
  code: string;
  title: string;
  area: string;
  period: 'SABAH' | 'ÖĞLE' | 'AKŞAM' | 'GÜN BOYU' | 'ANLIK';
  priority: 'RUTİN' | 'ÖNEMLİ' | 'ACİL';
  recordType: 'TEMIZLIK_RUTIN' | 'TEMIZLIK_EKSTRA';
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
}

interface MaterialItem {
  id: string;
  name: string;
  quantity: string;
}

interface MaterialBatchRequest {
  id: string;
  items: MaterialItem[];
  urgency: 'NORMAL' | 'ACİL';
  requestedBy: string;
  date: string;
  status: 'BEKLEMEDE' | 'ONAYLANDI' | 'TESLİM_EDİLDİ';
  notes?: string;
}

interface ManagementNotification {
  id: string;
  title: string;
  area: string;
  urgency: 'NORMAL' | 'ÖNEMLİ' | 'ACİL';
  sender: string;
  date: string;
  status: 'İNCELENİYOR' | 'İŞLEME_ALINDI' | 'TAMAMLANDI';
  response?: string;
}

const MATERIAL_OPTIONS = [
  'Büyük Boy Çöp Poşeti (Koli)',
  'Küçük Boy Çöp Poşeti (Rulo)',
  'Yüzey Temizleyici & Dezenfektan (5L)',
  'Mikrofiber Paspas Mop Ucu',
  'Sıvı El Sabunu (5L)',
  'Temizlik Eldiveni (M/L Paket)',
  'Camsil Sprey (750ml)',
  'Kireç Çözücü & WC Temizleyici',
  'Koku Giderici Sprey',
  'Kağıt Havlu & Tuvalet Kağıdı (Koli)'
];

function TemizlikContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  // Aktif Sekme: 'gorevler' | 'malzeme' | 'bildirimler'
  const activeMainTab = tabParam === 'malzeme' ? 'malzeme' : tabParam === 'bildirimler' ? 'bildirimler' : 'gorevler';

  // Seçili Tarih (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Aktif Personel
  const [currentStaff, setCurrentStaff] = useState({
    code: 'TEM-01',
    name: 'Fatma Şahin',
    title: 'Temizlik Görevlisi'
  });

  const staffList = [
    { code: 'TEM-01', name: 'Fatma Şahin' },
    { code: 'TEM-02', name: 'Ayşe Kaya' },
    { code: 'TEM-03', name: 'Emine Yılmaz' },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tf_active_staff');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.role === 'TEMIZLIK') {
            setCurrentStaff(parsed);
          }
        } catch (e) {}
      }
    }
  }, []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Modallar
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // Form State - Yeni Ekstra / Rutin Görev
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskArea, setNewTaskArea] = useState('A Blok Kat 3');
  const [newTaskPriority, setNewTaskPriority] = useState<'RUTİN' | 'ÖNEMLİ' | 'ACİL'>('RUTİN');
  const [newTaskType, setNewTaskType] = useState<'EKSTRA' | 'RUTIN'>('EKSTRA');
  const [newTaskPeriod, setNewTaskPeriod] = useState<'ANLIK' | 'SABAH' | 'ÖĞLE' | 'AKŞAM'>('ANLIK');

  // Form State - Çoklu Malzeme Listesi
  const [requestedItems, setRequestedItems] = useState<MaterialItem[]>([
    { id: '1', name: 'Büyük Boy Çöp Poşeti (Koli)', quantity: '2 Koli' }
  ]);
  const [materialUrgency, setMaterialUrgency] = useState<'NORMAL' | 'ACİL'>('NORMAL');
  const [materialNotes, setMaterialNotes] = useState('');

  // Form State - Yönetim Bildirimi
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyArea, setNotifyArea] = useState('A Blok Kat 3');
  const [notifyUrgency, setNotifyUrgency] = useState<'NORMAL' | 'ÖNEMLİ' | 'ACİL'>('NORMAL');
  const [notifyDescription, setNotifyDescription] = useState('');

  // Veritabanı Görevleri
  const [tasks, setTasks] = useState<RoutineCleanTask[]>([]);

  // Malzeme Talepleri
  const [materialBatchRequests, setMaterialBatchRequests] = useState<MaterialBatchRequest[]>([
    {
      id: 'MLZ-401',
      items: [
        { id: '1', name: 'Yüzey Temizleyici & Dezenfektan (5L)', quantity: '4 Bidon' },
        { id: '2', name: 'Mikrofiber Paspas Mop Ucu', quantity: '6 Adet' },
        { id: '3', name: 'Büyük Boy Çöp Poşeti (Koli)', quantity: '2 Koli' }
      ],
      urgency: 'ACİL',
      requestedBy: 'Fatma Şahin',
      date: '20.08.2026 09:15',
      status: 'ONAYLANDI',
      notes: 'Zemin temizliği için ortak stok tükendi.'
    }
  ]);

  // Yönetim Bildirimleri
  const [notifications, setNotifications] = useState<ManagementNotification[]>([
    {
      id: 'BIL-201',
      title: 'A Blok 3. Kat Koridor Lambası Yanmıyor',
      area: 'A Blok Kat 3',
      urgency: 'NORMAL',
      sender: 'Fatma Şahin',
      date: '20.08.2026 08:50',
      status: 'İŞLEME_ALINDI',
      response: 'Teknik ekibe arıza iş emri olarak aktarıldı.'
    }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Veritabanından Seçili Günün Görevlerini Yükle
  const loadTasksFromDb = async (dateStr: string) => {
    setLoadingTasks(true);
    try {
      const res = await fetch(`/api/cleaning-tasks?date=${dateStr}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTasks(json.data);
      }
    } catch (e) {
      console.error('Error fetching cleaning tasks:', e);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadTasksFromDb(selectedDate);
  }, [selectedDate]);

  // 2. Görevi Tamamla (Okeyle) & Veritabanına Yaz
  const handleToggleTask = async (task: RoutineCleanTask) => {
    const nextCompleted = !task.isCompleted;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Optimistic UI güncellemesi
    setTasks(prev => prev.map(t => {
      if (t.id === task.id) {
        return {
          ...t,
          isCompleted: nextCompleted,
          completedBy: nextCompleted ? currentStaff.name : undefined,
          completedAt: nextCompleted ? timeStr : undefined
        };
      }
      return t;
    }));

    try {
      const res = await fetch('/api/cleaning-tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          isCompleted: nextCompleted,
          completedBy: currentStaff.name,
          completedAt: timeStr
        })
      });
      const json = await res.json();
      if (json.success) {
        if (nextCompleted) {
          showToast(`✅ "${task.title}" görevi ${currentStaff.name} tarafından tamamlandı (DB Kaydedildi).`);
        } else {
          showToast(`↩️ Görev durumu tekrar beklemeye alındı.`);
        }
      }
    } catch (e) {
      console.error('Error updating task in DB:', e);
      showToast('⚠️ Veritabanı güncellenirken hata oluştu.');
      loadTasksFromDb(selectedDate);
    }
  };

  // 3. Yeni Ekstra / Rutin Görev Ekle (Veritabanına Kaydet)
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch('/api/cleaning-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          area: newTaskArea.trim(),
          priority: newTaskPriority,
          isExtra: newTaskType === 'EKSTRA',
          period: newTaskPeriod,
          isRecurring: newTaskType === 'RUTIN',
          reporterName: currentStaff.name
        })
      });
      const json = await res.json();
      if (json.success) {
        setIsNewTaskModalOpen(false);
        setNewTaskTitle('');
        showToast(`✨ Yeni ${newTaskType === 'EKSTRA' ? 'Ekstra' : 'Rutin'} görev veritabanına kaydedildi!`);
        loadTasksFromDb(selectedDate);
      }
    } catch (e) {
      console.error('Error creating task:', e);
      showToast('⚠️ Görev eklenirken hata oluştu.');
    }
  };

  // Çoklu Malzeme Listesine Satır Ekle
  const handleAddMaterialRow = () => {
    const newId = String(Date.now());
    setRequestedItems([...requestedItems, { id: newId, name: MATERIAL_OPTIONS[0], quantity: '1 Koli' }]);
  };

  const handleUpdateMaterialRow = (id: string, field: 'name' | 'quantity', value: string) => {
    setRequestedItems(requestedItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveMaterialRow = (id: string) => {
    if (requestedItems.length === 1) {
      showToast('En az bir malzeme kalmalıdır.');
      return;
    }
    setRequestedItems(requestedItems.filter(item => item.id !== id));
  };

  // Çoklu Malzeme Talebini Kaydet
  const handleSaveBatchMaterialRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newBatch: MaterialBatchRequest = {
      id: `MLZ-${Date.now().toString().slice(-4)}`,
      items: [...requestedItems],
      urgency: materialUrgency,
      requestedBy: currentStaff.name,
      date: dateStr,
      status: 'BEKLEMEDE',
      notes: materialNotes
    };

    setMaterialBatchRequests([newBatch, ...materialBatchRequests]);
    setIsMaterialModalOpen(false);
    setRequestedItems([{ id: '1', name: MATERIAL_OPTIONS[0], quantity: '2 Koli' }]);
    setMaterialNotes('');
    showToast(`📦 ${newBatch.items.length} kalem malzeme talebi Yönetime iletildi!`);
  };

  // Yönetime Bildirim Kaydet
  const handleSaveNotification = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newNotif: ManagementNotification = {
      id: `BIL-${Date.now().toString().slice(-4)}`,
      title: notifyTitle.trim(),
      area: notifyArea.trim(),
      urgency: notifyUrgency,
      sender: currentStaff.name,
      date: dateStr,
      status: 'İNCELENİYOR'
    };

    setNotifications([newNotif, ...notifications]);
    setIsNotificationModalOpen(false);
    setNotifyTitle('');
    setNotifyDescription('');
    showToast(`📢 "${newNotif.title}" bildirimi Yönetim Masasına iletildi!`);
  };

  // Gün Değiştirme
  const handleChangeDate = (offsetDays: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + offsetDays);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  // İstatistikler
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-3.5 pb-12">
      <MobileHeader 
        title="TEMİZLİK OPERASYONU" 
        subtitle={
          activeMainTab === 'malzeme' ? 'Malzeme Sipariş & Talep Listesi' :
          activeMainTab === 'bildirimler' ? 'Yönetim Masası Raporlama' :
          'Günlük Görevler (Veritabanı Takip)'
        }
        staffName={currentStaff.name}
        staffCode={currentStaff.code}
        type="personel"
      />

      {/* Canlı Bildirim Toast'u */}
      {toastMessage && (
        <div className="p-2.5 bg-emerald-950/90 border border-emerald-500/60 text-white text-xs font-bold rounded-lg shadow-lg flex items-center justify-between animate-in fade-in duration-200">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SEKME: GÖREVLER (GÜN GÜN DB TAKİBİ, RUTİN & EKSTRA GÖREVLER) */}
      {/* ========================================================================= */}
      {activeMainTab === 'gorevler' && (
        <div className="space-y-3">
          {/* Gün Seçici Çubuğu (Gün Gün DB Takibi) */}
          <div className="p-2 bg-[#070A11] border border-[#151B2B] rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleChangeDate(-1)}
                className="w-7 h-7 bg-[#060B14] border border-slate-800 hover:border-slate-600 text-slate-300 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-2 py-0.5 bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-md hover:bg-emerald-900/30 transition-colors cursor-pointer"
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={() => handleChangeDate(1)}
                className="w-7 h-7 bg-[#060B14] border border-slate-800 hover:border-slate-600 text-slate-300 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-right flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-white font-mono">{selectedDate}</span>
            </div>
          </div>

          {/* İlerleme Özeti Kartı & Personel Dağılımı */}
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#0A1817] to-[#070A11] border border-emerald-500/30 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-400" /> Günlük Tamamlanma
              </span>
              <span className="text-emerald-400 font-bold">{completedTasks} / {totalTasks} Görev ({progressPercent}%)</span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* 3 Personelin O Gün Yaptığı İş Sayıları */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-emerald-500/20 text-center text-[10px]">
              {staffList.map(staff => {
                const count = tasks.filter(t => t.completedBy === staff.name).length;
                const isMe = currentStaff.name === staff.name;
                return (
                  <div key={staff.code} className={`p-1.5 rounded-lg border ${isMe ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-[#060B14] border-[#151B2B] text-slate-400'}`}>
                    <span className="block font-bold text-[9px] truncate">{staff.name.split(' ')[0]}</span>
                    <span className="font-bold text-xs text-white">{count} İş</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* + Yeni Ekstra / Rutin Görev Ekle Butonu */}
          <button
            type="button"
            onClick={() => setIsNewTaskModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-900/20 hover:bg-emerald-900/40 active:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+ Ekstra veya Rutin Görev Ekle</span>
          </button>

          {/* Görev Listesi */}
          <div className="space-y-3 pt-0.5">
            {loadingTasks ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                Veritabanından yükleniyor...
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center bg-[#070A11] border border-[#151B2B] rounded-2xl space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto" />
                <p className="text-xs font-bold text-slate-300">Bu Güne Ait Görev Bulunmuyor</p>
                <p className="text-[11px] text-slate-500">Yukarıdaki butondan yeni rutin veya anlık ekstra görev ekleyebilirsiniz.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border transition-all shadow-sm space-y-2 ${
                    task.isCompleted
                      ? 'bg-[#070A11]/60 border-emerald-500/30'
                      : task.recordType === 'TEMIZLIK_EKSTRA'
                      ? 'bg-[#070A11] border-amber-500/40'
                      : 'bg-[#070A11] border-[#151B2B] hover:border-slate-700'
                  }`}
                >
                  {/* SIRA 1: Rozetler, Görev Başlığı ve Yapıldı İkonu */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[9px] font-black px-1.5 py-0.2 bg-slate-900 border border-slate-700 text-slate-300 rounded shrink-0">
                        {task.code}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                        task.recordType === 'TEMIZLIK_EKSTRA'
                          ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {task.recordType === 'TEMIZLIK_EKSTRA' ? '⚡ EKSTRA' : task.period}
                      </span>
                      <h3 className={`text-xs font-bold truncate ${task.isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {task.title}
                      </h3>
                    </div>

                    {task.isCompleted && (
                      <span className="px-1.5 py-0.2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold rounded flex items-center gap-0.5 shrink-0">
                        <Check className="w-2.5 h-2.5" /> Yapıldı
                      </span>
                    )}
                  </div>

                  {/* SIRA 2: Bölge ve Yapan Personel Bilgisi */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 bg-[#060B14] px-2.5 py-1.5 rounded-lg border border-[#151B2B]">
                    <div className="flex items-center gap-1 truncate pr-2">
                      <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="text-indigo-200 font-semibold truncate">{task.area}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <User className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className={`font-bold ${task.completedBy ? 'text-emerald-300' : 'text-slate-500'}`}>
                        {task.completedBy ? `${task.completedBy} (${task.completedAt})` : 'Beklemede'}
                      </span>
                    </div>
                  </div>

                  {/* SIRA 3: Bilgi & Okeyleme Butonu */}
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[10px] text-slate-500 font-medium truncate pr-2">
                      {task.isCompleted ? `Saat ${task.completedAt} tamamlandı` : (task.recordType === 'TEMIZLIK_EKSTRA' ? '⚡ Anlık ekstra görev' : 'Günlük rutin')}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleTask(task)}
                      className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm gap-1.5 cursor-pointer active:scale-95 shrink-0 ${
                        task.isCompleted
                          ? 'bg-transparent border border-slate-700 text-slate-400 hover:text-slate-200'
                          : 'bg-emerald-900/30 hover:bg-emerald-900/50 active:bg-emerald-900/70 border border-emerald-500/50 text-emerald-300'
                      }`}
                    >
                      {task.isCompleted ? (
                        <>
                          <RotateCcw className="w-3 h-3" /> Geri Al
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> İşi Tamamla (Okeyle)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SEKME: ÇOKLU MALZEME TALEPLERİ */}
      {/* ========================================================================= */}
      {activeMainTab === 'malzeme' && (
        <div className="space-y-3.5">
          <button
            onClick={() => setIsMaterialModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-900/20 hover:bg-emerald-900/40 active:bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+ Yeni Malzeme Listesi Talep Et</span>
          </button>

          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Talep Edilen Malzeme Listeleri ({materialBatchRequests.length})
            </h3>
          </div>

          {materialBatchRequests.map((batch) => (
            <div key={batch.id} className="p-3.5 bg-[#070A11] border border-[#151B2B] rounded-xl space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-1.5 py-0.2 bg-slate-900 border border-slate-700 text-slate-300 rounded">
                    {batch.id}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {batch.items.length} Kalem Malzeme
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  batch.status === 'TESLİM_EDİLDİ'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : batch.status === 'ONAYLANDI'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {batch.status}
                </span>
              </div>

              <div className="space-y-1.5 bg-[#060B14] p-2.5 rounded-lg border border-[#151B2B]">
                {batch.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-200 py-0.5 border-b border-slate-800/50 last:border-b-0">
                    <span className="font-semibold text-slate-300 truncate pr-2">• {item.name}</span>
                    <span className="font-bold text-emerald-400 text-[11px] shrink-0">{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">TALEP EDEN</span>
                  <span className="text-xs font-bold text-indigo-300 truncate w-full">{batch.requestedBy}</span>
                </div>
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">ACİLİYET</span>
                  <span className={`text-xs font-bold ${batch.urgency === 'ACİL' ? 'text-rose-400' : 'text-slate-300'}`}>
                    {batch.urgency}
                  </span>
                </div>
              </div>

              {batch.notes && (
                <p className="text-[10px] text-slate-400 italic bg-[#060B14] p-1.5 rounded border border-slate-800">
                  Not: {batch.notes}
                </p>
              )}

              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                Talep Tarihi: {batch.date}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SEKME: YÖNETİME BİLDİRİMLER */}
      {/* ========================================================================= */}
      {activeMainTab === 'bildirimler' && (
        <div className="space-y-3.5">
          <button
            onClick={() => setIsNotificationModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-900/20 hover:bg-indigo-900/40 active:bg-indigo-900/60 border border-indigo-500/50 text-indigo-300 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4 text-indigo-400" />
            <span>+ Yeni Saha Bildirimi Gönder</span>
          </button>

          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Yönetim Masasına İletilen Bildirimler ({notifications.length})
            </h3>
          </div>

          {notifications.map((notif) => (
            <div key={notif.id} className="p-3.5 bg-[#070A11] border border-[#151B2B] rounded-xl space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black px-1.5 py-0.2 bg-slate-900 border border-slate-700 text-slate-300 rounded">
                  {notif.id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  notif.status === 'TAMAMLANDI'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                }`}>
                  {notif.status}
                </span>
              </div>

              <h4 className="text-xs font-bold text-white">{notif.title}</h4>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">BÖLGE</span>
                  <span className="text-xs font-bold text-indigo-300 truncate w-full">{notif.area}</span>
                </div>
                <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">BİLDİREN</span>
                  <span className="text-xs font-bold text-emerald-300 truncate w-full">{notif.sender}</span>
                </div>
              </div>

              {notif.response && (
                <div className="p-2 bg-[#060B14] rounded-lg border border-indigo-500/30 text-[10px] text-indigo-300 space-y-0.5">
                  <span className="font-bold block text-indigo-400">Yönetim Masası Yanıtı:</span>
                  <p>{notif.response}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                <span>{notif.date}</span>
                <span className={notif.urgency === 'ACİL' ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                  {notif.urgency}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* POP-UP 1: YENİ EKSTRA / RUTİN GÖREV MODALI (Kural 2 & 3 Standartları) */}
      {/* ========================================================================= */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-sm bg-[#070A11] border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 my-auto">
            {/* Modal Header: Sol Üst Sıfırla (Kural 2 & 3) */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setNewTaskTitle(''); setNewTaskArea('A Blok Kat 3'); }}
                  className="flex items-center px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Sıfırla
                </button>
                <h3 className="text-xs font-bold text-white">Yeni Temizlik Görevi</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="w-7 h-7 rounded-lg border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              {/* Görev Türü Seçimi (Ekstra / Rutin) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewTaskType('EKSTRA')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    newTaskType === 'EKSTRA'
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                      : 'bg-[#060B14] border-slate-800 text-slate-400'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Anlık Ekstra İş</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewTaskType('RUTIN')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    newTaskType === 'RUTIN'
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : 'bg-[#060B14] border-slate-800 text-slate-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Kalıcı Rutin İş</span>
                </button>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Görev Başlığı / Yapılacak İş *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 3. Kat asansör önü kahve döküntüsü temizliği"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Görev Bölgesi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: A Blok Kat 3"
                    value={newTaskArea}
                    onChange={(e) => setNewTaskArea(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Öncelik
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="RUTİN">Rutin / Normal</option>
                    <option value="ÖNEMLİ">Önemli</option>
                    <option value="ACİL">Acil</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer: Sağ Alt İptal ve Kaydet (Kural 2 & 3) */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-1.5 bg-transparent border border-slate-600/50 text-slate-400 hover:bg-slate-800/30 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex items-center px-5 py-1.5 bg-emerald-900/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40 text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Görevi Kaydet (DB)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POP-UP 2: ÇOKLU MALZEME TALEP MODALI */}
      {/* ========================================================================= */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-sm bg-[#070A11] border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 sticky top-0 bg-[#070A11] z-10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRequestedItems([{ id: '1', name: MATERIAL_OPTIONS[0], quantity: '1 Koli' }]);
                    setMaterialNotes('');
                  }}
                  className="flex items-center px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Sıfırla
                </button>
                <h3 className="text-xs font-bold text-white">Çoklu Malzeme Talebi</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMaterialModalOpen(false)}
                className="w-7 h-7 rounded-lg border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatchMaterialRequest} className="space-y-3">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  İstenen Malzemeler ({requestedItems.length} Kalem) *
                </label>

                {requestedItems.map((item, index) => (
                  <div key={item.id} className="p-2.5 bg-[#060B14] border border-slate-800 rounded-xl space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-400">Kalem #{index + 1}</span>
                      {requestedItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterialRow(item.id)}
                          className="text-rose-400 hover:text-rose-300 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Sil
                        </button>
                      )}
                    </div>

                    <div>
                      <select
                        value={item.name}
                        onChange={(e) => handleUpdateMaterialRow(item.id, 'name', e.target.value)}
                        className="w-full px-2 py-1.5 bg-[#070A11] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/60"
                      >
                        {MATERIAL_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Miktar (Örn: 2 Koli, 4 Bidon, 10 Adet)"
                        value={item.quantity}
                        onChange={(e) => handleUpdateMaterialRow(item.id, 'quantity', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#070A11] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/60"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddMaterialRow}
                  className="w-full py-2 bg-[#060B14] border border-dashed border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/20 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  <span>+ Listeye Başka Malzeme Ekle</span>
                </button>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Aciliyet Durumu
                </label>
                <select
                  value={materialUrgency}
                  onChange={(e) => setMaterialUrgency(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/60"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="ACİL">Acil (Tükendi)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Ek Açıklama / Not
                </label>
                <input
                  type="text"
                  placeholder="İsteğe bağlı..."
                  value={materialNotes}
                  onChange={(e) => setMaterialNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="px-4 py-1.5 bg-transparent border border-slate-600/50 text-slate-400 hover:bg-slate-800/30 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex items-center px-5 py-1.5 bg-emerald-900/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40 text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Listeyi Talebe Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POP-UP 3: YÖNETİME BİLGİ / BİLDİRİM MODALI */}
      {/* ========================================================================= */}
      {isNotificationModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-sm bg-[#070A11] border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setNotifyTitle(''); setNotifyDescription(''); }}
                  className="flex items-center px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Sıfırla
                </button>
                <h3 className="text-xs font-bold text-white">Yönetime Bildirim</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNotificationModalOpen(false)}
                className="w-7 h-7 rounded-lg border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotification} className="space-y-2.5">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Bildirim Konusu / Başlık *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 3. Kat yangın dolabı kapağı hasarlı"
                  value={notifyTitle}
                  onChange={(e) => setNotifyTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Bölge / Blok *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: A Blok Kat 3"
                    value={notifyArea}
                    onChange={(e) => setNotifyArea(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/60"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Öncelik
                  </label>
                  <select
                    value={notifyUrgency}
                    onChange={(e) => setNotifyUrgency(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/60"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="ÖNEMLİ">Önemli</option>
                    <option value="ACİL">Acil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Detaylı Açıklama
                </label>
                <textarea
                  rows={3}
                  placeholder="Durumu detaylandırınız..."
                  value={notifyDescription}
                  onChange={(e) => setNotifyDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/60 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNotificationModalOpen(false)}
                  className="px-4 py-1.5 bg-transparent border border-slate-600/50 text-slate-400 hover:bg-slate-800/30 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex items-center px-5 py-1.5 bg-indigo-900/20 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-900/40 text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Bildirimi Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PersonelTemizlikPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Yükleniyor...</div>}>
      <TemizlikContent />
    </Suspense>
  );
}
