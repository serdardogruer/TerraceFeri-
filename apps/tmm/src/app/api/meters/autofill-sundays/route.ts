import { NextRequest, NextResponse } from 'next/server';
import { MetersDB, MeterReading } from '@/lib/meters-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const now = new Date();
    const targetYear = body.year ? Number(body.year) : now.getFullYear();
    const targetMonth = body.month ? Number(body.month) : now.getMonth() + 1; // 1-12

    const meters = MetersDB.getMeters();
    let readings = MetersDB.getReadings();

    const elekMeter = meters.find(m => m.type === 'Elektrik') || { id: 'm-elek-main', meterNo: 'ELEK-ANA-01', type: 'Elektrik', unit: 'kWh' };
    const gasMeter = meters.find(m => m.type === 'Doğalgaz') || { id: 'm-gas-main', meterNo: 'GAS-ANA-01', type: 'Doğalgaz', unit: 'm³' };
    const suDaireMeter = meters.find(m => m.id === 'm-su-daire' || m.name.toLowerCase().includes('daire')) || { id: 'm-su-daire', meterNo: 'SU-DAIRE-01', type: 'Su', unit: 'm³' };
    const suDukMeter = meters.find(m => m.id === 'm-su-dukkan' || m.name.toLowerCase().includes('dükkan')) || { id: 'm-su-dukkan', meterNo: 'SU-DUKKAN-01', type: 'Su', unit: 'm³' };

    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    let filledSundaysCount = 0;
    const filledDates: string[] = [];

    // Helper to get reading by meter type & date
    const getReading = (dateStr: string, readingsList = readings) => {
      const dateReadings = readingsList.filter(r => r.readDate === dateStr);
      const elek = dateReadings.find(r => r.type === 'Elektrik');
      const gas = dateReadings.find(r => r.type === 'Doğalgaz');
      let suDaire = dateReadings.find(r => r.type === 'Su' && (r.meterId === suDaireMeter.id || (r.notes && r.notes.includes('Daire'))));
      let suDuk = dateReadings.find(r => r.type === 'Su' && (r.meterId === suDukMeter.id || (r.notes && r.notes.includes('Dükkan'))));
      if (!suDaire && !suDuk) {
        suDaire = dateReadings.find(r => r.type === 'Su');
      }
      return { elek, gas, suDaire, suDuk };
    };

    // Calculate trailing average daily consumption before a given date
    const getTrailingDailyAvg = (dateStr: string) => {
      const pastDates = readings
        .filter(r => r.readDate < dateStr && ((r.aktif && r.aktif > 0) || (r.value && r.value > 0)))
        .map(r => r.readDate)
        .filter((d, idx, arr) => arr.indexOf(d) === idx)
        .sort()
        .slice(-5); // last 5 recorded days

      if (pastDates.length < 2) {
        return { aktif: 5, gas: 280, suDaire: 20, suDuk: 0, reaktif: 0, kapasitif: 0 };
      }

      let diffSumAktif = 0, countAktif = 0;
      let diffSumGas = 0, countGas = 0;
      let diffSumSuDaire = 0, countSuDaire = 0;
      let diffSumSuDuk = 0, countSuDuk = 0;

      for (let i = 1; i < pastDates.length; i++) {
        const pDate = pastDates[i - 1];
        const cDate = pastDates[i];
        const prevR = getReading(pDate);
        const currR = getReading(cDate);

        if (currR.elek && prevR.elek && currR.elek.aktif > 0 && prevR.elek.aktif > 0 && currR.elek.aktif >= prevR.elek.aktif) {
          diffSumAktif += (currR.elek.aktif - prevR.elek.aktif);
          countAktif++;
        }
        if (currR.gas && prevR.gas && currR.gas.value > 0 && prevR.gas.value > 0 && currR.gas.value >= prevR.gas.value) {
          diffSumGas += (currR.gas.value - prevR.gas.value);
          countGas++;
        }
        if (currR.suDaire && prevR.suDaire && currR.suDaire.value > 0 && prevR.suDaire.value > 0 && currR.suDaire.value >= prevR.suDaire.value) {
          diffSumSuDaire += (currR.suDaire.value - prevR.suDaire.value);
          countSuDaire++;
        }
        if (currR.suDuk && prevR.suDuk && currR.suDuk.value > 0 && prevR.suDuk.value > 0 && currR.suDuk.value >= prevR.suDuk.value) {
          diffSumSuDuk += (currR.suDuk.value - prevR.suDuk.value);
          countSuDuk++;
        }
      }

      return {
        aktif: countAktif > 0 ? Math.round(diffSumAktif / countAktif) : 5,
        gas: countGas > 0 ? Math.round(diffSumGas / countGas) : 280,
        suDaire: countSuDaire > 0 ? Math.round(diffSumSuDaire / countSuDaire) : 20,
        suDuk: countSuDuk > 0 ? Math.round(diffSumSuDuk / countSuDuk) : 0,
        reaktif: 0,
        kapasitif: 0
      };
    };

    const daysDiff = (d1: string, d2: string) => {
      const t1 = new Date(d1).getTime();
      const t2 = new Date(d2).getTime();
      return Math.max(1, Math.round(Math.abs(t2 - t1) / (1000 * 60 * 60 * 24)));
    };

    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(targetYear, targetMonth - 1, day);
      if (dateObj.getDay() !== 0) continue; // Only Sundays

      const mStr = String(targetMonth).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const sundayStr = `${targetYear}-${mStr}-${dStr}`;

      // Henüz gelinmemiş gelecek Pazar günlerini boş bırak (yalnızca geçmiş Pazarlar doldurulur)
      if (sundayStr > todayStr) continue;

      const sundayReadings = getReading(sundayStr);
      const isAlreadyFilled = (sundayReadings.elek && sundayReadings.elek.aktif > 0) &&
                              (sundayReadings.gas && sundayReadings.gas.value > 0) &&
                              (sundayReadings.suDaire && sundayReadings.suDaire.value > 0);
      if (isAlreadyFilled) continue;

      // Find closest preceding valid date (e.g. Saturday)
      const prevValidDates = readings
        .filter(r => r.readDate < sundayStr && ((r.aktif && r.aktif > 0) || (r.value && r.value > 0)))
        .map(r => r.readDate)
        .filter((d, idx, arr) => arr.indexOf(d) === idx)
        .sort();

      const prevValidDate = prevValidDates.length > 0 ? prevValidDates[prevValidDates.length - 1] : null;
      if (!prevValidDate) continue; // Cannot extrapolate without prior data
      const satR = getReading(prevValidDate);

      // Find closest subsequent valid date (e.g. Monday)
      const nextValidDates = readings
        .filter(r => r.readDate > sundayStr && ((r.aktif && r.aktif > 0) || (r.value && r.value > 0)))
        .map(r => r.readDate)
        .filter((d, idx, arr) => arr.indexOf(d) === idx)
        .sort();

      const nextValidDate = nextValidDates.length > 0 ? nextValidDates[0] : null;
      const monR = nextValidDate ? getReading(nextValidDate) : null;

      const avg = getTrailingDailyAvg(sundayStr);
      const totalSpanDays = nextValidDate ? daysDiff(prevValidDate, nextValidDate) : 2;
      const sundayOffsetDays = daysDiff(prevValidDate, sundayStr);

      // 1. Elektrik Estimate
      let calcAktif = 0;
      let calcReaktif = satR.elek?.reaktif || 4118;
      let calcKap = satR.elek?.kapasitif || 238;

      if (satR.elek && satR.elek.aktif > 0) {
        if (monR?.elek && monR.elek.aktif > satR.elek.aktif) {
          const totalDiff = monR.elek.aktif - satR.elek.aktif;
          calcAktif = Math.round(satR.elek.aktif + (totalDiff * sundayOffsetDays) / totalSpanDays);
          
          const totalReaktifDiff = (monR.elek.reaktif || satR.elek.reaktif) - (satR.elek.reaktif || 0);
          calcReaktif = Math.round((satR.elek.reaktif || 0) + (totalReaktifDiff * sundayOffsetDays) / totalSpanDays);

          const totalKapDiff = (monR.elek.kapasitif || satR.elek.kapasitif) - (satR.elek.kapasitif || 0);
          calcKap = Math.round((satR.elek.kapasitif || 0) + (totalKapDiff * sundayOffsetDays) / totalSpanDays);
        } else {
          calcAktif = satR.elek.aktif + avg.aktif * sundayOffsetDays;
        }
      }

      // 2. Doğalgaz Estimate
      let calcGas = 0;
      if (satR.gas && satR.gas.value > 0) {
        if (monR?.gas && monR.gas.value > satR.gas.value) {
          const totalDiff = monR.gas.value - satR.gas.value;
          calcGas = Math.round(satR.gas.value + (totalDiff * sundayOffsetDays) / totalSpanDays);
        } else {
          calcGas = satR.gas.value + avg.gas * sundayOffsetDays;
        }
      }

      // 3. Su Daireler Estimate
      let calcSuDaire = 0;
      if (satR.suDaire && satR.suDaire.value > 0) {
        if (monR?.suDaire && monR.suDaire.value > satR.suDaire.value) {
          const totalDiff = monR.suDaire.value - satR.suDaire.value;
          calcSuDaire = Math.round(satR.suDaire.value + (totalDiff * sundayOffsetDays) / totalSpanDays);
        } else {
          calcSuDaire = satR.suDaire.value + avg.suDaire * sundayOffsetDays;
        }
      }

      // 4. Su Dükkanlar Estimate
      let calcSuDuk = satR.suDuk?.value || 202;
      if (satR.suDuk && satR.suDuk.value > 0) {
        if (monR?.suDuk && monR.suDuk.value > satR.suDuk.value) {
          const totalDiff = monR.suDuk.value - satR.suDuk.value;
          calcSuDuk = Math.round(satR.suDuk.value + (totalDiff * sundayOffsetDays) / totalSpanDays);
        } else {
          calcSuDuk = satR.suDuk.value + avg.suDuk * sundayOffsetDays;
        }
      }

      // Save / Update to DB
      if (calcAktif > 0) {
        MetersDB.addOrUpdateReading({
          id: `r-${sundayStr}-${elekMeter.id}`,
          meterId: elekMeter.id,
          meterNo: elekMeter.meterNo,
          type: 'Elektrik',
          unit: 'kWh',
          readDate: sundayStr,
          readTime: '10:00',
          aktif: calcAktif,
          prevAktif: satR.elek?.aktif || calcAktif,
          reaktif: calcReaktif,
          prevReaktif: satR.elek?.reaktif || calcReaktif,
          kapasitif: calcKap,
          prevKapasitif: satR.elek?.kapasitif || calcKap,
          value: calcAktif,
          prevValue: satR.elek?.aktif || calcAktif,
          status: 'Otomatik',
          notes: 'Pazar otomatik tahmin'
        });
      }

      if (calcGas > 0) {
        MetersDB.addOrUpdateReading({
          id: `r-${sundayStr}-${gasMeter.id}`,
          meterId: gasMeter.id,
          meterNo: gasMeter.meterNo,
          type: 'Doğalgaz',
          unit: 'm³',
          readDate: sundayStr,
          readTime: '10:00',
          value: calcGas,
          prevValue: satR.gas?.value || calcGas,
          aktif: 0,
          prevAktif: 0,
          reaktif: 0,
          prevReaktif: 0,
          kapasitif: 0,
          prevKapasitif: 0,
          status: 'Otomatik',
          notes: 'Pazar otomatik tahmin'
        });
      }

      if (calcSuDaire > 0) {
        MetersDB.addOrUpdateReading({
          id: `r-${sundayStr}-${suDaireMeter.id}`,
          meterId: suDaireMeter.id,
          meterNo: suDaireMeter.meterNo,
          type: 'Su',
          unit: 'm³',
          readDate: sundayStr,
          readTime: '10:00',
          value: calcSuDaire,
          prevValue: satR.suDaire?.value || calcSuDaire,
          aktif: 0,
          prevAktif: 0,
          reaktif: 0,
          prevReaktif: 0,
          kapasitif: 0,
          prevKapasitif: 0,
          status: 'Otomatik',
          notes: 'Daireler Pazar otomatik tahmin'
        });
      }

      if (calcSuDuk > 0) {
        MetersDB.addOrUpdateReading({
          id: `r-${sundayStr}-${suDukMeter.id}`,
          meterId: suDukMeter.id,
          meterNo: suDukMeter.meterNo,
          type: 'Su',
          unit: 'm³',
          readDate: sundayStr,
          readTime: '10:00',
          value: calcSuDuk,
          prevValue: satR.suDuk?.value || calcSuDuk,
          aktif: 0,
          prevAktif: 0,
          reaktif: 0,
          prevReaktif: 0,
          kapasitif: 0,
          prevKapasitif: 0,
          status: 'Otomatik',
          notes: 'Dükkanlar Pazar otomatik tahmin'
        });
      }

      filledSundaysCount++;
      filledDates.push(sundayStr);
      // Refresh local readings list for consecutive Sundays
      readings = MetersDB.getReadings();
    }

    const updatedReadings = MetersDB.getReadings();
    return NextResponse.json({
      success: true,
      filledCount: filledSundaysCount,
      filledDates,
      readings: updatedReadings,
      message: `${filledSundaysCount} adet Pazar günü tüketim trendine göre otomatik olarak dolduruldu.`
    });
  } catch (error) {
    console.error('Error auto-filling Sundays:', error);
    return NextResponse.json({ success: false, message: 'Otomatik doldurma hatası' }, { status: 500 });
  }
}
