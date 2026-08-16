import { PrismaClient } from '@prisma-clients/apartment';

const globalForApartmentPrisma = globalThis as unknown as {
  prismaApartment: PrismaClient | undefined;
};

const dbUrl = process.env.APARTMENT_DATABASE_URL || process.env.DATABASE_URL;

export const apartmentDb =
  globalForApartmentPrisma.prismaApartment ??
  new PrismaClient({
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForApartmentPrisma.prismaApartment = apartmentDb;
}
