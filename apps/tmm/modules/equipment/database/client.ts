import { PrismaClient } from '@prisma-clients/equipment';

const globalForEquipmentPrisma = globalThis as unknown as {
  prismaEquipment: PrismaClient | undefined;
};

const dbUrl = process.env.EQUIPMENT_DATABASE_URL || process.env.DATABASE_URL;

export const equipmentDb =
  globalForEquipmentPrisma.prismaEquipment ??
  new PrismaClient({
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForEquipmentPrisma.prismaEquipment = equipmentDb;
