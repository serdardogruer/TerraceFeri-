import { PrismaClient } from '@prisma-clients/fault';

const globalForFaultPrisma = globalThis as unknown as {
  prismaFault: PrismaClient | undefined;
};

const dbUrl = process.env.FAULT_DATABASE_URL || process.env.DATABASE_URL;

export const faultDb =
  globalForFaultPrisma.prismaFault ??
  new PrismaClient({
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForFaultPrisma.prismaFault = faultDb;
