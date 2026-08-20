'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  X, 
  CheckCircle2, 
  User, 
  Building2, 
  Info, 
  MapPin, 
  Move, 
  ArrowRightLeft, 
  Waves, 
  Building,
  Timer,
  Maximize2
} from 'lucide-react';
import { MobileHeader } from '@/components/mobile/MobileHeader';

interface BookingGroup {
  id: string;
  facility: string;
  dateStr: string; // 'YYYY-MM-DD'
  startTime: string; // e.g. '10:00'
  endTime: string; // e.g. '11:00' (Maks. 1 Saat)
  doorNo: string; // e.g. 'D23'
  residentName: string; // e.g. 'Serdar Doğruer'
  isCurrentUser?: boolean;
  notes?: string;
}

export default function SakinRandevularPage() {
  const [selectedFacility, setSelectedFacility] = useState('Havuz Kullanımı');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  
  // Modals
  const [activeSlotModal, setActiveSlotModal] = useState<{ dateStr: string; dateLabel: string; startSlot: string; endSlot: string } | null>(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<BookingGroup | null>(null);
  const [moveModalBooking, setMoveModalBooking] = useState<BookingGroup | null>(null);
  const [quickCreateModal, setQuickCreateModal] = useState(false);

  // Form State
  const [formDoorNo, setFormDoorNo] = useState('D23');
  const [formResidentName, setFormResidentName] = useState('Serdar Doğruer');
  const [formNotes, setFormNotes] = useState('');
  const [formFacility, setFormFacility] = useState('Havuz Kullanımı');
  const [formDateStr, setFormDateStr] = useState('');
  const [formStartTime, setFormStartTime] = useState('10:00');
  const [formDuration, setFormDuration] = useState<'30' | '60'>('30');

  // Move Modal State
  const [targetMoveDate, setTargetMoveDate] = useState('');
  const [targetMoveStartTime, setTargetMoveStartTime] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Drag State
  const [draggedBooking, setDraggedBooking] = useState<{ booking: BookingGroup; action: 'move' | 'extend-down' } | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ dateStr: string; timeSlot: string } | null>(null);

  const facilities = [
    { id: 'havuz', name: 'Havuz Kullanımı', quota: 'Şezlong & Giriş', icon: Waves },
    { id: 'sosyal', name: 'Sosyal Tesis', quota: 'Fitness & Salon & Teras', icon: Building },
  ];

  // 30 Dakikalık Zaman Noktaları (08:00 - 22:00)
  const timePoints = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  // 30 Dakikalık Saat Aralıkları
  const timeSlots = timePoints.slice(0, -1).map((tp, idx) => `${tp}/${timePoints[idx + 1]}`);

  // 17 Ağustos - 23 Ağustos 2026 Referans Haftası
  const baseDate = new Date(2026, 7, 17);
  baseDate.setDate(baseDate.getDate() + (currentWeekOffset * 7));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dayNum = d.getDate();
    const months = ['Ağu', 'Eyl', 'Eki', 'Kas', 'Ara', 'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem'];
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const monthName = months[d.getMonth() % 12];
    const dayName = days[d.getDay()];
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const label = `${dayNum}.${monthName}`;
    const fullLabel = `${dayNum} ${monthName} ${dayName}`;
    return { dateStr, label, fullLabel, isToday: i === 3 && currentWeekOffset === 0 };
  });

  // Aktif Giriş Yapan Sakin
  const [currentResident, setCurrentResident] = useState({
    code: 'SAK-42',
    name: 'Ahmet Yılmaz',
    doorNo: 'A-42',
    apartmentNo: '42'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tf_active_resident');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCurrentResident({
            code: parsed.code || 'SAK-42',
            name: parsed.name || 'Ahmet Yılmaz',
            doorNo: parsed.doorNo || `${parsed.block || 'A'} - Daire ${parsed.apartmentNo || '42'}`,
            apartmentNo: parsed.apartmentNo || '42'
          });
          setFormDoorNo(parsed.doorNo || `Daire ${parsed.apartmentNo || '42'}`);
          setFormResidentName(parsed.name || 'Ahmet Yılmaz');
        } catch (e) {}
      }
    }
  }, []);

  // Canlı Veritabanından Ortak Randevuları Çek
  const loadBookingsFromDb = async () => {
    try {
      const res = await fetch('/api/facility-bookings');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBookings(json.data.map((b: any) => ({
          ...b,
          isCurrentUser: b.doorNo === currentResident.doorNo || b.residentCode === currentResident.code || b.residentName === currentResident.name
        })));
      }
    } catch (e) {
      console.error('Error loading bookings:', e);
    }
  };

  useEffect(() => {
    loadBookingsFromDb();
  }, [currentResident]);

  useEffect(() => {
    if (weekDays.length > 0 && !formDateStr) {
      setFormDateStr(weekDays[0].dateStr);
    }
  }, [weekDays, formDateStr]);

  // Başlangıç Rezervasyonları
  const [bookings, setBookings] = useState<BookingGroup[]>([
    {
      id: 'B-1',
      facility: 'Havuz Kullanımı',
      dateStr: '2026-08-18',
      startTime: '10:00',
      endTime: '11:00',
      doorNo: 'A-08',
      residentName: 'Zeynep Demir',
      isCurrentUser: false,
      notes: 'Şezlong kullanımı (1 Saat)'
    },
    {
      id: 'B-2',
      facility: 'Sosyal Tesis',
      dateStr: '2026-08-19',
      startTime: '09:00',
      endTime: '10:00', // 1 Saat tek birleşik hücre
      doorNo: 'D08',
      residentName: 'Merve Kaya',
      isCurrentUser: false,
    }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getBookingForSlot = (dateStr: string, slotStr: string) => {
    const [slotStart] = slotStr.split('/');
    return bookings.find(b => {
      if (b.facility !== selectedFacility || b.dateStr !== dateStr) return false;
      return slotStart >= b.startTime && slotStart < b.endTime;
    });
  };

  const getBookingStartingAtSlot = (dateStr: string, slotStr: string) => {
    const [slotStart] = slotStr.split('/');
    return bookings.find(b => b.facility === selectedFacility && b.dateStr === dateStr && b.startTime === slotStart);
  };

  const isSlotInsideExtendedBooking = (dateStr: string, slotStr: string) => {
    const [slotStart] = slotStr.split('/');
    return bookings.some(b => b.facility === selectedFacility && b.dateStr === dateStr && slotStart > b.startTime && slotStart < b.endTime);
  };

  // Hücreye Dokunma / Tıklama
  const handleCellClick = (dateStr: string, dateLabel: string, slotStr: string) => {
    const existing = getBookingForSlot(dateStr, slotStr);

    if (existing) {
      setSelectedBookingDetail(existing);
    } else {
      const [start, end] = slotStr.split('/');
      setActiveSlotModal({ dateStr, dateLabel, startSlot: start, endSlot: end });
    }
  };

  // Hızlı Randevu Oluştur (Modal üzerinden)
  const handleSaveQuickBooking = (e: React.FormEvent) => {
    e.preventDefault();

    const startIdx = timePoints.indexOf(formStartTime);
    if (startIdx < 0) return;

    const endIdx = formDuration === '60' ? startIdx + 2 : startIdx + 1;
    if (endIdx >= timePoints.length) {
      showToast('⚠️ Seçilen saat gün sonunu aşıyor!');
      return;
    }

    const calculatedEndTime = timePoints[endIdx];

    // Çakışma kontrolü
    const hasConflict = bookings.some(b => {
      if (b.facility !== formFacility || b.dateStr !== formDateStr) return false;
      return formStartTime < b.endTime && calculatedEndTime > b.startTime;
    });

    if (hasConflict) {
      showToast('⚠️ Seçilen saat aralığında başka bir rezervasyon var!');
      return;
    }

    const newBooking: BookingGroup = {
      id: `B-${Date.now()}`,
      facility: formFacility,
      dateStr: formDateStr,
      startTime: formStartTime,
      endTime: calculatedEndTime,
      doorNo: formDoorNo.toUpperCase().trim() || 'D23',
      residentName: formResidentName.trim() || 'Sakin',
      isCurrentUser: true,
      notes: formNotes
    };

    try {
      fetch('/api/facility-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility: newBooking.facility,
          dateStr: newBooking.dateStr,
          startTime: newBooking.startTime,
          endTime: newBooking.endTime,
          doorNo: newBooking.doorNo,
          residentName: newBooking.residentName,
          residentCode: currentResident.code,
          notes: newBooking.notes
        })
      });
    } catch (e) {}

    setBookings([...bookings, newBooking]);
    setQuickCreateModal(false);
    setActiveSlotModal(null);
    setFormNotes('');
    showToast(`✅ ${newBooking.doorNo} (${newBooking.startTime} - ${newBooking.endTime}) oluşturuldu!`);
  };

  // Hücreden Tıklayarak Kaydet
  const handleSaveCellBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlotModal) return;

    const newBooking: BookingGroup = {
      id: `B-${Date.now()}`,
      facility: selectedFacility,
      dateStr: activeSlotModal.dateStr,
      startTime: activeSlotModal.startSlot,
      endTime: activeSlotModal.endSlot,
      doorNo: formDoorNo.toUpperCase().trim() || currentResident.doorNo,
      residentName: formResidentName.trim() || currentResident.name,
      isCurrentUser: true,
      notes: formNotes
    };

    try {
      fetch('/api/facility-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility: newBooking.facility,
          dateStr: newBooking.dateStr,
          startTime: newBooking.startTime,
          endTime: newBooking.endTime,
          doorNo: newBooking.doorNo,
          residentName: newBooking.residentName,
          residentCode: currentResident.code,
          notes: newBooking.notes
        })
      });
    } catch (e) {}

    setBookings([...bookings, newBooking]);
    setActiveSlotModal(null);
    setFormNotes('');
    showToast(`✅ ${newBooking.doorNo} (${newBooking.startTime} - ${newBooking.endTime}) oluşturuldu!`);
  };

  const handleDeleteBooking = (id: string) => {
    try {
      fetch(`/api/facility-bookings?id=${id}&residentCode=${currentResident.code}`, {
        method: 'DELETE'
      });
    } catch (e) {}

    setBookings(bookings.filter(b => b.id !== id));
    setSelectedBookingDetail(null);
    showToast('🗑️ Rezervasyon iptal edildi.');
  };

  // 1 Saate Uzat / 30 Dk Düşür
  const handleToggleDuration = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const startIdx = timePoints.indexOf(booking.startTime);
    const endIdx = timePoints.indexOf(booking.endTime);
    const currentDurationSlots = endIdx - startIdx;

    if (currentDurationSlots === 1) {
      if (endIdx + 1 >= timePoints.length) {
        showToast('⚠️ Gün sonu sınırına ulaşıldı!');
        return;
      }

      const nextEndTime = timePoints[endIdx + 1];

      const hasConflict = bookings.some(b => {
        if (b.id === booking.id || b.facility !== selectedFacility || b.dateStr !== booking.dateStr) return false;
        return booking.startTime < b.endTime && nextEndTime > b.startTime;
      });

      if (hasConflict) {
        showToast('⚠️ Sonraki 30 dk slot dolu!');
        return;
      }

      setBookings(bookings.map(b => b.id === bookingId ? { ...b, endTime: nextEndTime } : b));
      showToast(`⏱️ Rezervasyon 1 saate uzatıldı ve tek hücrede birleştirildi!`);
    } else {
      const newEndTime = timePoints[startIdx + 1];
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, endTime: newEndTime } : b));
      showToast(`⏱️ Rezervasyon 30 dakikaya düşürüldü.`);
    }
  };

  // Masaüstü Drag & Drop
  const handleDragStart = (e: React.DragEvent, booking: BookingGroup, action: 'move' | 'extend-down' = 'move') => {
    setDraggedBooking({ booking, action });
    e.dataTransfer.setData('text/plain', booking.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string, timeSlot: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCell({ dateStr, timeSlot });
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string, targetSlotStr: string) => {
    e.preventDefault();
    setDragOverCell(null);

    if (!draggedBooking) return;

    const { booking, action } = draggedBooking;
    const [targetStart, targetEnd] = targetSlotStr.split('/');

    if (action === 'extend-down') {
      const startIdx = timePoints.indexOf(booking.startTime);
      const targetEndIdx = timePoints.indexOf(targetEnd);

      if (targetEndIdx - startIdx > 2) {
        showToast('⚠️ Maksimum rezervasyon süresi 1 saattir!');
        setDraggedBooking(null);
        return;
      }

      if (targetEnd > booking.startTime && targetEndIdx - startIdx === 2) {
        const hasConflict = bookings.some(b => {
          if (b.id === booking.id || b.facility !== selectedFacility || b.dateStr !== booking.dateStr) return false;
          return booking.startTime < b.endTime && targetEnd > b.startTime;
        });

        if (hasConflict) {
          showToast('⚠️ İkinci slot dolu!');
          setDraggedBooking(null);
          return;
        }

        setBookings(bookings.map(b => b.id === booking.id ? { ...b, endTime: targetEnd } : b));
        showToast(`⏱️ 1 saate uzatıldı ve tek hücre olarak birleştirildi!`);
      }
    } else {
      const startIdx = timePoints.indexOf(booking.startTime);
      const endIdx = timePoints.indexOf(booking.endTime);
      const durationSteps = Math.max(1, endIdx - startIdx);

      const targetStartIdx = timePoints.indexOf(targetStart);
      const targetEndIdx = targetStartIdx + durationSteps;

      if (targetEndIdx >= timePoints.length) {
        showToast('⚠️ Rezervasyon gün sonunu aşıyor!');
        setDraggedBooking(null);
        return;
      }

      const newEnd = timePoints[targetEndIdx];

      const hasConflict = bookings.some(b => {
        if (b.id === booking.id || b.facility !== selectedFacility || b.dateStr !== targetDateStr) return false;
        return targetStart < b.endTime && newEnd > b.startTime;
      });

      if (hasConflict) {
        showToast('⚠️ Hedef saat aralığında çakışma var!');
        setDraggedBooking(null);
        return;
      }

      setBookings(bookings.map(b => b.id === booking.id ? { ...b, dateStr: targetDateStr, startTime: targetStart, endTime: newEnd } : b));
      showToast(`🔄 ${booking.doorNo} (${targetStart} - ${newEnd}) saatine taşındı!`);
    }

    setDraggedBooking(null);
  };

  // Butonla Manuel Taşıma
  const handleManualMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveModalBooking || !targetMoveDate || !targetMoveStartTime) return;

    const startIdx = timePoints.indexOf(moveModalBooking.startTime);
    const endIdx = timePoints.indexOf(moveModalBooking.endTime);
    const durationSteps = Math.max(1, endIdx - startIdx);

    const targetStartIdx = timePoints.indexOf(targetMoveStartTime);
    const targetEndIdx = targetStartIdx + durationSteps;

    if (targetEndIdx >= timePoints.length) {
      showToast('⚠️ Seçtiğiniz saat gün sonunu aşıyor!');
      return;
    }

    const targetEnd = timePoints[targetEndIdx];

    const hasConflict = bookings.some(b => {
      if (b.id === moveModalBooking.id || b.facility !== selectedFacility || b.dateStr !== targetMoveDate) return false;
      return (targetMoveStartTime < b.endTime && targetEnd > b.startTime);
    });

    if (hasConflict) {
      showToast('⚠️ Seçtiğiniz hedef aralıkta çakışma var!');
      return;
    }

    setBookings(bookings.map(b => {
      if (b.id === moveModalBooking.id) {
        return {
          ...b,
          dateStr: targetMoveDate,
          startTime: targetMoveStartTime,
          endTime: targetEnd
        };
      }
      return b;
    }));

    showToast(`🔄 ${moveModalBooking.doorNo} (${targetMoveStartTime} - ${targetEnd}) taşındı!`);
    setMoveModalBooking(null);
    setSelectedBookingDetail(null);
  };

  return (
    <div className="space-y-3 pb-8">
      <MobileHeader
        title="Tesis Rezervasyon Takvimi"
        subtitle="Maksimum 1 saat • 2 slot tek birleşik hücre olarak görünür"
        showBack={true}
        backUrl="/sakin"
        type="sakin"
      />

      {/* Canlı Bildirim Toast'u */}
      {toastMessage && (
        <div className="p-2.5 bg-indigo-950/90 border border-indigo-500/60 text-white text-xs font-bold rounded-lg shadow-lg flex items-center justify-between animate-in fade-in duration-200">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2 Adet Tesis Seçim Butonu */}
      <div className="grid grid-cols-2 gap-2">
        {facilities.map(f => {
          const Icon = f.icon;
          const isSelected = selectedFacility === f.name;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setSelectedFacility(f.name);
                setFormFacility(f.name);
              }}
              className={isSelected
                ? "py-2.5 px-3 bg-[#070A11] border border-indigo-500/60 text-indigo-300 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                : "py-2.5 px-3 bg-[#070A11]/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>{f.name}</span>
            </button>
          );
        })}
      </div>

      {/* Hızlı Randevu Al Butonu (Telefonda Garantili Açılır) */}
      <button
        type="button"
        onClick={() => {
          setFormFacility(selectedFacility);
          setQuickCreateModal(true);
        }}
        className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-900/20 hover:bg-indigo-900/40 active:bg-indigo-900/60 border border-indigo-500/50 text-indigo-300 text-xs font-bold rounded-xl transition-all shadow-md gap-2 cursor-pointer active:scale-98"
      >
        <Plus className="w-4 h-4 text-indigo-400" />
        <span>+ Yeni Randevu / Slot Seç</span>
      </button>

      {/* Hafta Gezinme & Bilgi Çubuğu */}
      <div className="p-2 bg-[#070A11] border border-[#151B2B] rounded-xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentWeekOffset(prev => prev - 1)}
            className="w-7 h-7 bg-[#060B14] border border-slate-800 hover:border-slate-600 text-slate-300 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentWeekOffset(0)}
            className="px-2 py-0.5 bg-indigo-950/30 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold rounded-md hover:bg-indigo-900/30 transition-colors cursor-pointer"
          >
            Bu Hafta
          </button>
          <button
            type="button"
            onClick={() => setCurrentWeekOffset(prev => prev + 1)}
            className="w-7 h-7 bg-[#060B14] border border-slate-800 hover:border-slate-600 text-slate-300 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-bold text-white flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {selectedFacility}
          </span>
        </div>
      </div>

      {/* Excel / Grid Çizelge Tablosu */}
      <div className="bg-[#070A11] border border-[#151B2B] rounded-xl overflow-hidden shadow-md">
        <div className="px-2.5 py-1.5 bg-[#0A101D] border-b border-[#151B2B] flex items-center justify-between text-[10px]">
          <span className="text-slate-400 flex items-center gap-1">
            <Maximize2 className="w-3 h-3 text-indigo-400" />
            Hücredeki + işaretine basarak hemen slot seçebilirsiniz
          </span>
          <span className="text-amber-400 font-bold flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-400 border border-amber-300 inline-block" /> Dolu
          </span>
        </div>

        <div className="overflow-x-auto max-h-[520px]">
          <table className="w-full text-center border-collapse min-w-[390px]">
            <thead>
              <tr className="bg-[#060B14] border-b border-[#151B2B] sticky top-0 z-20">
                <th className="py-1.5 px-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 border-r border-[#151B2B] w-14 min-w-[56px] sticky left-0 bg-[#060B14] z-30">
                  Saat
                </th>
                {weekDays.map(day => (
                  <th 
                    key={day.dateStr} 
                    className={`py-1.5 px-0.5 text-[10px] font-bold border-r border-[#151B2B] last:border-r-0 min-w-[42px] bg-[#060B14] ${
                      day.isToday ? 'text-indigo-300 bg-indigo-950/30' : 'text-slate-200'
                    }`}
                  >
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => {
                const [slotStart, slotEnd] = slot.split('/');

                return (
                  <tr key={slot} className="border-b border-[#151B2B] last:border-b-0 hover:bg-slate-900/30 transition-colors h-7">
                    <td className="py-0.5 px-1 text-[9px] font-bold text-slate-400 border-r border-[#151B2B] bg-[#060B14] sticky left-0 z-10 whitespace-nowrap shadow-sm">
                      {slot}
                    </td>

                    {weekDays.map(day => {
                      if (isSlotInsideExtendedBooking(day.dateStr, slot)) {
                        return null;
                      }

                      const booking = getBookingStartingAtSlot(day.dateStr, slot);
                      const isDragTarget = dragOverCell?.dateStr === day.dateStr && dragOverCell?.timeSlot === slot;

                      if (booking) {
                        const startIdx = timePoints.indexOf(booking.startTime);
                        const endIdx = timePoints.indexOf(booking.endTime);
                        const spanCount = Math.min(2, Math.max(1, endIdx - startIdx));
                        const isOneHour = spanCount === 2;

                        return (
                          <td 
                            key={day.dateStr} 
                            rowSpan={spanCount}
                            onClick={() => setSelectedBookingDetail(booking)}
                            onDragOver={(e) => handleDragOver(e, day.dateStr, slot)}
                            onDrop={(e) => handleDrop(e, day.dateStr, slot)}
                            className="p-0.5 border-r border-[#151B2B] last:border-r-0 align-middle relative cursor-pointer select-none"
                            style={{ height: isOneHour ? '56px' : '28px' }}
                          >
                            <div 
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, booking, 'move')}
                              title={`${booking.doorNo}: ${booking.residentName} (${booking.startTime} - ${booking.endTime})`}
                              className={`w-full ${isOneHour ? 'h-[52px]' : 'h-6'} bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded border-2 border-emerald-600 shadow-md flex flex-col items-center justify-center relative transition-all active:scale-95`}
                            >
                              <span className="absolute top-0 right-0 w-0 h-0 border-t-[7px] border-t-red-600 border-l-[7px] border-l-transparent" />
                              <span className="text-[11px] tracking-tight leading-none">{booking.doorNo}</span>
                              {isOneHour && (
                                <span className="text-[8px] text-emerald-950 font-bold opacity-80 mt-0.5">1 Saat</span>
                              )}

                              {!isOneHour && (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleToggleDuration(booking.id);
                                  }}
                                  onTouchStart={(e) => {
                                    e.stopPropagation();
                                    const touch = e.touches[0];
                                    (e.currentTarget as any)._startY = touch.clientY;
                                  }}
                                  onTouchEnd={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    const touch = e.changedTouches[0];
                                    const startY = (e.currentTarget as any)._startY || touch.clientY;
                                    const diffY = touch.clientY - startY;
                                    // İster tek dokunma ister aşağı kaydırma olsun, 1 saate uzat
                                    handleToggleDuration(booking.id);
                                  }}
                                  title="Aşağı çekerek veya tek dokunuşla 1 saate uzatın"
                                  className="absolute -bottom-2 -right-2 w-7 h-7 flex items-center justify-center cursor-pointer z-30 touch-manipulation"
                                >
                                  {/* Görsel Yeşil Excel Noktası */}
                                  <span className="w-3.5 h-3.5 bg-emerald-600 hover:bg-emerald-400 active:bg-emerald-300 border-2 border-white rounded-sm shadow-lg flex items-center justify-center animate-pulse" />
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      }

                      // Boş Hücre (Parmakla Dokunulduğunda Garantili Modal Açar)
                      return (
                        <td 
                          key={day.dateStr} 
                          onClick={() => handleCellClick(day.dateStr, day.fullLabel, slot)}
                          onDragOver={(e) => handleDragOver(e, day.dateStr, slot)}
                          onDrop={(e) => handleDrop(e, day.dateStr, slot)}
                          className={`p-0.5 border-r border-[#151B2B] last:border-r-0 h-7 relative cursor-pointer transition-colors ${
                            isDragTarget ? 'bg-indigo-950/60 border-2 border-indigo-400' : ''
                          }`}
                        >
                          <div
                            onClick={(e) => {
                              e.preventDefault();
                              handleCellClick(day.dateStr, day.fullLabel, slot);
                            }}
                            className="w-full h-6 rounded border border-slate-800/80 bg-[#060B14]/60 active:bg-indigo-900/60 transition-all flex items-center justify-center text-slate-500 hover:text-indigo-300 text-[11px] font-bold select-none cursor-pointer"
                          >
                            +
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. HIZLI RANDEVU OLUŞTURMA MODALI (Üst Buton Açılışı - z-[9999]) */}
      {quickCreateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-sm bg-[#070A11] border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setFormDoorNo('D23'); setFormNotes(''); }}
                  className="flex items-center px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Sıfırla
                </button>
                <h3 className="text-xs font-bold text-white">Yeni Rezervasyon</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickCreateModal(false)}
                className="w-7 h-7 rounded-lg border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickBooking} className="space-y-2.5">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Tesis Seçiniz *
                </label>
                <select
                  value={formFacility}
                  onChange={(e) => setFormFacility(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/60"
                >
                  {facilities.map(f => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Tarih Seçiniz *
                </label>
                <select
                  value={formDateStr}
                  onChange={(e) => setFormDateStr(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/60"
                >
                  {weekDays.map(d => (
                    <option key={d.dateStr} value={d.dateStr}>{d.fullLabel} ({d.dateStr})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Başlangıç Saati *
                  </label>
                  <select
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/60"
                  >
                    {timePoints.slice(0, -1).map(tp => (
                      <option key={tp} value={tp}>{tp}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Süre (Maks 1 Sa) *
                  </label>
                  <select
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value as '30' | '60')}
                    className="w-full px-2 py-1.5 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/60"
                  >
                    <option value="30">30 Dakika</option>
                    <option value="60">1 Saat (Tek Hücre)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Daire / Kapı No *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: D23"
                  value={formDoorNo}
                  onChange={(e) => setFormDoorNo(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Sakin Adı Soyadı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Serdar Doğruer"
                  value={formResidentName}
                  onChange={(e) => setFormResidentName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Ek Not
                </label>
                <input
                  type="text"
                  placeholder="İsteğe bağlı..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuickCreateModal(false)}
                  className="px-4 py-1.5 bg-transparent border border-slate-600/50 text-slate-400 hover:bg-slate-800/30 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex items-center px-5 py-1.5 bg-indigo-900/20 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-900/40 text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Randevuyu Onayla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. HÜCRE TIKLAMASI İLE RANDVUE ONAY POP-UP'I (z-[9999]) */}
      {activeSlotModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-sm bg-[#070A11] border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setFormDoorNo('D23'); setFormNotes(''); }}
                  className="flex items-center px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Sıfırla
                </button>
                <h3 className="text-xs font-bold text-white">Randevu Onayı</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSlotModal(null)}
                className="w-7 h-7 rounded-lg border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-2.5 bg-[#060B14] border border-indigo-500/30 rounded-xl space-y-1">
              <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider block">
                {selectedFacility}
              </span>
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>{activeSlotModal.dateLabel}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-900/30 border border-indigo-500/40 text-indigo-300">
                  {activeSlotModal.startSlot} - {activeSlotModal.endSlot} (30 Dk)
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveCellBooking} className="space-y-2.5">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Daire / Kapı No *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: D23"
                  value={formDoorNo}
                  onChange={(e) => setFormDoorNo(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Sakin Adı Soyadı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Serdar Doğruer"
                  value={formResidentName}
                  onChange={(e) => setFormResidentName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Ek Açıklama / Not
                </label>
                <input
                  type="text"
                  placeholder="İsteğe bağlı not..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveSlotModal(null)}
                  className="px-4 py-1.5 bg-transparent border border-slate-600/50 text-slate-400 hover:bg-slate-800/30 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex items-center px-5 py-1.5 bg-indigo-900/20 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-900/40 text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Randevuyu Onayla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DETAY POP-UP'I (z-[9999]) */}
      {selectedBookingDetail && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-sm bg-[#070A11] border border-amber-500/40 rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                {selectedBookingDetail.isCurrentUser && (
                  <button
                    type="button"
                    onClick={() => handleDeleteBooking(selectedBookingDetail.id)}
                    className="flex items-center px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> İptal Et
                  </button>
                )}
                <h3 className="text-xs font-bold text-white">Rezervasyon Detayı</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingDetail(null)}
                className="w-7 h-7 rounded-lg border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 bg-[#FFF9D2] border border-amber-300 rounded-xl text-slate-900 space-y-1 shadow-md">
              <div className="flex items-center justify-between font-black text-xs">
                <span>PC: {selectedBookingDetail.doorNo}</span>
                <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded border border-amber-400 font-bold">
                  {selectedBookingDetail.startTime} - {selectedBookingDetail.endTime}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-950">
                {selectedBookingDetail.doorNo}: {selectedBookingDetail.residentName}
              </p>
              {selectedBookingDetail.notes && (
                <p className="text-[10px] text-slate-700 italic border-t border-amber-300/80 pt-1 mt-1">
                  Not: {selectedBookingDetail.notes}
                </p>
              )}
            </div>

            <div className="p-2.5 bg-[#060B14] border border-[#151B2B] rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold text-[11px]">Süre Ayarı (Maks 1 Sa):</span>
              <button
                type="button"
                onClick={() => {
                  handleToggleDuration(selectedBookingDetail.id);
                  const updated = bookings.find(b => b.id === selectedBookingDetail.id);
                  if (updated) setSelectedBookingDetail(updated);
                }}
                className="px-3 py-1 bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                {timePoints.indexOf(selectedBookingDetail.endTime) - timePoints.indexOf(selectedBookingDetail.startTime) === 2
                  ? '30 Dk Yap'
                  : '1 Saat Yap (Birleştir)'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">TARİH</span>
                <span className="text-xs font-bold text-indigo-300">{selectedBookingDetail.dateStr}</span>
              </div>
              <div className="flex flex-col items-center justify-center h-[52px] shrink-0 bg-[#060B14] border border-[#151B2B] rounded-lg shadow-sm px-2 text-center">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400/80 mb-0.5">TESİS</span>
                <span className="text-xs font-bold text-emerald-300 truncate w-full">{selectedBookingDetail.facility}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMoveModalBooking(selectedBookingDetail);
                  setTargetMoveDate(selectedBookingDetail.dateStr);
                  setTargetMoveStartTime(selectedBookingDetail.startTime);
                }}
                className="px-3 py-1.5 bg-indigo-900/20 hover:bg-indigo-900/40 border border-indigo-500/40 text-indigo-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" /> Başka Saate Taşı
              </button>

              <button
                type="button"
                onClick={() => setSelectedBookingDetail(null)}
                className="px-4 py-1.5 bg-transparent border border-slate-600/50 text-slate-400 hover:bg-slate-800/30 hover:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. BAŞKA SAATE TAŞIMA POP-UP'I (z-[9999]) */}
      {moveModalBooking && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-sm bg-[#070A11] border border-indigo-500/40 rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-indigo-400" /> Rezervasyonu Taşı
              </h3>
              <button
                type="button"
                onClick={() => setMoveModalBooking(null)}
                className="w-7 h-7 rounded-lg border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleManualMove} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Hedef Gün Seçiniz
                </label>
                <select
                  value={targetMoveDate}
                  onChange={(e) => setTargetMoveDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/60"
                >
                  {weekDays.map(d => (
                    <option key={d.dateStr} value={d.dateStr}>{d.fullLabel} ({d.dateStr})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Yeni Başlangıç Saati
                </label>
                <select
                  value={targetMoveStartTime}
                  onChange={(e) => setTargetMoveStartTime(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#060B14] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/60"
                >
                  {timePoints.slice(0, -1).map(tp => (
                    <option key={tp} value={tp}>{tp}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMoveModalBooking(null)}
                  className="px-4 py-1.5 bg-transparent border border-slate-600/50 text-slate-400 hover:bg-slate-800/30 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex items-center px-5 py-1.5 bg-indigo-900/20 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-900/40 text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Taşımayı Onayla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
