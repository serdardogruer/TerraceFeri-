import { PrismaClient } from '@prisma-clients/core';

const globalForCorePrisma = globalThis as unknown as {
  prismaCore: PrismaClient | undefined;
};

const dbUrl = process.env.CORE_DATABASE_URL || process.env.DATABASE_URL;

export const coreDb =
  globalForCorePrisma.prismaCore ??
  new PrismaClient({
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForCorePrisma.prismaCore = coreDb;
}
