import { MetersDB, Meter, MeterReading } from './meters-db';

export type { Meter, MeterReading };

export const mockDb = {
  get meters() {
    return MetersDB.getMeters();
  },
  set meters(val: Meter[]) {
    const data = MetersDB.getData();
    data.meters = val;
    MetersDB.saveData(data);
  },
  get readings() {
    return MetersDB.getReadings();
  },
  set readings(val: MeterReading[]) {
    const data = MetersDB.getData();
    data.readings = val;
    MetersDB.saveData(data);
  }
};
