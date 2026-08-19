import { meterDb } from '@modules/meter/database/client';

export interface Meter {
  id: string;
  meterNo: string;
  name: string;
  type: string;
  unit: string;
  location?: string | null;
}

export interface MeterReading {
  id: string;
  meterId: string;
  meterNo: string;
  type: string;
  unit: string;
  location?: string | null;
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
  notes?: string | null;
}

export class MetersDB {
  static async getMeters(): Promise<Meter[]> {
    try {
      const meters = await meterDb.meter.findMany({
        orderBy: { createdAt: 'asc' }
      });
      if (meters.length === 0) {
        // İlk başlangıç sayaçları
        const defaultMeters = [
          { id: 'm-elek-main', meterNo: 'ELEK-ANA-01', name: 'Elektrik T1', type: 'Elektrik', unit: 'kWh' },
          { id: 'm-gas-main', meterNo: 'GAS-ANA-01', name: 'Doğalgaz', type: 'Doğalgaz', unit: 'm³' },
          { id: 'm-su-daire', meterNo: 'SU-DAIRE-01', name: 'Su Daireler', type: 'Su', unit: 'm³' },
          { id: 'm-su-dukkan', meterNo: 'SU-DUKKAN-01', name: 'Su Dükkanlar', type: 'Su', unit: 'm³' },
        ];
        for (const m of defaultMeters) {
          await meterDb.meter.upsert({
            where: { meterNo: m.meterNo },
            update: { ...m },
            create: { ...m }
          }).catch(() => {});
        }
        return await meterDb.meter.findMany({ orderBy: { createdAt: 'asc' } });
      }
      return meters;
    } catch (error) {
      console.error('Error fetching meters from DB:', error);
      return [];
    }
  }

  static async getReadings(): Promise<MeterReading[]> {
    try {
      const readings = await meterDb.meterReading.findMany({
        orderBy: [{ readDate: 'desc' }, { readTime: 'desc' }]
      });
      return readings;
    } catch (error) {
      console.error('Error fetching meter readings from DB:', error);
      return [];
    }
  }

  static async addOrUpdateReading(reading: Partial<MeterReading> & { meterId: string; readDate: string }): Promise<MeterReading> {
    const meter = (await this.getMeters()).find(m => m.id === reading.meterId);
    const readingId = reading.id || `r-${reading.readDate}-${reading.meterId}`;
    const meterNo = reading.meterNo || meter?.meterNo || 'UNKNOWN';
    const type = reading.type || meter?.type || 'Elektrik';
    const unit = reading.unit || meter?.unit || (type === 'Elektrik' ? 'kWh' : 'm³');

    const dataPayload = {
      meterId: reading.meterId,
      meterNo,
      type,
      unit,
      location: reading.location || null,
      readDate: reading.readDate,
      readTime: reading.readTime || '10:00',
      aktif: Number(reading.aktif ?? 0),
      prevAktif: Number(reading.prevAktif ?? 0),
      reaktif: Number(reading.reaktif ?? 0),
      prevReaktif: Number(reading.prevReaktif ?? 0),
      kapasitif: Number(reading.kapasitif ?? 0),
      prevKapasitif: Number(reading.prevKapasitif ?? 0),
      value: Number(reading.value ?? (reading.aktif ?? 0)),
      prevValue: Number(reading.prevValue ?? 0),
      status: reading.status || 'Normal',
      notes: reading.notes || null,
    };

    const saved = await meterDb.meterReading.upsert({
      where: {
        meterId_readDate: {
          meterId: reading.meterId,
          readDate: reading.readDate
        }
      },
      update: dataPayload,
      create: {
        id: readingId,
        ...dataPayload
      }
    });

    return saved;
  }

  static async deleteReading(id: string): Promise<boolean> {
    try {
      await meterDb.meterReading.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting reading from DB:', error);
      return false;
    }
  }

  static async addMeter(meter: Omit<Meter, 'id'> & { id?: string }): Promise<Meter> {
    const newMeter = await meterDb.meter.upsert({
      where: { meterNo: meter.meterNo },
      update: {
        name: meter.name,
        type: meter.type,
        unit: meter.unit,
        location: meter.location || null
      },
      create: {
        id: meter.id || `m-${Date.now()}`,
        meterNo: meter.meterNo,
        name: meter.name,
        type: meter.type,
        unit: meter.unit,
        location: meter.location || null
      }
    });
    return newMeter;
  }

  static async deleteMeter(id: string): Promise<boolean> {
    try {
      await meterDb.meter.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting meter from DB:', error);
      return false;
    }
  }
}
