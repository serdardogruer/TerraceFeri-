'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { ApiClient } from '@/lib/api-client';
import { 
  Gauge, Plus, X, Edit, Trash2, Save, Calendar,
  Printer, Zap, Flame, Droplets, ChevronLeft, ChevronRight,
  Sparkles, RefreshCw
} from 'lucide-react';

interface MeterReading {
  id: string;
  meterId: string;
  meterNo: string;
  type: string; // 'Elektrik' | 'Su' | 'Doğalgaz'
  unit: string;
  readDate: string;
  readTime: string;
  aktif: number;
  prevAktif: number;
  reaktif: number;
  prevReaktif: number;
  kapasitif: number;
  prevKapasitif: number;
  value: number;
  prevValue: number;
  status: string;
  notes?: string;
}

interface Meter {
  id: string;
  meterNo: string;
  name: string;
  type: string;
  unit: string;
}

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

function getRandomReportCode(): string {
  return `TMM-SAYAÇ-${Math.floor(Math.random() * 9000) + 1000}`;
}

export default function MetersPage() {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  
  // View mode: 'excel' (Aylık Excel Çizelgesi) or 'single' (Sayaç Bazlı Liste)
  const [viewMode, setViewMode] = useState<'excel' | 'single'>('excel');

  // Selected Month & Year for Excel View
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Default to current month/year (August 2026)
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1); // 1-indexed (8 = Ağustos)

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Quick Daily Full-Row Entry Modal (for entering all meters at once on a given day)
  const [isDayEntryModalOpen, setIsDayEntryModalOpen] = useState(false);
  const [dayEntryDate, setDayEntryDate] = useState(todayStr);
  const [dayEntryReaktif580, setDayEntryReaktif580] = useState<number | ''>('');
  const [dayEntryKap880, setDayEntryKap880] = useState<number | ''>('');
  const [dayEntryAktif180, setDayEntryAktif180] = useState<number | ''>('');
  const [dayEntryGas, setDayEntryGas] = useState<number | ''>('');
  const [dayEntrySuDaire, setDayEntrySuDaire] = useState<number | ''>('');
  const [dayEntrySuDuk, setDayEntrySuDuk] = useState<number | ''>('');

  // Add Meter Modal state
  const [isAddMeterModalOpen, setIsAddMeterModalOpen] = useState(false);
  const [newMeterNo, setNewMeterNo] = useState('');
  const [newMeterName, setNewMeterName] = useState('');
  const [newMeterType, setNewMeterType] = useState('Elektrik');

  // Single Entry Form state
  const [meterId, setMeterId] = useState('');
  const [meterNo, setMeterNo] = useState('ELEK-ANA-01');
  const [type, setType] = useState('Elektrik');
  const [readDate, setReadDate] = useState(todayStr);
  const [readTime, setReadTime] = useState(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
  const [aktif, setAktif] = useState<number | ''>('');
  const [prevAktif, setPrevAktif] = useState<number | ''>('');
  const [reaktif, setReaktif] = useState<number | ''>('');
  const [prevReaktif, setPrevReaktif] = useState<number | ''>('');
  const [kapasitif, setKapasitif] = useState<number | ''>('');
  const [prevKapasitif, setPrevKapasitif] = useState<number | ''>('');
  const [value, setValue] = useState<number | ''>('');
  const [prevValue, setPrevValue] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Printable Report Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportCode, setReportCode] = useState('');

  // Inline edit state in Excel Grid
  const [editingCell, setEditingCell] = useState<{ date: string; field: string } | null>(null);
  const [cellTempVal, setCellTempVal] = useState<string>('');

  // Auto-fill Sundays state
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillMsg, setAutoFillMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await ApiClient.get<{ success: boolean; data: MeterReading[]; meters: Meter[] }>('/api/meters');
        if (isMounted && res?.success) {
          setReadings(res.data);
          if (res.meters) {
            setMeters(res.meters);
            if (res.meters.length > 0) setActiveTab(res.meters[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch meters:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  // Helper to get days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Generate date strings for the whole month (e.g. 2026-07-01 to 2026-07-31)
  const monthDates = useMemo(() => {
    const dates: string[] = [];
    const mStr = String(selectedMonth).padStart(2, '0');
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = String(d).padStart(2, '0');
      dates.push(`${selectedYear}-${mStr}-${dStr}`);
    }
    return dates;
  }, [selectedYear, selectedMonth, daysInMonth]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  // Helper to find readings by type and date
  const getReadingsForDate = (dateStr: string) => {
    const dateReadings = readings.filter(r => r.readDate === dateStr);
    const elek = dateReadings.find(r => r.type === 'Elektrik');
    const gas = dateReadings.find(r => r.type === 'Doğalgaz');
    
    // Distinguish Su Daireler & Su Dükkanlar
    let suDaire = dateReadings.find(r => {
      if (r.type !== 'Su') return false;
      const m = meters.find(meter => meter.id === r.meterId);
      const name = (m?.name || r.meterNo || '').toLowerCase();
      return name.includes('daire') || r.meterId === 'm-su-daire';
    });

    let suDuk = dateReadings.find(r => {
      if (r.type !== 'Su') return false;
      const m = meters.find(meter => meter.id === r.meterId);
      const name = (m?.name || r.meterNo || '').toLowerCase();
      return name.includes('dükkan') || name.includes('dukkan') || r.meterId === 'm-su-dukkan';
    });

    if (!suDaire && !suDuk) {
      suDaire = dateReadings.find(r => r.type === 'Su');
    }

    return { elek, gas, suDaire, suDuk };
  };

  // Open single meter reading modal
  const openModal = (r?: MeterReading) => {
    const now = new Date();
    if (r) {
      setEditingId(r.id);
      setMeterId(r.meterId || '');
      setMeterNo(r.meterNo);
      setType(r.type);
      setReadDate(r.readDate || todayStr);
      setReadTime(r.readTime || now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
      setAktif(r.aktif);
      setPrevAktif(r.prevAktif);
      setReaktif(r.reaktif);
      setPrevReaktif(r.prevReaktif);
      setKapasitif(r.kapasitif);
      setPrevKapasitif(r.prevKapasitif);
      setValue(r.value);
      setPrevValue(r.prevValue);
      setNotes(r.notes || '');
    } else {
      setEditingId(null);
      const currentMeter = meters.find(m => m.id === activeTab) || meters[0];
      if (currentMeter) {
        setMeterId(currentMeter.id);
        setMeterNo(currentMeter.meterNo);
        setType(currentMeter.type);
      }
      setReadDate(todayStr);
      setReadTime(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
      setAktif('');
      setPrevAktif('');
      setReaktif('');
      setPrevReaktif('');
      setKapasitif('');
      setPrevKapasitif('');
      setValue('');
      setPrevValue('');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  // Open Full Day Entry Modal
  const openDayEntryModal = (dateStr: string) => {
    setDayEntryDate(dateStr);
    const { elek, gas, suDaire, suDuk } = getReadingsForDate(dateStr);
    setDayEntryReaktif580(elek ? elek.reaktif : '');
    setDayEntryKap880(elek ? elek.kapasitif : '');
    setDayEntryAktif180(elek ? elek.aktif : '');
    setDayEntryGas(gas ? gas.value : '');
    setDayEntrySuDaire(suDaire ? suDaire.value : '');
    setDayEntrySuDuk(suDuk ? suDuk.value : '');
    setIsDayEntryModalOpen(true);
  };

  // Save Full Day Entry
  const handleSaveDayEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const elekMeter = meters.find(m => m.type === 'Elektrik') || { id: 'm-elek-main', meterNo: 'ELEK-ANA-01', type: 'Elektrik', unit: 'kWh' };
      const gasMeter = meters.find(m => m.type === 'Doğalgaz') || { id: 'm-gas-main', meterNo: 'GAS-ANA-01', type: 'Doğalgaz', unit: 'm³' };
      const suDaireMeter = meters.find(m => m.id === 'm-su-daire' || m.name.toLowerCase().includes('daire')) || { id: 'm-su-daire', meterNo: 'SU-DAIRE-01', type: 'Su', unit: 'm³' };
      const suDukMeter = meters.find(m => m.id === 'm-su-dukkan' || m.name.toLowerCase().includes('dükkan')) || { id: 'm-su-dukkan', meterNo: 'SU-DUKKAN-01', type: 'Su', unit: 'm³' };

      const { elek, gas, suDaire, suDuk } = getReadingsForDate(dayEntryDate);

      // 1. Elektrik
      if (dayEntryAktif180 !== '' || dayEntryReaktif580 !== '' || dayEntryKap880 !== '') {
        const payload = {
          meterId: elekMeter.id,
          meterNo: elekMeter.meterNo,
          type: 'Elektrik',
          readDate: dayEntryDate,
          readTime: '10:00',
          aktif: Number(dayEntryAktif180) || 0,
          reaktif: Number(dayEntryReaktif580) || 0,
          kapasitif: Number(dayEntryKap880) || 0,
          value: Number(dayEntryAktif180) || 0,
          notes: 'Günlük Excel girişi'
        };

        if (elek) {
          await ApiClient.put('/api/meters', { id: elek.id, ...payload });
        } else {
          await ApiClient.post('/api/meters', payload);
        }
      }

      // 2. Doğalgaz
      if (dayEntryGas !== '') {
        const payload = {
          meterId: gasMeter.id,
          meterNo: gasMeter.meterNo,
          type: 'Doğalgaz',
          readDate: dayEntryDate,
          readTime: '10:00',
          value: Number(dayEntryGas) || 0,
          aktif: 0, reaktif: 0, kapasitif: 0,
          notes: 'Günlük gaz okuması'
        };

        if (gas) {
          await ApiClient.put('/api/meters', { id: gas.id, ...payload });
        } else {
          await ApiClient.post('/api/meters', payload);
        }
      }

      // 3. Su Daireler
      if (dayEntrySuDaire !== '') {
        const payload = {
          meterId: suDaireMeter.id,
          meterNo: suDaireMeter.meterNo,
          type: 'Su',
          readDate: dayEntryDate,
          readTime: '10:00',
          value: Number(dayEntrySuDaire) || 0,
          aktif: 0, reaktif: 0, kapasitif: 0,
          notes: 'Daireler su sayacı'
        };

        if (suDaire) {
          await ApiClient.put('/api/meters', { id: suDaire.id, ...payload });
        } else {
          await ApiClient.post('/api/meters', payload);
        }
      }

      // 4. Su Dükkanlar
      if (dayEntrySuDuk !== '') {
        const payload = {
          meterId: suDukMeter.id,
          meterNo: suDukMeter.meterNo,
          type: 'Su',
          readDate: dayEntryDate,
          readTime: '10:00',
          value: Number(dayEntrySuDuk) || 0,
          aktif: 0, reaktif: 0, kapasitif: 0,
          notes: 'Dükkanlar su sayacı'
        };

        if (suDuk) {
          await ApiClient.put('/api/meters', { id: suDuk.id, ...payload });
        } else {
          await ApiClient.post('/api/meters', payload);
        }
      }

      // Reload readings
      const res = await ApiClient.get<{ success: boolean; data: MeterReading[]; meters: Meter[] }>('/api/meters');
      if (res?.success) {
        setReadings(res.data);
      }

      setIsDayEntryModalOpen(false);
    } catch (err) {
      console.error('Failed to save day entry:', err);
    }
  };

  // Quick Inline Cell Save
  const handleSaveCell = async (dateStr: string, field: string, valStr: string) => {
    setEditingCell(null);
    const numVal = parseFloat(valStr);
    if (isNaN(numVal) && valStr.trim() !== '') return;

    try {
      const { elek, gas, suDaire, suDuk } = getReadingsForDate(dateStr);
      const elekMeter = meters.find(m => m.type === 'Elektrik') || { id: 'm-elek-main', meterNo: 'ELEK-ANA-01', type: 'Elektrik', unit: 'kWh' };
      const gasMeter = meters.find(m => m.type === 'Doğalgaz') || { id: 'm-gas-main', meterNo: 'GAS-ANA-01', type: 'Doğalgaz', unit: 'm³' };
      const suDaireMeter = meters.find(m => m.id === 'm-su-daire' || m.name.toLowerCase().includes('daire')) || { id: 'm-su-daire', meterNo: 'SU-DAIRE-01', type: 'Su', unit: 'm³' };
      const suDukMeter = meters.find(m => m.id === 'm-su-dukkan' || m.name.toLowerCase().includes('dükkan')) || { id: 'm-su-dukkan', meterNo: 'SU-DUKKAN-01', type: 'Su', unit: 'm³' };

      if (field === 'reaktif580' || field === 'kap880' || field === 'aktif180') {
        const payload = {
          meterId: elekMeter.id,
          meterNo: elekMeter.meterNo,
          type: 'Elektrik',
          readDate: dateStr,
          readTime: '10:00',
          aktif: field === 'aktif180' ? numVal : (elek?.aktif || 0),
          reaktif: field === 'reaktif580' ? numVal : (elek?.reaktif || 0),
          kapasitif: field === 'kap880' ? numVal : (elek?.kapasitif || 0),
          value: field === 'aktif180' ? numVal : (elek?.aktif || 0),
          notes: 'Hızlı hücre girişi'
        };
        if (elek) {
          await ApiClient.put('/api/meters', { id: elek.id, ...payload });
        } else {
          await ApiClient.post('/api/meters', payload);
        }
      } else if (field === 'gas') {
        const payload = {
          meterId: gasMeter.id,
          meterNo: gasMeter.meterNo,
          type: 'Doğalgaz',
          readDate: dateStr,
          readTime: '10:00',
          value: numVal,
          aktif: 0, reaktif: 0, kapasitif: 0,
          notes: 'Hızlı hücre girişi'
        };
        if (gas) {
          await ApiClient.put('/api/meters', { id: gas.id, ...payload });
        } else {
          await ApiClient.post('/api/meters', payload);
        }
      } else if (field === 'suDaire') {
        const payload = {
          meterId: suDaireMeter.id,
          meterNo: suDaireMeter.meterNo,
          type: 'Su',
          readDate: dateStr,
          readTime: '10:00',
          value: numVal,
          aktif: 0, reaktif: 0, kapasitif: 0,
          notes: 'Hızlı hücre girişi'
        };
        if (suDaire) {
          await ApiClient.put('/api/meters', { id: suDaire.id, ...payload });
        } else {
          await ApiClient.post('/api/meters', payload);
        }
      } else if (field === 'suDuk') {
        const payload = {
          meterId: suDukMeter.id,
          meterNo: suDukMeter.meterNo,
          type: 'Su',
          readDate: dateStr,
          readTime: '10:00',
          value: numVal,
          aktif: 0, reaktif: 0, kapasitif: 0,
          notes: 'Hızlı hücre girişi'
        };
        if (suDuk) {
          await ApiClient.put('/api/meters', { id: suDuk.id, ...payload });
        } else {
          await ApiClient.post('/api/meters', payload);
        }
      }

      // Reload
      const res = await ApiClient.get<{ success: boolean; data: MeterReading[]; meters: Meter[] }>('/api/meters');
      if (res?.success) {
        setReadings(res.data);
      }
    } catch (err) {
      console.error('Failed to update cell:', err);
    }
  };

  // CSV Export for current month
  const exportToCSV = () => {
    const mName = MONTH_NAMES[selectedMonth - 1];
    let csv = `TERRACE FERİ KONUTLARI\nAYLIK SAYAÇLAR OKUMA LİSTESİ - ${mName.toUpperCase()} ${selectedYear}\n\n`;
    csv += `OKUMA TARİHİ,ELEKTRİK .5.8.0,ELEKTRİK .8.8.0,ELEKTRİK .1.8.0,DOĞALGAZ,SU DAİRELER,SU DÜKKANLAR\n`;

    monthDates.forEach(d => {
      const p = d.split('-');
      const formattedDate = `${p[2]}.${p[1]}.${p[0]}`;
      const { elek, gas, suDaire, suDuk } = getReadingsForDate(d);
      csv += `${formattedDate},${elek?.reaktif || ''},${elek?.kapasitif || ''},${elek?.aktif || ''},${gas?.value || ''},${suDaire?.value || ''},${suDuk?.value || ''}\n`;
    });

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TerraceFeri_Sayac_Okuma_${mName}_${selectedYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper to calculate daily consumption (day-over-day difference)
  const getDailyDiffs = (dateStr: string) => {
    const current = getReadingsForDate(dateStr);

    // Find the immediately preceding valid reading before dateStr
    const prevDates = readings
      .filter(r => r.readDate < dateStr && ((r.aktif && r.aktif > 0) || (r.value && r.value > 0)))
      .map(r => r.readDate)
      .sort();

    const prevDate = prevDates.length > 0 ? prevDates[prevDates.length - 1] : null;
    const prev = prevDate ? getReadingsForDate(prevDate) : null;

    const calcDiff = (curr?: number, p?: number) => {
      if (curr !== undefined && p !== undefined && curr > 0 && p > 0 && curr >= p) {
        return curr - p;
      }
      return null;
    };

    // 01.08.2026 başlangıç günü için geçmiş tüketim olmadığından tüketim sütunları boş (-) bırakılır
    if (dateStr === '2026-08-01') {
      return {
        reaktifDiff: null,
        kapDiff: null,
        aktifDiff: null,
        gasDiff: null,
        suDaireDiff: null,
        suDukDiff: null,
        reaktifRatio: null,
        kapRatio: null,
        isReaktifCeza: false,
        isKapCeza: false,
        isGasHigh: false,
        isSuDaireHigh: false,
        isSuDukHigh: false
      };
    }

    const reaktifDiff = calcDiff(current.elek?.reaktif, prev?.elek?.reaktif);
    const kapDiff = calcDiff(current.elek?.kapasitif, prev?.elek?.kapasitif);
    const aktifDiff = calcDiff(current.elek?.aktif, prev?.elek?.aktif);
    const gasDiff = calcDiff(current.gas?.value, prev?.gas?.value);
    const suDaireDiff = calcDiff(current.suDaire?.value, prev?.suDaire?.value);
    const suDukDiff = calcDiff(current.suDuk?.value, prev?.suDuk?.value);

    let reaktifRatio: number | null = null;
    let kapRatio: number | null = null;
    let isReaktifCeza = false;
    let isKapCeza = false;

    if (aktifDiff !== null && aktifDiff > 0) {
      if (reaktifDiff !== null) {
        reaktifRatio = (reaktifDiff / aktifDiff) * 100;
        isReaktifCeza = reaktifRatio > 20.0;
      }
      if (kapDiff !== null) {
        kapRatio = (kapDiff / aktifDiff) * 100;
        isKapCeza = kapRatio > 15.0;
      }
    }

    // Doğalgaz ve Su için yüksek tüketim / kaçak şüphesi eşikleri (örn: Doğalgaz ≥500 m³, Su Daire ≥50 m³, Su Dükkan ≥20 m³)
    const isGasHigh = gasDiff !== null && gasDiff >= 500;
    const isSuDaireHigh = suDaireDiff !== null && suDaireDiff >= 50;
    const isSuDukHigh = suDukDiff !== null && suDukDiff >= 20;

    return {
      reaktifDiff,
      kapDiff,
      aktifDiff,
      gasDiff,
      suDaireDiff,
      suDukDiff,
      reaktifRatio,
      kapRatio,
      isReaktifCeza,
      isKapCeza,
      isGasHigh,
      isSuDaireHigh,
      isSuDukHigh
    };
  };

  // Monthly Consumption Summary & Financial Projections Calculations
  const monthlySummary = useMemo(() => {
    // Resmi Fatura Birim Fiyatları (İGDAŞ & İSKİ Faturalarından Alınan)
    const UNIT_PRICES = {
      gas: 21.1634,      // İGDAŞ Resmi Fatura: 19.682,00 TL / 930 m³ = 21,16 TL/m³ (KDV Dahil)
      suDaire: 101.4318, // İSKİ Daireler Resmi Fatura: 49.093,00 TL / 484 m³ = 101,43 TL/m³ (KDV & ÇTV Dahil)
      suDuk: 229.00,     // İSKİ Dükkanlar Resmi Fatura: 458,00 TL / 2 m³ = 229,00 TL/m³ (İşyeri Tarifesi)
      elek: 3.85,        // Elektrik T1 Aktif Tahmini Birim Fiyat: 3,85 TL/kWh
    };

    let elekReaktifDiff = 0;
    let elekKapDiff = 0;
    let elekAktifDiff = 0;
    let gasDiff = 0;
    let suDaireDiff = 0;
    let suDukDiff = 0;
    let consumptionDays = 0;

    monthDates.forEach(d => {
      const diffs = getDailyDiffs(d);
      let dayHasVal = false;

      if (diffs.aktifDiff !== null && diffs.aktifDiff > 0) {
        elekAktifDiff += diffs.aktifDiff;
        dayHasVal = true;
      }
      if (diffs.reaktifDiff !== null && diffs.reaktifDiff > 0) {
        elekReaktifDiff += diffs.reaktifDiff;
      }
      if (diffs.kapDiff !== null && diffs.kapDiff > 0) {
        elekKapDiff += diffs.kapDiff;
      }
      if (diffs.gasDiff !== null && diffs.gasDiff > 0) {
        gasDiff += diffs.gasDiff;
        dayHasVal = true;
      }
      if (diffs.suDaireDiff !== null && diffs.suDaireDiff > 0) {
        suDaireDiff += diffs.suDaireDiff;
        dayHasVal = true;
      }
      if (diffs.suDukDiff !== null && diffs.suDukDiff > 0) {
        suDukDiff += diffs.suDukDiff;
        dayHasVal = true;
      }

      if (dayHasVal) {
        consumptionDays++;
      }
    });

    const totalDaysInMonth = monthDates.length;
    const dayCount = Math.max(1, consumptionDays);
    const hasData = elekAktifDiff > 0 || gasDiff > 0 || suDaireDiff > 0 || suDukDiff > 0;

    const reaktifRatio = elekAktifDiff > 0 ? (elekReaktifDiff / elekAktifDiff) * 100 : 0;
    const kapRatio = elekAktifDiff > 0 ? (elekKapDiff / elekAktifDiff) * 100 : 0;
    const isReaktifCeza = reaktifRatio > 20.0;
    const isKapCeza = kapRatio > 15.0;

    // 1. Mevcut Tüketim Tutarları (TL)
    const elekCost = elekAktifDiff * UNIT_PRICES.elek;
    const gasCost = gasDiff * UNIT_PRICES.gas;
    const suDaireCost = suDaireDiff * UNIT_PRICES.suDaire;
    const suDukCost = suDukDiff * UNIT_PRICES.suDuk;
    const totalCurrentCost = elekCost + gasCost + suDaireCost + suDukCost;

    // 2. Günlük Ortalama Maliyetler (TL/Gün)
    const elekDailyCost = elekCost / dayCount;
    const gasDailyCost = gasCost / dayCount;
    const suDaireDailyCost = suDaireCost / dayCount;
    const suDukDailyCost = suDukCost / dayCount;
    const totalDailyCost = totalCurrentCost / dayCount;

    // 3. Ay Sonu Tahmini Gelecek Fatura Tutarları (TL)
    const elekProjectedCost = elekDailyCost * totalDaysInMonth;
    const gasProjectedCost = gasDailyCost * totalDaysInMonth;
    const suDaireProjectedCost = suDaireDailyCost * totalDaysInMonth;
    const suDukProjectedCost = suDukDailyCost * totalDaysInMonth;
    const totalProjectedCost = totalDailyCost * totalDaysInMonth;

    return {
      hasData,
      dayCount,
      totalDaysInMonth,
      elekReaktifDiff,
      elekKapDiff,
      elekAktifDiff,
      gasDiff,
      suDaireDiff,
      suDukDiff,
      reaktifRatio,
      kapRatio,
      isReaktifCeza,
      isKapCeza,
      // 1. Mevcut Tüketim Tutarları
      elekCost,
      gasCost,
      suDaireCost,
      suDukCost,
      totalCurrentCost,
      // 2. Günlük Ortalama Maliyetler
      elekDailyCost,
      gasDailyCost,
      suDaireDailyCost,
      suDukDailyCost,
      totalDailyCost,
      // 3. Ay Sonu Tahmini Tutarları
      elekProjectedCost,
      gasProjectedCost,
      suDaireProjectedCost,
      suDukProjectedCost,
      totalProjectedCost,
      unitPrices: UNIT_PRICES
    };
  }, [readings, monthDates]);

  // Single meter submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        meterId,
        meterNo,
        type,
        readDate,
        readTime,
        aktif: Number(aktif) || 0,
        prevAktif: Number(prevAktif) || 0,
        reaktif: Number(reaktif) || 0,
        prevReaktif: Number(prevReaktif) || 0,
        kapasitif: Number(kapasitif) || 0,
        prevKapasitif: Number(prevKapasitif) || 0,
        value: Number(value) || 0,
        prevValue: Number(prevValue) || 0,
        notes
      };

      if (editingId) {
        const res = await ApiClient.put<{ success: boolean; data: MeterReading }>('/api/meters', {
          id: editingId,
          ...payload
        });
        if (res?.success) {
          setReadings(readings.map(r => r.id === editingId ? res.data : r));
          closeModal();
        }
      } else {
        const res = await ApiClient.post<{ success: boolean; data: MeterReading }>('/api/meters', payload);
        if (res?.success) {
          setReadings([res.data, ...readings]);
          closeModal();
        }
      }
    } catch (error) {
      console.error('Failed to save daily reading', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu günlük okuma kaydını silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/meters?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReadings(readings.filter(r => r.id !== id));
        if (isModalOpen) closeModal();
      }
    } catch (error) {
      console.error('Failed to delete reading', error);
    }
  };

  const handleDeleteMeter = async () => {
    if (!activeTab) return;
    if (!confirm('Bu sayacı ve ona ait tüm günlük okumaları silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/meters/registry?id=${activeTab}`, { method: 'DELETE' });
      if (res.ok) {
        const remainingMeters = meters.filter(m => m.id !== activeTab);
        setMeters(remainingMeters);
        setReadings(readings.filter(r => r.meterId !== activeTab));
        setActiveTab(remainingMeters.length > 0 ? remainingMeters[0].id : '');
      }
    } catch (error) {
      console.error('Failed to delete meter', error);
    }
  };

  const openReportModal = () => {
    setReportCode(getRandomReportCode());
    setIsReportModalOpen(true);
  };

  const filteredReadings = useMemo(() => {
    return readings.filter(r => r.meterId === activeTab);
  }, [readings, activeTab]);

  const handleAutoFillSundays = async () => {
    if (!confirm(`${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} ayındaki tüm Pazar günleri, önceki günlerin günlük tüketim ortalamalarına göre otomatik hesaplanıp girilecektir. Onaylıyor musunuz?`)) {
      return;
    }

    setIsAutoFilling(true);
    setAutoFillMsg(null);
    try {
      const res = await ApiClient.post<{
        success: boolean;
        filledCount: number;
        filledDates: string[];
        readings: MeterReading[];
        message: string;
      }>('/api/meters/autofill-sundays', {
        year: selectedYear,
        month: selectedMonth
      });

      if (res?.success) {
        if (res.readings) {
          setReadings(res.readings);
        }
        setAutoFillMsg(res.filledCount > 0 ? `✅ ${res.message}` : `ℹ️ ${MONTH_NAMES[selectedMonth - 1]} ayındaki Pazar günleri zaten kayıtlı.`);
        setTimeout(() => setAutoFillMsg(null), 5000);
      } else {
        setAutoFillMsg('❌ Otomatik doldurma sırasında bir hata oluştu.');
        setTimeout(() => setAutoFillMsg(null), 4000);
      }
    } catch (e) {
      console.error('Failed to auto-fill sundays', e);
      setAutoFillMsg('❌ Sunucu bağlantı hatası.');
      setTimeout(() => setAutoFillMsg(null), 4000);
    } finally {
      setIsAutoFilling(false);
    }
  };

  const activeMeter = meters.find(m => m.id === activeTab);
  const isWaterOrGasTab = activeMeter && (activeMeter.type === 'Su' || activeMeter.type === 'Doğalgaz');

  return (
    <div className="space-y-5 max-w-[1300px] mx-auto pb-24 text-slate-100">
      
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="sticky -top-6 z-30 bg-[#060B14]/95 backdrop-blur-md pt-6 pb-4 border-b border-slate-800/80 -mx-6 px-6 shadow-lg flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Left: Module Title */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/30 shrink-0 shadow-lg shadow-amber-500/5">
            <Gauge className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Sayaç Okuma & Tüketim Takip</h1>
            <p className="text-slate-400 text-xs mt-0.5">TerraceFeri Konutları aylık endeks dökümü ve tüketim takip çizelgesi</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Pazar Günlerini Otomatik Doldur */}
          <button 
            onClick={handleAutoFillSundays}
            disabled={isAutoFilling}
            className="px-4 py-2.5 bg-purple-950/30 border border-purple-500/50 hover:bg-purple-900/40 text-purple-300 hover:text-purple-200 text-xs font-semibold rounded-lg transition-colors flex items-center shadow-sm cursor-pointer disabled:opacity-50"
            title="Önceki günlerin günlük tüketim ortalamasına göre Pazar günlerini otomatik hesaplayıp girer"
          >
            {isAutoFilling ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin text-purple-400" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
            )}
            Pazar Günlerini Otomatik Doldur
          </button>

          {/* Yazdır / PDF */}
          <button 
            onClick={openReportModal}
            className="px-4 py-2.5 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 mr-2" /> Yazdır / PDF
          </button>

          {/* Günlük Değer Gir */}
          <button 
            onClick={() => openDayEntryModal(todayStr)}
            className="px-5 py-2.5 bg-amber-950/30 border border-amber-500/60 hover:bg-amber-900/40 text-amber-400 text-xs font-bold rounded-lg transition-colors shadow-lg shadow-amber-500/10 flex items-center cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" /> Günlük Değer Gir
          </button>
        </div>
      </div>

      {/* Auto-Fill Banner / Notification */}
      {autoFillMsg && (
        <div className="p-3.5 bg-purple-950/40 border border-purple-500/50 rounded-xl text-xs font-medium text-purple-200 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{autoFillMsg}</span>
          </div>
          <button onClick={() => setAutoFillMsg(null)} className="text-purple-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. EXCEL VIEW (DEFAULT PRIMARY SCREEN) */}
      {viewMode === 'excel' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Month & Year Bar */}
          <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            
            {/* Month Navigator */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrevMonth}
                className="p-2 bg-[#060a14] border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 rounded-lg transition-colors"
                title="Önceki Ay"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-1.5 bg-[#060a14] border border-slate-700 text-white rounded-lg text-xs font-bold focus:outline-none focus:border-amber-500"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={idx + 1} value={idx + 1}>{name}</option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 bg-[#060a14] border border-slate-700 text-white rounded-lg text-xs font-bold focus:outline-none focus:border-amber-500"
                >
                  {[2024, 2025, 2026, 2027, 2028].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleNextMonth}
                className="p-2 bg-[#060a14] border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 rounded-lg transition-colors"
                title="Sonraki Ay"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Document Header Text preview */}
            <div className="text-center">
              <div className="text-xs font-black tracking-widest text-slate-400 uppercase">TERRACE FERİ KONUTLARI</div>
              <div className="text-sm font-extrabold text-amber-400 tracking-wide">
                AYLIK SAYAÇLAR OKUMA LİSTESİ {MONTH_NAMES[selectedMonth - 1].toUpperCase()} {selectedYear}
              </div>
            </div>

            {/* Quick Actions & Penalty Status */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {monthlySummary.hasData && (
                <div className="flex items-center gap-2 bg-[#060a14] border border-slate-700/80 px-3 py-1.5 rounded-xl">
                  {/* Enduktif Reaktif Durumu */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold">Endüktif (≤%20):</span>
                    <span className={`font-mono font-bold text-xs px-1.5 py-0.2 rounded border ${
                      monthlySummary.isReaktifCeza 
                        ? 'text-red-400 bg-red-950/40 border-red-500/50 animate-pulse' 
                        : 'text-emerald-400 bg-emerald-950/30 border-emerald-500/30'
                    }`}>
                      %{monthlySummary.reaktifRatio.toFixed(1)} {monthlySummary.isReaktifCeza ? 'CEZA' : 'Normal'}
                    </span>
                  </div>

                  <span className="text-slate-700">|</span>

                  {/* Kapasitif Durumu */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold">Kapasitif (≤%15):</span>
                    <span className={`font-mono font-bold text-xs px-1.5 py-0.2 rounded border ${
                      monthlySummary.isKapCeza 
                        ? 'text-red-400 bg-red-950/40 border-red-500/50 animate-pulse' 
                        : 'text-emerald-400 bg-emerald-950/30 border-emerald-500/30'
                    }`}>
                      %{monthlySummary.kapRatio.toFixed(1)} {monthlySummary.isKapCeza ? 'CEZA' : 'Normal'}
                    </span>
                  </div>
                </div>
              )}

              <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-400 ml-auto">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px]">Hücreye tıklayarak hızlı endeks girebilirsiniz</span>
              </div>
            </div>
          </div>

          {/* 3. EXCEL TABLE - EXACT REPLICA OF THE PHYSICAL SHEET */}
          <div className="bg-[#090e1a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-xs select-none">
                
                {/* Double-level Header with Daily Consumption Columns */}
                <thead>
                  {/* Top Level Header */}
                  <tr className="bg-[#0d1424] text-slate-200 border-b border-slate-700 text-[11px] font-bold">
                    <th rowSpan={2} className="py-3 px-3 border-r border-slate-700 w-32 uppercase tracking-wider text-blue-300">
                      OKUMA TARİHİ
                    </th>
                    <th colSpan={4} className="py-2 px-2.5 border-r border-slate-700 uppercase tracking-wider text-amber-400 bg-amber-500/10">
                      ELEKTRİK T1
                    </th>
                    <th colSpan={2} className="py-2 px-2.5 border-r border-slate-700 uppercase tracking-wider text-rose-400 bg-rose-500/10">
                      DOĞALGAZ
                    </th>
                    <th colSpan={2} className="py-2 px-2.5 border-r border-slate-700 uppercase tracking-wider text-cyan-300 bg-cyan-500/10">
                      SU DAİRELER
                    </th>
                    <th colSpan={2} className="py-2 px-2.5 border-r border-slate-700 uppercase tracking-wider text-teal-300 bg-teal-500/10">
                      SU DÜKKANLAR
                    </th>
                    <th rowSpan={2} className="py-3 px-2 uppercase tracking-wider text-slate-400 w-16">
                      İŞLEM
                    </th>
                  </tr>

                  {/* Sub Header */}
                  <tr className="bg-[#080d18] text-slate-300 border-b border-slate-700 text-[10px] font-bold">
                    {/* Elektrik Subheaders */}
                    <th className="py-2 px-2 border-r border-slate-700 text-amber-300/80 font-mono">
                      .5.8.0 <span className="text-[7.5px] text-slate-400 font-sans block">Reaktif (≤%20)</span>
                    </th>
                    <th className="py-2 px-2 border-r border-slate-700 text-amber-300/80 font-mono">
                      .8.8.0 <span className="text-[7.5px] text-slate-400 font-sans block">Kapasitif (≤%15)</span>
                    </th>
                    <th className="py-2 px-2 border-r border-slate-700 text-amber-300 font-mono">
                      .1.8.0 <span className="text-[7.5px] text-slate-500 font-sans block">Aktif</span>
                    </th>
                    <th className="py-1.5 px-1 border-r border-slate-700 text-amber-400 font-bold bg-amber-500/10 w-14">
                      Tüketim <span className="text-[7px] text-amber-500/70 block">kWh</span>
                    </th>

                    {/* Doğalgaz Subheaders */}
                    <th className="py-2 px-2.5 border-r border-slate-700 text-rose-300 font-mono">
                      Endeks
                    </th>
                    <th className="py-1.5 px-1 border-r border-slate-700 text-rose-400 font-bold bg-rose-500/10 w-14">
                      Tüketim <span className="text-[7px] text-rose-500/70 block">m³</span>
                    </th>

                    {/* Su Daireler Subheaders */}
                    <th className="py-2 px-2.5 border-r border-slate-700 text-cyan-300 font-mono">
                      Endeks
                    </th>
                    <th className="py-1.5 px-1 border-r border-slate-700 text-cyan-400 font-bold bg-cyan-500/10 w-14">
                      Tüketim <span className="text-[7px] text-cyan-500/70 block">m³</span>
                    </th>

                    {/* Su Dükkanlar Subheaders */}
                    <th className="py-2 px-2.5 border-r border-slate-700 text-teal-300 font-mono">
                      Endeks
                    </th>
                    <th className="py-1.5 px-1 border-r border-slate-700 text-teal-400 font-bold bg-teal-500/10 w-14">
                      Tüketim <span className="text-[7px] text-teal-500/70 block">m³</span>
                    </th>
                  </tr>
                </thead>

                {/* Body Rows for 1 to 31 */}
                <tbody className="divide-y divide-slate-800/80 font-mono text-[12px]">
                  {monthDates.map((dateStr) => {
                    const [y, m, d] = dateStr.split('-').map(Number);
                    const formattedDate = `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`;
                    const isSunday = new Date(y, m - 1, d).getDay() === 0;
                    const isToday = dateStr === todayStr;
                    const { elek, gas, suDaire, suDuk } = getReadingsForDate(dateStr);
                    const diffs = getDailyDiffs(dateStr);
                    const hasAny = elek || gas || suDaire || suDuk;

                    return (
                      <tr 
                        key={dateStr}
                        className={`transition-colors group ${
                          isToday 
                            ? 'bg-blue-950/40 hover:bg-blue-900/40' 
                            : isSunday
                              ? 'bg-amber-950/25 hover:bg-amber-900/35 border-y border-amber-900/30'
                              : hasAny 
                                ? 'hover:bg-slate-800/40 bg-[#090e1a]' 
                                : 'hover:bg-slate-800/20 bg-[#060a12]/60 opacity-60 hover:opacity-100'
                        }`}
                      >
                        {/* 1. Okuma Tarihi */}
                        <td className="py-2.5 px-3 border-r border-slate-800 text-slate-300 font-bold text-left whitespace-nowrap">
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center space-x-1">
                              <span className={isToday ? 'text-blue-400 font-black' : isSunday ? 'text-amber-300 font-bold' : ''}>
                                {formattedDate}
                              </span>
                              {isSunday && (
                                <span className="px-1 py-0.2 bg-amber-500/15 text-amber-400/90 text-[8px] font-semibold rounded border border-amber-500/30">
                                  Paz
                                </span>
                              )}
                            </div>
                            {isToday && (
                              <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-400 text-[8px] font-bold rounded border border-blue-500/30">
                                BUGÜN
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 2. Elektrik .5.8.0 (Reaktif) */}
                        <td 
                          className={`py-2.5 px-2 border-r border-slate-800 text-right cursor-pointer transition-colors ${
                            diffs.isReaktifCeza ? 'bg-red-950/50 hover:bg-red-900/60' : 'hover:bg-amber-500/10'
                          }`}
                          onClick={() => {
                            setEditingCell({ date: dateStr, field: 'reaktif580' });
                            setCellTempVal(elek ? String(elek.reaktif) : '');
                          }}
                        >
                          {editingCell?.date === dateStr && editingCell?.field === 'reaktif580' ? (
                            <input
                              type="number"
                              autoFocus
                              value={cellTempVal}
                              onChange={(e) => setCellTempVal(e.target.value)}
                              onBlur={() => handleSaveCell(dateStr, 'reaktif580', cellTempVal)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveCell(dateStr, 'reaktif580', cellTempVal)}
                              className="w-full px-1 py-0.5 bg-[#050811] border border-amber-400 text-white rounded text-xs text-right font-mono outline-none"
                            />
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              {diffs.isReaktifCeza && (
                                <span 
                                  className="text-[8px] px-1 py-0.2 bg-red-500/20 text-red-400 font-bold rounded border border-red-500/40 animate-pulse whitespace-nowrap"
                                  title={`Endüktif Reaktif Ceza Sınırı Aşıldı! Günlük Oran: %${diffs.reaktifRatio?.toFixed(1)} (Yasal Sınır: %20)`}
                                >
                                  %{diffs.reaktifRatio?.toFixed(0)} Ceza
                                </span>
                              )}
                              <span className={
                                diffs.isReaktifCeza 
                                  ? 'text-red-400 font-extrabold font-mono text-[13px]' 
                                  : elek?.reaktif 
                                    ? 'text-amber-200/80 font-medium' 
                                    : 'text-slate-700'
                              }>
                                {elek?.reaktif !== undefined ? elek.reaktif : '-'}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* 3. Elektrik .8.8.0 (Kapasitif) */}
                        <td 
                          className={`py-2.5 px-2 border-r border-slate-800 text-right cursor-pointer transition-colors ${
                            diffs.isKapCeza ? 'bg-red-950/50 hover:bg-red-900/60' : 'hover:bg-amber-500/10'
                          }`}
                          onClick={() => {
                            setEditingCell({ date: dateStr, field: 'kap880' });
                            setCellTempVal(elek ? String(elek.kapasitif) : '');
                          }}
                        >
                          {editingCell?.date === dateStr && editingCell?.field === 'kap880' ? (
                            <input
                              type="number"
                              autoFocus
                              value={cellTempVal}
                              onChange={(e) => setCellTempVal(e.target.value)}
                              onBlur={() => handleSaveCell(dateStr, 'kap880', cellTempVal)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveCell(dateStr, 'kap880', cellTempVal)}
                              className="w-full px-1 py-0.5 bg-[#050811] border border-amber-400 text-white rounded text-xs text-right font-mono outline-none"
                            />
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              {diffs.isKapCeza && (
                                <span 
                                  className="text-[8px] px-1 py-0.2 bg-red-500/20 text-red-400 font-bold rounded border border-red-500/40 animate-pulse whitespace-nowrap"
                                  title={`Kapasitif Reaktif Ceza Sınırı Aşıldı! Günlük Oran: %${diffs.kapRatio?.toFixed(1)} (Yasal Sınır: %15)`}
                                >
                                  %{diffs.kapRatio?.toFixed(0)} Ceza
                                </span>
                              )}
                              <span className={
                                diffs.isKapCeza 
                                  ? 'text-red-400 font-extrabold font-mono text-[13px]' 
                                  : elek?.kapasitif 
                                    ? 'text-amber-200/80 font-medium' 
                                    : 'text-slate-700'
                              }>
                                {elek?.kapasitif !== undefined ? elek.kapasitif : '-'}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* 4. Elektrik .1.8.0 (Aktif Endeks) */}
                        <td 
                          className="py-2.5 px-2.5 border-r border-slate-800 text-right cursor-pointer hover:bg-amber-500/10 transition-colors"
                          onClick={() => {
                            setEditingCell({ date: dateStr, field: 'aktif180' });
                            setCellTempVal(elek ? String(elek.aktif) : '');
                          }}
                        >
                          {editingCell?.date === dateStr && editingCell?.field === 'aktif180' ? (
                            <input
                              type="number"
                              autoFocus
                              value={cellTempVal}
                              onChange={(e) => setCellTempVal(e.target.value)}
                              onBlur={() => handleSaveCell(dateStr, 'aktif180', cellTempVal)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveCell(dateStr, 'aktif180', cellTempVal)}
                              className="w-full px-1 py-0.5 bg-[#050811] border border-amber-400 text-white rounded text-xs text-right font-mono outline-none"
                            />
                          ) : (
                            <span className={elek?.aktif ? 'text-amber-300 font-bold' : 'text-slate-700'}>
                              {elek?.aktif !== undefined ? elek.aktif : '-'}
                            </span>
                          )}
                        </td>

                        {/* 5. Aktif Günlük Tüketim (Daraltılmış) */}
                        <td className="py-2.5 px-1 border-r border-slate-800 text-right bg-amber-500/5 font-mono w-14">
                          {diffs.aktifDiff !== null ? (
                            <span className="text-amber-400 font-extrabold text-[11px]">+{diffs.aktifDiff}</span>
                          ) : (
                            <span className="text-slate-700">-</span>
                          )}
                        </td>

                        {/* 6. Doğalgaz Endeks */}
                        <td 
                          className="py-2.5 px-3 border-r border-slate-800 text-right cursor-pointer hover:bg-rose-500/10 transition-colors"
                          onClick={() => {
                            setEditingCell({ date: dateStr, field: 'gas' });
                            setCellTempVal(gas ? String(gas.value) : '');
                          }}
                        >
                          {editingCell?.date === dateStr && editingCell?.field === 'gas' ? (
                            <input
                              type="number"
                              autoFocus
                              value={cellTempVal}
                              onChange={(e) => setCellTempVal(e.target.value)}
                              onBlur={() => handleSaveCell(dateStr, 'gas', cellTempVal)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveCell(dateStr, 'gas', cellTempVal)}
                              className="w-full px-1 py-0.5 bg-[#050811] border border-rose-400 text-white rounded text-xs text-right font-mono outline-none"
                            />
                          ) : (
                            <span className={gas?.value ? 'text-rose-300 font-bold' : 'text-slate-700'}>
                              {gas?.value !== undefined ? gas.value : '-'}
                            </span>
                          )}
                        </td>

                        {/* 7. Doğalgaz Günlük Tüketim (Daraltılmış) */}
                        <td className={`py-2.5 px-1 border-r border-slate-800 text-right font-mono w-14 transition-colors ${
                          diffs.isGasHigh ? 'bg-red-950/50' : 'bg-rose-500/5'
                        }`}>
                          {diffs.gasDiff !== null ? (
                            <div className="flex flex-col items-end">
                              <span className={diffs.isGasHigh ? 'text-red-400 font-black text-[12px] animate-pulse' : 'text-rose-400 font-extrabold text-[11px]'}>
                                +{diffs.gasDiff}
                              </span>
                              {diffs.isGasHigh && (
                                <span 
                                  className="text-[7px] px-1 bg-red-500/20 text-red-400 font-bold rounded border border-red-500/40 whitespace-nowrap"
                                  title="Günlük Doğalgaz Tüketimi Çok Yüksek! (≥500 m³)"
                                >
                                  YÜKSEK
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-700">-</span>
                          )}
                        </td>

                        {/* 8. Su Daireler Endeks */}
                        <td 
                          className="py-2.5 px-3 border-r border-slate-800 text-right cursor-pointer hover:bg-cyan-500/10 transition-colors"
                          onClick={() => {
                            setEditingCell({ date: dateStr, field: 'suDaire' });
                            setCellTempVal(suDaire ? String(suDaire.value) : '');
                          }}
                        >
                          {editingCell?.date === dateStr && editingCell?.field === 'suDaire' ? (
                            <input
                              type="number"
                              autoFocus
                              value={cellTempVal}
                              onChange={(e) => setCellTempVal(e.target.value)}
                              onBlur={() => handleSaveCell(dateStr, 'suDaire', cellTempVal)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveCell(dateStr, 'suDaire', cellTempVal)}
                              className="w-full px-1 py-0.5 bg-[#050811] border border-cyan-400 text-white rounded text-xs text-right font-mono outline-none"
                            />
                          ) : (
                            <span className={suDaire?.value ? 'text-cyan-300 font-bold' : 'text-slate-700'}>
                              {suDaire?.value !== undefined ? suDaire.value : '-'}
                            </span>
                          )}
                        </td>

                        {/* 9. Su Daireler Günlük Tüketim (Daraltılmış) */}
                        <td className={`py-2.5 px-1 border-r border-slate-800 text-right font-mono w-14 transition-colors ${
                          diffs.isSuDaireHigh ? 'bg-red-950/50' : 'bg-cyan-500/5'
                        }`}>
                          {diffs.suDaireDiff !== null ? (
                            <div className="flex flex-col items-end">
                              <span className={diffs.isSuDaireHigh ? 'text-red-400 font-black text-[12px] animate-pulse' : 'text-cyan-400 font-extrabold text-[11px]'}>
                                +{diffs.suDaireDiff}
                              </span>
                              {diffs.isSuDaireHigh && (
                                <span 
                                  className="text-[7px] px-1 bg-red-500/20 text-red-400 font-bold rounded border border-red-500/40 whitespace-nowrap"
                                  title="Günlük Su (Daireler) Tüketimi Çok Yüksek! (≥50 m³ - Olası Kaçak)"
                                >
                                  YÜKSEK
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-700">-</span>
                          )}
                        </td>

                        {/* 10. Su Dükkanlar Endeks */}
                        <td 
                          className="py-2.5 px-3 border-r border-slate-800 text-right cursor-pointer hover:bg-teal-500/10 transition-colors"
                          onClick={() => {
                            setEditingCell({ date: dateStr, field: 'suDuk' });
                            setCellTempVal(suDuk ? String(suDuk.value) : '');
                          }}
                        >
                          {editingCell?.date === dateStr && editingCell?.field === 'suDuk' ? (
                            <input
                              type="number"
                              autoFocus
                              value={cellTempVal}
                              onChange={(e) => setCellTempVal(e.target.value)}
                              onBlur={() => handleSaveCell(dateStr, 'suDuk', cellTempVal)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveCell(dateStr, 'suDuk', cellTempVal)}
                              className="w-full px-1 py-0.5 bg-[#050811] border border-teal-400 text-white rounded text-xs text-right font-mono outline-none"
                            />
                          ) : (
                            <span className={suDuk?.value ? 'text-teal-300 font-bold' : 'text-slate-700'}>
                              {suDuk?.value !== undefined ? suDuk.value : '-'}
                            </span>
                          )}
                        </td>

                        {/* 11. Su Dükkanlar Günlük Tüketim (Daraltılmış) */}
                        <td className={`py-2.5 px-1 border-r border-slate-800 text-right font-mono w-14 transition-colors ${
                          diffs.isSuDukHigh ? 'bg-red-950/50' : 'bg-teal-500/5'
                        }`}>
                          {diffs.suDukDiff !== null ? (
                            <div className="flex flex-col items-end">
                              <span className={diffs.isSuDukHigh ? 'text-red-400 font-black text-[12px] animate-pulse' : 'text-teal-400 font-extrabold text-[11px]'}>
                                +{diffs.suDukDiff}
                              </span>
                              {diffs.isSuDukHigh && (
                                <span 
                                  className="text-[7px] px-1 bg-red-500/20 text-red-400 font-bold rounded border border-red-500/40 whitespace-nowrap"
                                  title="Günlük Su (Dükkanlar) Tüketimi Yüksek! (≥20 m³)"
                                >
                                  YÜKSEK
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-700">-</span>
                          )}
                        </td>

                        {/* Action: Quick Day Entry */}
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={() => openDayEntryModal(dateStr)}
                            className="p-1.5 bg-transparent border border-slate-700 hover:border-amber-500/50 hover:bg-amber-950/20 text-slate-400 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
                            title="Tüm sayaçları bu gün için düzenle / gir"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

                {/* Footer: 2 Stacked Financial & Consumption Summary Rows */}
                <tfoot>
                  {/* 1. TOPLAM TÜKETİM */}
                  <tr className="bg-[#0e1628] border-t-2 border-slate-700 font-bold text-xs text-white">
                    <td className="py-3 px-3 border-r border-slate-700 text-left font-black text-amber-400 font-sans">
                      <div className="flex flex-col">
                        <span className="text-[11px] uppercase tracking-wider">1. TOPLAM TÜKETİM</span>
                        <span className="text-[8.5px] text-slate-400 font-normal">({monthlySummary.dayCount} Günlük Veri)</span>
                      </div>
                    </td>
                    <td className={`py-3 px-2 border-r border-slate-700 text-right ${
                      monthlySummary.isReaktifCeza ? 'text-red-400 font-extrabold bg-red-950/40' : 'text-amber-300'
                    }`}>
                      {monthlySummary.hasData ? (
                        <div className="flex flex-col items-end">
                          <span>+{monthlySummary.elekReaktifDiff}</span>
                          <span className={`text-[8px] font-bold px-1 rounded border ${
                            monthlySummary.isReaktifCeza 
                              ? 'text-red-400 bg-red-900/30 border-red-500/40' 
                              : 'text-slate-400 bg-slate-800/40 border-slate-700'
                          }`}>
                            %{monthlySummary.reaktifRatio.toFixed(1)} {monthlySummary.isReaktifCeza ? 'CEZA' : 'Normal'}
                          </span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className={`py-3 px-2 border-r border-slate-700 text-right ${
                      monthlySummary.isKapCeza ? 'text-red-400 font-extrabold bg-red-950/40' : 'text-amber-300'
                    }`}>
                      {monthlySummary.hasData ? (
                        <div className="flex flex-col items-end">
                          <span>+{monthlySummary.elekKapDiff}</span>
                          <span className={`text-[8px] font-bold px-1 rounded border ${
                            monthlySummary.isKapCeza 
                              ? 'text-red-400 bg-red-900/30 border-red-500/40' 
                              : 'text-slate-400 bg-slate-800/40 border-slate-700'
                          }`}>
                            %{monthlySummary.kapRatio.toFixed(1)} {monthlySummary.isKapCeza ? 'CEZA' : 'Normal'}
                          </span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-2 border-r border-slate-700 text-right text-slate-500 font-normal text-[10px]">-</td>
                    <td className="py-3 px-1 border-r border-slate-700 text-right text-amber-400 font-extrabold bg-amber-500/10 w-14">
                      {monthlySummary.hasData ? `+${monthlySummary.elekAktifDiff}` : '-'}
                    </td>
                    <td className="py-3 px-2 border-r border-slate-700 text-right text-slate-500 font-normal text-[10px]">-</td>
                    <td className="py-3 px-1 border-r border-slate-700 text-right text-rose-400 font-extrabold bg-rose-500/10 w-14">
                      {monthlySummary.hasData ? `+${monthlySummary.gasDiff}` : '-'}
                    </td>
                    <td className="py-3 px-2 border-r border-slate-700 text-right text-slate-500 font-normal text-[10px]">-</td>
                    <td className="py-3 px-1 border-r border-slate-700 text-right text-cyan-400 font-extrabold bg-cyan-500/10 w-14">
                      {monthlySummary.hasData ? `+${monthlySummary.suDaireDiff}` : '-'}
                    </td>
                    <td className="py-3 px-2 border-r border-slate-700 text-right text-slate-500 font-normal text-[10px]">-</td>
                    <td className="py-3 px-1 border-r border-slate-700 text-right text-teal-400 font-extrabold bg-teal-500/10 w-14">
                      {monthlySummary.hasData ? `+${monthlySummary.suDukDiff}` : '-'}
                    </td>
                    <td className="py-3 px-2 text-center text-amber-400 font-mono font-bold text-[11px]">
                      {monthlySummary.hasData ? `${monthlySummary.totalCurrentCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺` : '-'}
                    </td>
                  </tr>

                  {/* 2. AY SONU TAHMİNİ GELECEK FATURA (TL) */}
                  <tr className="bg-[#080d19] border-t border-slate-700/80 font-bold text-xs text-white">
                    <td className="py-2.5 px-3 border-r border-slate-700 text-left font-black text-emerald-400 font-sans">
                      <div className="flex flex-col">
                        <span className="text-[11px] uppercase tracking-wider">2. AY SONU TAHMİNİ FATURA</span>
                        <span className="text-[8.5px] text-emerald-500/80 font-normal">({monthlySummary.totalDaysInMonth} Günlük Tahmin)</span>
                      </div>
                    </td>
                    <td colSpan={3} className="py-2.5 px-2 border-r border-slate-700 text-center text-slate-500 text-[10px] font-normal">
                      Birim: 3,85 ₺/kWh
                    </td>
                    <td className="py-2.5 px-1 border-r border-slate-700 text-right text-amber-300 font-mono font-black bg-amber-500/10">
                      {monthlySummary.hasData ? `${monthlySummary.elekProjectedCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺` : '-'}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-700 text-right text-slate-500 font-normal text-[10px]">-</td>
                    <td className="py-2.5 px-1 border-r border-slate-700 text-right text-rose-300 font-mono font-black bg-rose-500/10">
                      {monthlySummary.hasData ? `${monthlySummary.gasProjectedCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺` : '-'}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-700 text-right text-slate-500 font-normal text-[10px]">-</td>
                    <td className="py-2.5 px-1 border-r border-slate-700 text-right text-cyan-300 font-mono font-black bg-cyan-500/10">
                      {monthlySummary.hasData ? `${monthlySummary.suDaireProjectedCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺` : '-'}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-700 text-right text-slate-500 font-normal text-[10px]">-</td>
                    <td className="py-2.5 px-1 border-r border-slate-700 text-right text-teal-300 font-mono font-black bg-teal-500/10">
                      {monthlySummary.hasData ? `${monthlySummary.suDukProjectedCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺` : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-center text-emerald-400 font-mono font-black text-[12px] bg-emerald-950/40 border-l border-emerald-500/30">
                      {monthlySummary.hasData ? `${monthlySummary.totalProjectedCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺` : '-'}
                    </td>
                  </tr>
                </tfoot>

              </table>
            </div>
          </div>

          {/* 4. FINANCIAL SUMMARY CARDS - OFFICIAL INVOICE BASED PROJECTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            
            {/* 1. Doğalgaz Projeksiyon Kartı */}
            <div className="bg-[#0f121b] border border-rose-500/30 rounded-2xl p-4 shadow-xl hover:border-rose-500/50 transition-all group">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">Doğalgaz (İGDAŞ)</h4>
                    <span className="text-[10px] text-slate-400">Resmi Fatura: 21,16 ₺/m³</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[10px] font-bold rounded-lg border border-rose-500/30">
                  Mesken
                </span>
              </div>

              <div className="mt-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between bg-[#080b12] p-2 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400">1. Toplam Tüketim:</span>
                  <span className="font-mono font-extrabold text-rose-300">
                    +{monthlySummary.gasDiff} m³ <span className="text-slate-500 font-normal">({monthlySummary.gasCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between bg-rose-950/20 p-2.5 rounded-xl border border-rose-500/30">
                  <span className="text-white font-bold">2. Ay Sonu Tahmini:</span>
                  <span className="font-mono font-black text-rose-400 text-sm">
                    {monthlySummary.gasProjectedCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Su (Daireler) Projeksiyon Kartı */}
            <div className="bg-[#0f121b] border border-cyan-500/30 rounded-2xl p-4 shadow-xl hover:border-cyan-500/50 transition-all group">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Su - Daireler (İSKİ)</h4>
                    <span className="text-[10px] text-slate-400">Resmi Fatura: 101,43 ₺/m³</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded-lg border border-cyan-500/30">
                  85 Daire
                </span>
              </div>

              <div className="mt-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between bg-[#080b12] p-2 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400">1. Toplam Tüketim:</span>
                  <span className="font-mono font-extrabold text-cyan-300">
                    +{monthlySummary.suDaireDiff} m³ <span className="text-slate-500 font-normal">({monthlySummary.suDaireCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between bg-cyan-950/20 p-2.5 rounded-xl border border-cyan-500/30">
                  <span className="text-white font-bold">2. Ay Sonu Tahmini:</span>
                  <span className="font-mono font-black text-cyan-400 text-sm">
                    {monthlySummary.suDaireProjectedCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Su (Dükkanlar) Projeksiyon Kartı */}
            <div className="bg-[#0f121b] border border-teal-500/30 rounded-2xl p-4 shadow-xl hover:border-teal-500/50 transition-all group">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">Su - Dükkanlar (İSKİ)</h4>
                    <span className="text-[10px] text-slate-400">Resmi Fatura: 229,00 ₺/m³</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 text-[10px] font-bold rounded-lg border border-teal-500/30">
                  İşyeri
                </span>
              </div>

              <div className="mt-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between bg-[#080b12] p-2 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400">1. Toplam Tüketim:</span>
                  <span className="font-mono font-extrabold text-teal-300">
                    +{monthlySummary.suDukDiff} m³ <span className="text-slate-500 font-normal">({monthlySummary.suDukCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between bg-teal-950/20 p-2.5 rounded-xl border border-teal-500/30">
                  <span className="text-white font-bold">2. Ay Sonu Tahmini:</span>
                  <span className="font-mono font-black text-teal-400 text-sm">
                    {monthlySummary.suDukProjectedCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Elektrik & Genel Toplam Projeksiyon Kartı */}
            <div className="bg-[#0f121b] border border-amber-500/30 rounded-2xl p-4 shadow-xl hover:border-amber-500/50 transition-all group">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Elektrik (T1 Aktif)</h4>
                    <span className="text-[10px] text-slate-400">Birim Fiyat: 3,85 ₺/kWh</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-lg border border-amber-500/30">
                  Ortak Alan
                </span>
              </div>

              <div className="mt-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between bg-[#080b12] p-2 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400">1. Toplam Tüketim:</span>
                  <span className="font-mono font-extrabold text-amber-300">
                    +{monthlySummary.elekAktifDiff} kWh <span className="text-slate-500 font-normal">({monthlySummary.elekCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/30">
                  <span className="text-white font-bold">2. Ay Sonu Tahmini:</span>
                  <span className="font-mono font-black text-amber-400 text-sm">
                    {monthlySummary.elekProjectedCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 3. SINGLE METER LIST / DETAILED VIEW */}
      {viewMode === 'single' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Tab Selector */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
              {meters.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors border flex items-center space-x-2 shrink-0 ${
                    activeTab === tab.id 
                      ? tab.type === 'Elektrik' ? 'bg-amber-900/20 border-amber-500/50 text-amber-400 shadow-md'
                        : tab.type === 'Su' ? 'bg-cyan-900/20 border-cyan-500/50 text-cyan-400 shadow-md'
                        : tab.type === 'Doğalgaz' ? 'bg-rose-900/20 border-rose-500/50 text-rose-400 shadow-md'
                        : 'bg-blue-900/30 border-blue-500/50 text-blue-400 shadow-md'
                      : 'bg-[#0f121b] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {tab.type === 'Elektrik' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                  {tab.type === 'Su' && <Droplets className="w-3.5 h-3.5 text-cyan-400" />}
                  {tab.type === 'Doğalgaz' && <Flame className="w-3.5 h-3.5 text-rose-400" />}
                  <span>{`${tab.name} (${tab.meterNo})`}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {activeTab && (
                <button 
                  onClick={handleDeleteMeter}
                  className="px-3 py-1.5 bg-red-950/20 border border-red-500/50 hover:bg-red-900/30 text-red-400 text-xs font-bold rounded-lg transition-colors flex items-center"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Sayacı Sil
                </button>
              )}
              <button 
                onClick={() => setIsAddMeterModalOpen(true)}
                className="px-3 py-1.5 bg-blue-950/20 border border-blue-500/50 hover:bg-blue-900/30 text-blue-400 text-xs font-bold rounded-lg transition-colors flex items-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Yeni Sayaç Ekle
              </button>
            </div>
          </div>

          {/* List Table */}
          {filteredReadings.length === 0 ? (
            <div className="text-center py-12 bg-[#0f121b] border border-slate-800/80 rounded-2xl text-slate-500">
              Kayıtlı günlük okuma verisi bulunamadı.
            </div>
          ) : (
            <div className="bg-[#0f121b] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#080b12] text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                      <th className="py-3.5 px-4 font-bold text-blue-400">Tarih</th>
                      <th className="py-3.5 px-3 font-bold">Saat</th>
                      {isWaterOrGasTab ? (
                        <th className="py-3.5 px-3 font-bold text-cyan-400">Değer ({activeMeter?.unit})</th>
                      ) : (
                        <>
                          <th className="py-3.5 px-3 font-bold text-amber-400/90">Aktif (kWh)</th>
                          <th className="py-3.5 px-3 font-bold text-indigo-400/90">Reaktif (kVARh)</th>
                          <th className="py-3.5 px-3 font-bold text-purple-400/90">Kapasitif (kVARh)</th>
                        </>
                      )}
                      <th className="py-3.5 px-3 font-bold text-blue-400">Fark (Günlük Tüketim)</th>
                      <th className="py-3.5 px-4 font-bold text-right">Aksiyonlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {filteredReadings.map(row => {
                      const isElek = row.type === 'Elektrik';
                      const fark = isElek 
                        ? Math.max(0, row.aktif - row.prevAktif)
                        : Math.max(0, row.value - row.prevValue);

                      return (
                        <tr key={row.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="py-3 px-4 font-bold text-white">
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="font-extrabold">{row.readDate}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-400">{row.readTime}</td>
                          {isWaterOrGasTab ? (
                            <td className="py-3 px-3 font-bold text-cyan-300">
                              {row.value} {row.unit}
                            </td>
                          ) : (
                            <>
                              <td className="py-3 px-3 font-bold text-amber-300">
                                {row.aktif} kWh
                              </td>
                              {(() => {
                                const diffAktif = row.aktif - row.prevAktif;
                                const diffReaktif = row.reaktif - row.prevReaktif;
                                const diffKap = row.kapasitif - row.prevKapasitif;
                                const rRatio = diffAktif > 0 ? (diffReaktif / diffAktif) * 100 : 0;
                                const kRatio = diffAktif > 0 ? (diffKap / diffAktif) * 100 : 0;
                                const isRCeza = rRatio > 20.0;
                                const isKCeza = kRatio > 15.0;

                                return (
                                  <>
                                    <td className={`py-3 px-3 ${isRCeza ? 'text-red-400 font-extrabold bg-red-950/30' : 'text-indigo-300'}`}>
                                      <div className="flex items-center gap-1.5">
                                        <span>{row.reaktif}</span>
                                        {isRCeza && (
                                          <span className="text-[8px] px-1 bg-red-500/20 text-red-400 border border-red-500/40 rounded font-bold">
                                            %{rRatio.toFixed(0)} Ceza
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className={`py-3 px-3 ${isKCeza ? 'text-red-400 font-extrabold bg-red-950/30' : 'text-purple-300'}`}>
                                      <div className="flex items-center gap-1.5">
                                        <span>{row.kapasitif}</span>
                                        {isKCeza && (
                                          <span className="text-[8px] px-1 bg-red-500/20 text-red-400 border border-red-500/40 rounded font-bold">
                                            %{kRatio.toFixed(0)} Ceza
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  </>
                                );
                              })()}
                            </>
                          )}
                          <td className="py-3 px-3 font-extrabold text-blue-400">
                            +{fark} {row.unit}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button 
                                onClick={() => openModal(row)}
                                className="p-2 bg-[#070A11] border border-blue-900/50 text-blue-500 hover:bg-blue-900/20 rounded-lg transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDelete(row.id)}
                                className="p-2 bg-[#070A11] border border-red-900/50 text-red-500 hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. FULL DAY MULTI-METER ENTRY MODAL (EXCEL QUICK ENTRY) */}
      {isDayEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsDayEntryModalOpen(false)}>
          <div className="bg-[#0f121b] border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header: OZEL_KURALLAR #2 - Sil butonu sol üst köşede */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#080b12]">
              <div className="flex items-center space-x-3">
                <h3 className="text-base font-bold text-white flex items-center tracking-wide">
                  <Calendar className="w-4 h-4 mr-2 text-amber-400" />
                  <span>Günlük Sayaç Okuma Girişi ({dayEntryDate.split('-').reverse().join('.')})</span>
                </h3>
              </div>
              <button onClick={() => setIsDayEntryModalOpen(false)} className="text-slate-500 hover:text-white p-1.5 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDayEntry} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Okuma Tarihi</label>
                <input 
                  type="date"
                  value={dayEntryDate}
                  onChange={(e) => setDayEntryDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#080b12] border border-slate-800 text-white rounded-lg text-xs font-bold"
                  required
                />
              </div>

              {/* Elektrik T1 Box */}
              <div className="p-4 border border-amber-500/30 bg-amber-500/5 rounded-xl space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center">
                  <Zap className="w-3.5 h-3.5 mr-1" /> Elektrik T1 (Ana Sayaç)
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">.5.8.0 Reaktif</label>
                    <input 
                      type="number"
                      value={dayEntryReaktif580}
                      onChange={(e) => setDayEntryReaktif580(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Örn: 4117"
                      className="w-full px-3 py-2 bg-[#080b12] border border-slate-800 text-white rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">.8.8.0 Kapasitif</label>
                    <input 
                      type="number"
                      value={dayEntryKap880}
                      onChange={(e) => setDayEntryKap880(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Örn: 238"
                      className="w-full px-3 py-2 bg-[#080b12] border border-slate-800 text-white rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">.1.8.0 Aktif (kWh)</label>
                    <input 
                      type="number"
                      value={dayEntryAktif180}
                      onChange={(e) => setDayEntryAktif180(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Örn: 26872"
                      className="w-full px-3 py-2 bg-[#080b12] border border-slate-800 text-white rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Doğalgaz & Su Box */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 border border-rose-500/30 bg-rose-500/5 rounded-xl space-y-2">
                  <label className="block text-[10px] font-bold text-rose-400 uppercase flex items-center">
                    <Flame className="w-3 h-3 mr-1" /> Doğalgaz (m³)
                  </label>
                  <input 
                    type="number"
                    value={dayEntryGas}
                    onChange={(e) => setDayEntryGas(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Örn: 258825"
                    className="w-full px-3 py-2 bg-[#080b12] border border-slate-800 text-white rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div className="p-3 border border-cyan-500/30 bg-cyan-500/5 rounded-xl space-y-2">
                  <label className="block text-[10px] font-bold text-cyan-400 uppercase flex items-center">
                    <Droplets className="w-3 h-3 mr-1" /> Su Daireler (m³)
                  </label>
                  <input 
                    type="number"
                    value={dayEntrySuDaire}
                    onChange={(e) => setDayEntrySuDaire(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Örn: 81881"
                    className="w-full px-3 py-2 bg-[#080b12] border border-slate-800 text-white rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div className="p-3 border border-teal-500/30 bg-teal-500/5 rounded-xl space-y-2">
                  <label className="block text-[10px] font-bold text-teal-400 uppercase flex items-center">
                    <Droplets className="w-3 h-3 mr-1" /> Su Dükkanlar (m³)
                  </label>
                  <input 
                    type="number"
                    value={dayEntrySuDuk}
                    onChange={(e) => setDayEntrySuDuk(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Örn: 203"
                    className="w-full px-3 py-2 bg-[#080b12] border border-slate-800 text-white rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* OZEL_KURALLAR #2: İptal solda, Kaydet en sağda yan yana */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDayEntryModalOpen(false)}
                  className="px-5 py-2 bg-transparent border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg hover:border-slate-500 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-950/30 border border-amber-500/50 hover:bg-amber-900/40 text-amber-400 text-xs font-bold rounded-lg transition-colors shadow-lg"
                >
                  Tüm Değerleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. SINGLE METER EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}>
          <div className="bg-[#0f121b] border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header: OZEL_KURALLAR #2 - Sil butonu sol üst köşede */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#080b12]">
              <div className="flex items-center space-x-3">
                <h3 className="text-base font-bold text-white flex items-center tracking-wide">
                  <Gauge className="w-5 h-5 mr-2 text-amber-400" /> {editingId ? 'Günlük Okuma Kaydını Düzenle' : 'Yeni Günlük Değer Gir'}
                </h3>
                {editingId && (
                  <button 
                    onClick={() => handleDelete(editingId)}
                    className="px-3 py-1 bg-transparent border border-rose-500/50 text-rose-400 hover:bg-rose-900/30 rounded-lg text-xs font-semibold transition-colors flex items-center"
                    title="Kaydı Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Sil
                  </button>
                )}
              </div>
              <button onClick={closeModal} className="text-slate-500 hover:text-white p-1.5 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Okuma Tarihi *</label>
                  <input 
                    type="date"
                    value={readDate}
                    onChange={(e) => setReadDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#080b12] border border-slate-800 text-white rounded-lg text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Okuma Saati</label>
                  <input 
                    type="time"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#080b12] border border-slate-800 text-white rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Sayaç Seçimi</label>
                <select
                  value={meterId}
                  onChange={(e) => {
                    const selected = meters.find(m => m.id === e.target.value);
                    if (selected) {
                      setMeterId(selected.id);
                      setMeterNo(selected.meterNo);
                      setType(selected.type);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-[#080b12] border border-slate-800 text-white rounded-lg text-xs appearance-none"
                  disabled={!!editingId}
                >
                  {meters.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.meterNo}) - {m.type}</option>
                  ))}
                </select>
              </div>

              {type === 'Elektrik' ? (
                <div className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Elektrik Endeksleri</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">.5.8.0 Reaktif</label>
                      <input 
                        type="number"
                        value={reaktif}
                        onChange={(e) => setReaktif(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#080b12] border border-slate-800 text-white rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">.8.8.0 Kapasitif</label>
                      <input 
                        type="number"
                        value={kapasitif}
                        onChange={(e) => setKapasitif(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#080b12] border border-slate-800 text-white rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">.1.8.0 Aktif (kWh) *</label>
                      <input 
                        type="number"
                        value={aktif}
                        onChange={(e) => setAktif(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#080b12] border border-slate-800 text-white rounded-lg text-xs font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-cyan-500/20 bg-cyan-500/5 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{type} Endeksi</div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Endeks Değeri (m³) *</label>
                    <input 
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#080b12] border border-slate-800 text-white rounded-lg text-xs font-bold"
                      required
                    />
                  </div>
                </div>
              )}

              {/* OZEL_KURALLAR #2 */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 bg-transparent border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg hover:border-slate-500 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-950/30 border border-amber-500/50 hover:bg-amber-900/40 text-amber-400 text-xs font-bold rounded-lg transition-colors shadow-lg"
                >
                  {editingId ? 'Kaydet' : 'Değeri Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. PRINT / PDF REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070a]/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsReportModalOpen(false)}>
          <style>{`
            @media print {
              body * { visibility: hidden; }
              #print-report, #print-report * { visibility: visible; }
              #print-report {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
                color: black !important;
                padding: 5mm !important;
              }
              .print-hide { display: none !important; }
            }
          `}</style>

          <div className="bg-white border border-slate-300 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800" onClick={(e) => e.stopPropagation()}>
            
            {/* Top Bar */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print-hide shrink-0">
              <h3 className="text-base font-bold text-slate-800 flex items-center">
                <Printer className="w-5 h-5 mr-2 text-blue-600" />
                <span>Aylık Sayaçlar Okuma Listesi ({MONTH_NAMES[selectedMonth - 1]} {selectedYear}) - Baskı Önizleme</span>
              </h3>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-md"
                >
                  <Printer className="w-4 h-4 mr-2" /> PDF Kaydet / Yazdır
                </button>
                <button onClick={() => setIsReportModalOpen(false)} className="p-2 text-slate-500 hover:text-slate-800 bg-slate-200 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
              <div id="print-report" className="w-full max-w-4xl bg-white p-6 rounded-xl border border-slate-300 shadow-sm space-y-4 font-sans text-slate-900">
                
                {/* Header Table matching paper photo */}
                <div className="border border-black text-center divide-y divide-black">
                  <div className="py-2 text-base font-black tracking-wide uppercase">
                    TERRACE FERİ KONUTLARI
                  </div>
                  <div className="py-1.5 text-xs font-bold tracking-wider uppercase bg-slate-100">
                    AYLIK SAYAÇLAR OKUMA LİSTESİ {MONTH_NAMES[selectedMonth - 1].toUpperCase()} {selectedYear}
                  </div>
                </div>

                {/* Table matching paper photo + daily consumption */}
                <div className="border border-black overflow-hidden">
                  <table className="w-full text-center border-collapse text-[9.5px] border border-black">
                    <thead>
                      <tr className="border-b border-black text-slate-900 font-bold bg-slate-100">
                        <th rowSpan={2} className="p-1 border-r border-black w-20">OKUMA TARİHİ</th>
                        <th colSpan={4} className="p-1 border-r border-black">ELEKTRİK T1</th>
                        <th colSpan={2} className="p-1 border-r border-black">DOĞALGAZ</th>
                        <th colSpan={2} className="p-1 border-r border-black">SU DAİRELER</th>
                        <th colSpan={2} className="p-1 border-black">SU DÜKKANLAR</th>
                      </tr>
                      <tr className="border-b border-black text-slate-900 font-bold text-[8.5px]">
                        <th className="p-1 border-r border-black w-14">.5.8.0</th>
                        <th className="p-1 border-r border-black w-14">.8.8.0</th>
                        <th className="p-1 border-r border-black w-14">.1.8.0</th>
                        <th className="p-1 border-r border-black w-14 bg-slate-50">Tüketim</th>
                        <th className="p-1 border-r border-black w-16">Endeks</th>
                        <th className="p-1 border-r border-black w-14 bg-slate-50">Tüketim</th>
                        <th className="p-1 border-r border-black w-16">Endeks</th>
                        <th className="p-1 border-r border-black w-14 bg-slate-50">Tüketim</th>
                        <th className="p-1 border-r border-black w-14">Endeks</th>
                        <th className="p-1 border-black w-14 bg-slate-50">Tüketim</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-mono">
                      {monthDates.map(dateStr => {
                        const [y, m, d] = dateStr.split('-').map(Number);
                        const formattedDate = `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`;
                        const isSunday = new Date(y, m - 1, d).getDay() === 0;
                        const { elek, gas, suDaire, suDuk } = getReadingsForDate(dateStr);
                        const diffs = getDailyDiffs(dateStr);

                        return (
                          <tr key={dateStr} className={`border-b border-black ${isSunday ? 'bg-slate-200/60' : ''}`}>
                            <td className="p-1 border-r border-black font-bold font-sans text-center">
                              {formattedDate} {isSunday ? '(Paz)' : ''}
                            </td>
                            <td className="p-1 border-r border-black text-right pr-1">{elek?.reaktif || ''}</td>
                            <td className="p-1 border-r border-black text-right pr-1">{elek?.kapasitif || ''}</td>
                            <td className="p-1 border-r border-black text-right pr-1 font-bold">{elek?.aktif || ''}</td>
                            <td className="p-1 border-r border-black text-right pr-1 font-bold bg-slate-50/70">{diffs.aktifDiff !== null ? `+${diffs.aktifDiff}` : ''}</td>
                            <td className="p-1 border-r border-black text-right pr-1">{gas?.value || ''}</td>
                            <td className="p-1 border-r border-black text-right pr-1 font-bold bg-slate-50/70">{diffs.gasDiff !== null ? `+${diffs.gasDiff}` : ''}</td>
                            <td className="p-1 border-r border-black text-right pr-1">{suDaire?.value || ''}</td>
                            <td className="p-1 border-r border-black text-right pr-1 font-bold bg-slate-50/70">{diffs.suDaireDiff !== null ? `+${diffs.suDaireDiff}` : ''}</td>
                            <td className="p-1 border-r border-black text-right pr-1">{suDuk?.value || ''}</td>
                            <td className="p-1 border-black text-right pr-1 font-bold bg-slate-50/70">{diffs.suDukDiff !== null ? `+${diffs.suDukDiff}` : ''}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Signatures */}
                <div className="flex justify-between items-start pt-6 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">Teknik Sorumlu</div>
                    <div className="text-[10px] text-slate-600">Serdar DOĞRUER</div>
                    <div className="mt-8 border-b border-black w-36"></div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">Site Müdürü</div>
                    <div className="text-[10px] text-slate-600">Saliha ERCAN</div>
                    <div className="mt-8 border-b border-black w-36 ml-auto"></div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* 7. ADD METER MODAL */}
      {isAddMeterModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f121b] border border-slate-800/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-900/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                  <Plus className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">Yeni Sayaç Ekle</h3>
                </div>
              </div>
              <button 
                onClick={() => setIsAddMeterModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await ApiClient.post<{ success: boolean; data: Meter }>('/api/meters/registry', {
                      meterNo: newMeterNo,
                      name: newMeterName || newMeterNo,
                      type: newMeterType
                    });
                    if (res?.success) {
                      setMeters([...meters, res.data]);
                      setIsAddMeterModalOpen(false);
                      setNewMeterNo('');
                      setNewMeterName('');
                    }
                  } catch (error) {
                    console.error('Failed to add meter', error);
                  }
                }} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Sayaç Adı *</label>
                  <input 
                    type="text"
                    value={newMeterName}
                    onChange={(e) => setNewMeterName(e.target.value)}
                    placeholder="Örn: Su Dükkanlar"
                    className="w-full px-4 py-2.5 bg-[#080b12] border border-slate-800 text-white rounded-lg text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Sayaç Kodu *</label>
                  <input 
                    type="text"
                    value={newMeterNo}
                    onChange={(e) => setNewMeterNo(e.target.value)}
                    placeholder="Örn: SU-DUK-01"
                    className="w-full px-4 py-2.5 bg-[#080b12] border border-slate-800 text-white rounded-lg text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Sayaç Türü *</label>
                  <select
                    value={newMeterType}
                    onChange={(e) => setNewMeterType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#080b12] border border-slate-800 text-white rounded-lg text-xs appearance-none"
                    required
                  >
                    <option value="Elektrik">Elektrik</option>
                    <option value="Su">Su</option>
                    <option value="Doğalgaz">Doğalgaz</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddMeterModalOpen(false)}
                    className="px-5 py-2 bg-transparent border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg hover:border-slate-500 transition-colors"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-blue-950/30 border border-blue-500/50 hover:bg-blue-900/40 text-blue-400 text-xs font-bold rounded-lg transition-colors shadow-lg"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
