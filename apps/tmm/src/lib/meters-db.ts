import fs from 'fs';
import path from 'path';

export interface Meter {
  id: string;
  meterNo: string;
  name: string;
  type: string;
  unit: string;
  location?: string;
}

export interface MeterReading {
  id: string;
  meterId: string;
  meterNo: string;
  type: string;
  unit: string;
  location?: string;
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
  notes: string;
}

interface MetersDbData {
  meters: Meter[];
  readings: MeterReading[];
}

function getPossibleDataFilePaths(): string[] {
  const cwd = process.cwd();
  return [
    path.join(cwd, 'data', 'meters_data.json'),
    path.join(cwd, 'apps', 'tmm', 'data', 'meters_data.json'),
    path.join(cwd, '..', 'data', 'meters_data.json'),
    path.join(cwd, '..', 'apps', 'tmm', 'data', 'meters_data.json'),
  ];
}

function getDataFilePath(): string {
  const paths = getPossibleDataFilePaths();
  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  const defaultDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(defaultDir)) {
    try {
      fs.mkdirSync(defaultDir, { recursive: true });
    } catch {}
  }
  return path.join(defaultDir, 'meters_data.json');
}

function ensureDataFile(): MetersDbData {
  const possiblePaths = getPossibleDataFilePaths();

  // Try all possible locations and pick the one with data
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.meters) && Array.isArray(parsed.readings) && parsed.readings.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error reading meters_data.json from', filePath, e);
      }
    }
  }

  // Check if primary path exists with at least meters array
  const primaryPath = getDataFilePath();
  if (fs.existsSync(primaryPath)) {
    try {
      const content = fs.readFileSync(primaryPath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.meters) && Array.isArray(parsed.readings)) {
        return parsed;
      }
    } catch {}
  }

  const initialData: MetersDbData = {
    meters: [
      { id: 'm-elek-main', meterNo: 'ELEK-ANA-01', name: 'Elektrik T1', type: 'Elektrik', unit: 'kWh' },
      { id: 'm-gas-main', meterNo: 'GAS-ANA-01', name: 'Doğalgaz', type: 'Doğalgaz', unit: 'm³' },
      { id: 'm-su-daire', meterNo: 'SU-DAIRE-01', name: 'Su Daireler', type: 'Su', unit: 'm³' },
      { id: 'm-su-dukkan', meterNo: 'SU-DUKKAN-01', name: 'Su Dükkanlar', type: 'Su', unit: 'm³' }
    ],
    readings: []
  };

  try {
    fs.writeFileSync(primaryPath, JSON.stringify(initialData, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error initializing meters_data.json:', e);
  }

  return initialData;
}

export class MetersDB {
  static getData(): MetersDbData {
    return ensureDataFile();
  }

  static saveData(data: MetersDbData): void {
    try {
      const filePath = getDataFilePath();
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

      // Also sync to root data directory if running from subfolder
      const rootDataFile = path.join(process.cwd(), 'data', 'meters_data.json');
      if (rootDataFile !== filePath && fs.existsSync(path.join(process.cwd(), 'data'))) {
        fs.writeFileSync(rootDataFile, JSON.stringify(data, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error('Error writing meters_data.json:', e);
    }
  }

  static getMeters(): Meter[] {
    return this.getData().meters;
  }

  static getReadings(): MeterReading[] {
    return this.getData().readings;
  }

  static addOrUpdateReading(reading: MeterReading): MeterReading {
    const data = this.getData();
    const idx = data.readings.findIndex(r => r.id === reading.id);
    if (idx !== -1) {
      data.readings[idx] = reading;
    } else {
      // Find if same meter + same date exists to avoid duplicate entries for the same day
      const sameIdx = data.readings.findIndex(r => r.meterId === reading.meterId && r.readDate === reading.readDate);
      if (sameIdx !== -1) {
        data.readings[sameIdx] = { ...data.readings[sameIdx], ...reading, id: data.readings[sameIdx].id };
      } else {
        data.readings.unshift(reading);
      }
    }
    this.saveData(data);
    return reading;
  }

  static deleteReading(id: string): boolean {
    const data = this.getData();
    const initialLen = data.readings.length;
    data.readings = data.readings.filter(r => r.id !== id);
    if (data.readings.length !== initialLen) {
      this.saveData(data);
      return true;
    }
    return false;
  }

  static addMeter(meter: Meter): Meter {
    const data = this.getData();
    data.meters.push(meter);
    this.saveData(data);
    return meter;
  }

  static deleteMeter(id: string): boolean {
    const data = this.getData();
    data.meters = data.meters.filter(m => m.id !== id);
    data.readings = data.readings.filter(r => r.meterId !== id);
    this.saveData(data);
    return true;
  }
}
