import { PrismaClient } from '@prisma-clients/company';

const globalForCompanyPrisma = globalThis as unknown as {
  prismaCompany: PrismaClient | undefined;
};

const dbUrl = process.env.COMPANY_DATABASE_URL || process.env.DATABASE_URL;

export const companyDb =
  globalForCompanyPrisma.prismaCompany ??
  new PrismaClient({
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForCompanyPrisma.prismaCompany = companyDb;
