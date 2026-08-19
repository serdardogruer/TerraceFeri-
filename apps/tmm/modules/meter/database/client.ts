import { PrismaClient } from '@prisma-clients/meter';

declare global {
  var meterDbInstance: PrismaClient | undefined;
}

const defaultUrl = process.env.METER_DATABASE_URL || process.env.DATABASE_URL;

export const meterDb = global.meterDbInstance || new PrismaClient({
  ...(defaultUrl ? { datasources: { db: { url: defaultUrl } } } : {})
});

if (process.env.NODE_ENV !== 'production') {
  global.meterDbInstance = meterDb;
}
