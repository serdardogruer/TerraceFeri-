import { PrismaClient } from '@prisma-clients/management';

const globalForManagementPrisma = globalThis as unknown as {
  prismaManagement: PrismaClient | undefined;
};

const dbUrl = process.env.MANAGEMENT_DATABASE_URL || process.env.DATABASE_URL;

export const managementDb =
  globalForManagementPrisma.prismaManagement ??
  new PrismaClient({
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForManagementPrisma.prismaManagement = managementDb;
