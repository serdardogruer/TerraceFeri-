import { PrismaClient } from '@prisma-clients/area';

const globalForAreaPrisma = globalThis as unknown as {
  prismaArea: PrismaClient | undefined;
};

const dbUrl = process.env.AREA_DATABASE_URL || process.env.DATABASE_URL;

export const areaDb =
  globalForAreaPrisma.prismaArea ??
  new PrismaClient({
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForAreaPrisma.prismaArea = areaDb;
}
